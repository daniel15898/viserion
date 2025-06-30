import { EventBus } from "@/lib/EventBus/eventBus";
import { zipArrays } from "@/lib/utils/helperFunctions";
import { DEFAULT_FFT_CONFIG } from "../config/fft-config";
import type { FftCallbacks } from "../types/fft-callbacks";
import type { FFTDataManagerState } from "../types/fft-data-manager";
import type { FFTManagerConfig, FFTParams } from "../types/fft-manager";

export class DataManager {
  private _state: FFTDataManagerState;
  private eventBus = new EventBus<FftCallbacks>();

  constructor(config?: FFTManagerConfig) {
    const defaultParams =
      config?.defaultParams || DEFAULT_FFT_CONFIG.defaultParams;
    this._state = {
      fftParams: {
        sampleRate: 0,
        centerFrequency: 0,
        fftSize: 0,
      },
      frequencies: [],
      fftData: [],
      chartData: [],
      maxHoldEnabled: false,
      maxHoldData: [],
      maxHoldChartData: [],
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

    this.notifyFftDataChanged(data);

    return {
      fftData: zippedData,
      maxHoldData,
    };
  }

  getPointPositionByTarget(x: number) {
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
    this.notifyMaxHoldToggled(true);
  }

  disableMaxHold(): void {
    this._state.maxHoldEnabled = false;
    this.notifyMaxHoldToggled(false);
  }

  resetMaxHold(): void {
    this._state.maxHoldData = [];
    this._state.maxHoldChartData = [];
  }

  isMaxHoldEnabled(): boolean {
    return this._state.maxHoldEnabled;
  }

  // Callback Management
  addCallback<T extends keyof FftCallbacks>(
    callbackKey: T,
    callback: FftCallbacks[T]
  ): () => void {
    this.eventBus.on(callbackKey, callback);
    return () => this.eventBus.off(callbackKey, callback);
  }

  private notifyFftDataChanged(data: number[]): void {
    this.eventBus.emit("onFftDataChanged", data);
  }

  private notifyMaxHoldToggled(enabled: boolean): void {
    this.eventBus.emit("onMaxHoldToggled", enabled);
  }

  findClosestIndex(x: number): number {
    const { centerFrequency, sampleRate, fftSize } = this._state.fftParams;
    const closestIndex = Math.round(
      (x - (centerFrequency - sampleRate / 2)) / (sampleRate / fftSize)
    );
    return Math.max(0, Math.min(closestIndex, fftSize - 1));
  }
}
