import { EventBus } from "@/lib/EventBus/eventBus";
import { zipArrays } from "@/lib/utils/helperFunctions";
import { DEFAULT_FFT_CONFIG } from "../config/fft-config";
import type { FftDataManagerCallbacks } from "../types/fft-callbacks";
import type { FFTDataManagerState } from "../types/fft-data-manager";
import type { FFTManagerConfig, FFTParams } from "../types/fft-manager";
import type { MarkerData } from "../types/fft-markers";
import { bandPowerCalculator } from "../utils/powerConverter";

export class DataManager {
  private _state: FFTDataManagerState;
  private readonly _chart: Highcharts.Chart;
  private eventBus = new EventBus<FftDataManagerCallbacks>();

  constructor(chart: Highcharts.Chart, config?: FFTManagerConfig) {
    const defaultParams =
      config?.defaultParams || DEFAULT_FFT_CONFIG.defaultParams;
    this._chart = chart;
    this._state = {
      fftParams: {
        sampleRate: 0,
        centerFrequency: 0,
        fftSize: 0,
      },
      frequencies: [],
      fftData: [],
      chartData: [],
      fftBandPower: 0,
      maxHoldEnabled: false,
      maxHoldData: [],
      maxHoldChartData: [],
      markers: {},
      markersBandPower: 0,
    };

    if (defaultParams.fftParams) {
      this.setFftParams({
        sampleRate: defaultParams.fftParams.sampleRate,
        centerFrequency: defaultParams.fftParams.centerFrequency,
        fftSize: defaultParams.fftParams.fftSize,
      });
    }
  }

  get state() {
    return this._state;
  }

  get chart() {
    return this._chart;
  }

  setFftParams(params: Partial<FFTParams>): boolean {
    const fftParams = this._state.fftParams;
    // Check if the new params are different from the previous ones
    const hasParamsChanged =
      (params.sampleRate !== undefined &&
        params.sampleRate !== fftParams.sampleRate) ||
      (params.centerFrequency !== undefined &&
        params.centerFrequency !== fftParams.centerFrequency) ||
      (params.fftSize !== undefined && params.fftSize !== fftParams.fftSize);

    if (hasParamsChanged) {
      Object.assign(fftParams, params);
      this._state.frequencies = this.generateFrequencies();
      // Reset max hold data when FFT params change
      this.resetMaxHold();

      return true; // Indicates chart needs update
    }

    return false;
  }

  getFftParams() {
    return this._state.fftParams;
  }

  private generateFrequencies() {
    const { sampleRate, centerFrequency, fftSize } = this._state.fftParams;
    const frequencies = [];
    const minPoint = centerFrequency - sampleRate / 2;
    const step = sampleRate / fftSize;

    for (let i = 0; i < fftSize; i++) {
      frequencies.push(minPoint + i * step);
    }

    return frequencies;
  }

  updateFFTData(data: number[]) {
    const zippedData = zipArrays(this._state.frequencies, data);
    this._state.fftData = data;
    this._state.chartData = zippedData;
    // Update max hold data if enabled
    let maxHoldData: [number, number][] | undefined;
    if (this._state.maxHoldEnabled) {
      this.updateMaxHoldData(data);
      maxHoldData = this._state.maxHoldChartData;
    }

    this.eventBus.emit("onFftDataChanged", data);

    return {
      fftData: zippedData,
      maxHoldData,
    };
  }

  getPointPositionByFrequency(x: number) {
    const closestIndex = this.findClosestIndex(x);
    const xValue = this._state.frequencies[closestIndex];
    let yValue: number;

    // Use the single target series variable
    if (this.state.maxHoldEnabled && this.state.maxHoldData.length > 0) {
      yValue = this.state.maxHoldData[closestIndex];
    } else {
      yValue = this.state.fftData[closestIndex];
    }

    return { x: xValue, y: yValue };
  }

  updateMaxHoldData(newData: number[]): void {
    // Initialize max hold data if empty
    if (this._state.maxHoldData.length === 0) {
      this._state.maxHoldData = [...newData];
      this._state.maxHoldChartData = [...this._state.chartData];
      return;
    }

    // Update max hold data by taking maximum of current and new data
    for (let i = 0; i < newData.length; i++) {
      if (newData[i] > this._state.maxHoldData[i]) {
        this._state.maxHoldData[i] = newData[i];
        this._state.maxHoldChartData[i] = [
          this._state.frequencies[i],
          newData[i],
        ];
      }
    }
  }

  enableMaxHold(): void {
    this._state.maxHoldEnabled = true;
    this.eventBus.emit("onMaxHoldToggled", true);
  }

  disableMaxHold(): void {
    this._state.maxHoldEnabled = false;
    this.eventBus.emit("onMaxHoldToggled", false);
  }

  resetMaxHold(): void {
    this._state.maxHoldData = [];
    this._state.maxHoldChartData = [];
  }

  isMaxHoldEnabled(): boolean {
    return this._state.maxHoldEnabled;
  }

  // Callback Management
  addCallback<T extends keyof FftDataManagerCallbacks>(
    callbackKey: T,
    callback: FftDataManagerCallbacks[T]
  ): () => void {
    this.eventBus.on(callbackKey, callback);
    return () => this.eventBus.off(callbackKey, callback);
  }

  findClosestIndex(x: number): number {
    const { centerFrequency, sampleRate, fftSize } = this._state.fftParams;
    const closestIndex = Math.round(
      (x - (centerFrequency - sampleRate / 2)) / (sampleRate / fftSize)
    );
    return Math.max(0, Math.min(closestIndex, fftSize - 1));
  }

  addMarker(id: string, index: number, x: number) {
    const { x: xValue, y: yValue } = this.getPointPositionByFrequency(x);
    this._chart.series[index].setData([{ x: xValue, y: yValue }], true);
    this.state.markers[id] = {
      id,
      seriesIndex: index,
      frequencyIndex: this.findClosestIndex(x),
      x: xValue,
      y: yValue,
      color: this.chart.series[index].color as string,
      marker: this.chart.series[index],
    };
    this.chart.redraw();
    this.notifyMarkersChanged();
    this.notifyMarkerAdded(this.state.markers[id]);
  }

  calculateMarkersBandPower(fftData: number[]) {
    const markersByIndex = Object.values(this.state.markers).map((marker) =>
      this.findClosestIndex(marker.x)
    );
    const minMarkerIndex = Math.min(...markersByIndex);
    const maxMarkerIndex = Math.max(...markersByIndex);

    if (
      fftData[minMarkerIndex] === undefined ||
      fftData[maxMarkerIndex] === undefined
    )
      return;

    const bandPower = bandPowerCalculator(
      fftData.slice(minMarkerIndex, maxMarkerIndex)
    );
    this.state.markersBandPower = bandPower;
    this.eventBus.emit("onMarkersBandPowerChanged", bandPower);
  }

  calculateChartBandPower(fftData: number[]) {
    const bandPower = bandPowerCalculator(fftData);
    this.state.fftBandPower = bandPower;
    this.eventBus.emit("onChartBandPowerChanged", bandPower);
  }

  updateMarker(id: string, x: number, y: number) {
    const marker = this.state.markers[id];
    if (marker) {
      marker.x = x;
      marker.y = y;
      marker.marker.setData([{ x: x, y: y }], true, false, true);
      this.notifyMarkersChanged();
      this.notifyMarkerUpdated(this.state.markers[id]);
    }
  }

  removeMarker(id: string, reason?: string) {
    const marker = this.state.markers[id];
    if (marker) {
      const markerToRemove = { ...marker };
      delete this.state.markers[id];
      marker.marker.setData([], true, false, true);
      this.notifyMarkerRemoved(markerToRemove, reason);
      this.notifyMarkersChanged();
    }
  }

  updateMarkersFromFFT(fftData: number[]) {
    if (Object.keys(this.state.markers).length === 0) return;
    Object.keys(this.state.markers).forEach((markerId) => {
      const marker = this.state.markers[markerId];
      if (!marker) return;

      const { x, y } = this.getPointPositionByFrequency(marker.x);

      this.updateMarker(markerId, x, y);
    });

    if (Object.keys(this.state.markers).length === 2) {
      this.calculateMarkersBandPower(fftData);
    }
  }

  validateMarkersPosition() {
    const { centerFrequency, sampleRate } = this.state.fftParams;
    const maxFrequency = centerFrequency + sampleRate / 2;
    const minFrequency = centerFrequency - sampleRate / 2;

    Object.values(this.state.markers).forEach((marker) => {
      if (marker.x > maxFrequency || marker.x < minFrequency) {
        this.removeMarker(marker.id, "out of range");
        return false;
      }
    });
  }

  getMarkersData() {
    return { ...this.state.markers };
  }

  private notifyMarkersChanged() {
    this.eventBus.emit("onMarkersChanged", this.getMarkersData());
  }

  private notifyMarkerAdded(marker: MarkerData) {
    this.eventBus.emit("onMarkerAdded", marker);
  }

  private notifyMarkerRemoved(marker: MarkerData, reason?: string) {
    this.eventBus.emit("onMarkerRemoved", marker, reason);
  }

  private notifyMarkerUpdated(marker: MarkerData) {
    this.eventBus.emit("onMarkerUpdated", marker);
  }
}
