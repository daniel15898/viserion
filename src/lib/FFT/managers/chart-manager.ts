import { CHART_CONFIG } from "../config/fft-config";
import { MarkerManager } from "./markers-manager";
import { DataManager } from "./data-manager";
import { FftDisplayManager } from "./chart-display-manager";
import type {
  MarkersCallbacks,
  FftDisplayCallbacks,
} from "../types/fft-callbacks";
import type { TargetSeries } from "../types/fft-data-manager";
import type { FFTManagerConfig, FFTParams } from "../types/fft-manager";
import type { FrequencyUnit } from "../types/frequency-units";

export class FFTChartManager {
  private _chart: Highcharts.Chart;
  private _markerManager: MarkerManager;
  private _dataManager: DataManager;
  private _displayManager: FftDisplayManager;

  constructor(chart: Highcharts.Chart, config?: FFTManagerConfig) {
    this._chart = chart;
    this._markerManager = new MarkerManager(chart);
    this._dataManager = new DataManager(config);
    this._displayManager = new FftDisplayManager(
      chart,
      config?.defaultParams.displayUnit
    );

    this.initialize_events();
  }

  private initialize_events() {
    this.setupChartClickHandler();
    this._chart.redraw();
  }

  private setupChartClickHandler() {
    const fftChart = this._chart.series[CHART_CONFIG.FFT.index];
    const maxHoldChart = this._chart.series[CHART_CONFIG.MAX_HOLD.index];
    if (!fftChart) return;
    // Setup series click handler
    fftChart.update({
      type: "spline",
      events: {
        click: (event) =>
          this.handleSeriesClick(
            event as Highcharts.SeriesClickEventObject & MouseEvent
          ),
      },
    });

    // Setup chart click handler
    this._chart.update(
      {
        chart: {
          events: {
            click: (event) =>
              this.handleChartClick(event as Highcharts.ChartClickEventObject),
          },
        },
      },
      false
    );
    if (maxHoldChart) {
      maxHoldChart.update({
        type: "spline",
        events: {
          click: (event) =>
            this.handleSeriesClick(
              event as Highcharts.SeriesClickEventObject & MouseEvent
            ),
        },
      });
    }
  }
  private addMarkerBasedOnModifier(event: MouseEvent, x: number) {
    if (event.metaKey || event.altKey) {
      this.addMarker(
        CHART_CONFIG.MARKER_ONE.id,
        CHART_CONFIG.MARKER_ONE.index,
        x
      );
    }

    if (event.shiftKey) {
      this.addMarker(
        CHART_CONFIG.MARKER_TWO.id,
        CHART_CONFIG.MARKER_TWO.index,
        x
      );
    }
  }

  private handleChartClick(event: Highcharts.ChartClickEventObject) {
    const x = event.xAxis[0].value;
    this.addMarkerBasedOnModifier(event, x);
  }

  private handleSeriesClick(
    event: Highcharts.SeriesClickEventObject & MouseEvent
  ) {
    const { x } = event.point;
    if (!x) return;
    this.addMarkerBasedOnModifier(event, x);
  }

  get chart() {
    return this._chart;
  }

  setFftParams(params: Partial<FFTParams>) {
    const needsUpdate = this._dataManager.setFftParams(params);
    if (needsUpdate) {
      this._markerManager.validateMarkersPosition(
        this._dataManager.getFftParams()
      );
    }
  }

  updateFFTData(data: number[]) {
    if (!this._chart) return;
    // Update data manager
    const { fftData, maxHoldData } = this._dataManager.updateFFTData(data);
    this._displayManager.updateFFTSeries(fftData);
    if (maxHoldData) {
      this._displayManager.updateMaxHoldSeries(maxHoldData);
    }
    this._markerManager.updateMarkersFromFFT(this._dataManager.state);
  }

  private addMarker(id: string, index: number, x: number) {
    const { x: xValue, y: yValue } =
      this._dataManager.getPointPositionByTarget(x);
    this._markerManager.addMarker(id, index, xValue, yValue);
  }

  get markers() {
    return {
      // Expose addMarker but internally pass the state
      add: (id: string, index: number, x: number) => {
        return this.addMarker(id, index, x);
      },
      getAll: () => {
        return this._markerManager.getMarkersData();
      },
      // Expose other marker methods you want to make public
      remove: (id: string) => {
        return this._markerManager.removeMarker(id);
      },

      updatePosition: (id: string, frequency: number) => {
        const { x: validatedX, y: yValue } =
          this._dataManager.getPointPositionByTarget(frequency);
        this._markerManager.updateMarker(id, validatedX, yValue);
      },

      getPosition: (id: string) => {
        const marker = this._markerManager.getMarkersData()[id];
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
        return this._markerManager.addCallback(callbackKey, callback);
      },
    };
  }

  get targetSeries() {
    return {
      set: (target: TargetSeries) => {
        this._dataManager.setTargetSeries(target);
        this._displayManager.updateChartTarget(
          target,
          this._dataManager.state.maxHoldEnabled
        );
      },
      get: () => this._dataManager.getTargetSeries(),

      addCallback: (callback: (target: TargetSeries) => void) => {
        return this._dataManager.addCallback("onTargetSeriesChanged", callback);
      },
    };
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
        this._displayManager.updateChartTarget(
          this._dataManager.getTargetSeries(),
          true
        );
        this._chart.redraw();
      },
      disable: () => {
        this._dataManager.disableMaxHold();
        this._displayManager.showMaxHoldSeries(false);
        this._dataManager.setTargetSeries("fft");
        this._displayManager.updateChartTarget(
          this._dataManager.getTargetSeries(),
          false
        );

        this._chart.redraw();
      },
      isEnabled: () => this._dataManager.isMaxHoldEnabled(),
      onMaxHoldToggled: (callback: (enabled: boolean) => void) => {
        return this._dataManager.addCallback("onMaxHoldToggled", callback);
      },
    };
  }

  get state() {
    return this._dataManager.state;
  }
}
