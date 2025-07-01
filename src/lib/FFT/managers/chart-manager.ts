import { DataManager } from "./data-manager";
import { FftDisplayManager } from "./chart-display-manager";
import type {
  MarkersCallbacks,
  FftDisplayCallbacks,
  FftCallbacks,
} from "../types/fft-callbacks";
import type { FFTManagerConfig, FFTParams } from "../types/fft-manager";
import type { FrequencyUnit } from "../types/frequency-units";
import { ChartEventManager } from "./chart-event-manager";

export class FFTChartManager {
  private _chart: Highcharts.Chart;
  private _dataManager: DataManager;

  private _chartEventManager: ChartEventManager;
  private _displayManager: FftDisplayManager;

  constructor(chart: Highcharts.Chart, config?: FFTManagerConfig) {
    this._chart = chart;
    this._dataManager = new DataManager(chart, config);
    this._displayManager = new FftDisplayManager(
      chart,
      config?.defaultParams.displayUnit
    );
    this._chartEventManager = new ChartEventManager(chart);

    this.initialize_events();
  }

  private initialize_events() {
    this._chartEventManager.initialize({
      addMarker: this.markers.add,
    });
    this._chart.redraw();
  }

  setFftParams(params: Partial<FFTParams>) {
    const needsUpdate = this._dataManager.setFftParams(params);
    if (needsUpdate) {
      this._dataManager.validateMarkersPosition();
    }
  }

  updateFFTData(data: number[]) {
    if (!this._chart) return;
    // Update data manager
    const { fftData, maxHoldData } = this._dataManager.updateFFTData(data);
    this._displayManager.updateFFTSeries(fftData);
    this._dataManager.calculateChartBandPower(data);
    if (maxHoldData) {
      this._displayManager.updateMaxHoldSeries(maxHoldData);
    }
    this._dataManager.updateMarkersFromFFT(data);
  }

  get markers() {
    return {
      // Expose addMarker but internally pass the state
      add: (id: string, index: number, x: number) => {
        this._dataManager.addMarker(id, index, x);
      },
      getAll: () => {
        return this._dataManager.getMarkersData();
      },
      // Expose other marker methods you want to make public
      remove: (id: string) => {
        return this._dataManager.removeMarker(id);
      },

      updatePosition: (id: string, frequency: number) => {
        const { x: xValue, y: yValue } =
          this._dataManager.getPointPositionByFrequency(frequency);
        this._dataManager.updateMarker(id, xValue, yValue);
      },

      getPosition: (id: string) => {
        const marker = this._dataManager.getMarkersData()[id];
        return marker ? { frequency: marker.x, amplitude: marker.y } : null;
      },

      getFrequencyBounds: () => {
        const params = this._dataManager.getFftParams();
        return {
          min: params.centerFrequency - params.sampleRate / 2,
          max: params.centerFrequency + params.sampleRate / 2,
        };
      },

      // Expose callback registration
      addCallback: (
        callbackKey: keyof MarkersCallbacks,
        callback: MarkersCallbacks[keyof MarkersCallbacks]
      ) => {
        return this._dataManager.addCallback(callbackKey, callback);
      },
    };
  }

  addCallback(
    callbackKey: keyof FftCallbacks,
    callback: FftCallbacks[keyof FftCallbacks]
  ) {
    return this._dataManager.addCallback(callbackKey, callback);
  }

  get display() {
    return {
      setUnit: (unit: FrequencyUnit) => {
        this._displayManager.setDisplayUnit(unit);
        this._displayManager.updateChartFormatters(unit);
      },
      getUnit: () => this._displayManager.getDisplayUnit(),
      getAvailableUnits: (): FrequencyUnit[] => ["Hz", "kHz", "MHz", "GHz"],
      addCallback: (
        callbackKey: keyof FftDisplayCallbacks,
        callback: FftDisplayCallbacks[keyof FftDisplayCallbacks]
      ) => {
        return this._displayManager.addCallback(callbackKey, callback);
      },
    };
  }

  get maxHold() {
    return {
      enable: () => {
        this._dataManager.enableMaxHold();
        this._displayManager.showMaxHoldSeries(true);
        this._displayManager.updateChartTarget(true);
        this._chart.redraw();
      },
      disable: () => {
        this._dataManager.disableMaxHold();
        this._displayManager.showMaxHoldSeries(false);
        this._displayManager.updateChartTarget(false);

        this._chart.redraw();
      },
      isEnabled: () => this._dataManager.isMaxHoldEnabled(),
      onMaxHoldToggled: (callback: (enabled: boolean) => void) => {
        return this._dataManager.addCallback("onMaxHoldToggled", callback);
      },
    };
  }

  get bandPower() {
    return {
      getChartBandPower: () => this._dataManager.state.fftBandPower,
      getMarkersBandPower: () => this._dataManager.state.markersBandPower,
    };
  }

  get state() {
    return this._dataManager.state;
  }

  get chart() {
    return this._chart;
  }
}
