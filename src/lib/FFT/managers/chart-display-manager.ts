import { EventBus } from "@/lib/EventBus/eventBus";
import {
  CHART_CONFIG,
  DEFAULT_FFT_CONFIG,
  getTooltipFormatter,
} from "../config/fft-config";
import type { FftDisplayCallbacks } from "../types/fft-callbacks";

import type { FftDisplayManagerState } from "../types/fft-display-manager";
import type { FrequencyUnit } from "../types/frequency-units";
import { getFrequencyValue } from "../utils/unitFormmater";

export class FftDisplayManager {
  private _chart: Highcharts.Chart;
  private _state: FftDisplayManagerState;
  private eventBus = new EventBus<FftDisplayCallbacks>();

  constructor(chart: Highcharts.Chart, defaultDisplayUnit?: FrequencyUnit) {
    this._chart = chart;
    this._state = {
      displayUnit:
        defaultDisplayUnit || DEFAULT_FFT_CONFIG.defaultParams.displayUnit,
    };
    this.initialize_events();
  }

  initialize_events() {
    this.updateChartFormatters(this._state.displayUnit);
  }

  showMaxHoldSeries(show: boolean): void {
    this._chart.series[CHART_CONFIG.MAX_HOLD.index].setVisible(show);
  }

  updateFFTSeries(data: [number, number][]): void {
    this._chart.series[CHART_CONFIG.FFT.index].setData(data);
  }

  updateMaxHoldSeries(data: [number, number][]): void {
    this._chart.series[CHART_CONFIG.MAX_HOLD.index].setData(data);
  }

  private updateMarkersTarget(maxHoldEnabled: boolean): void {
    const markersSeries = [
      this._chart.series[CHART_CONFIG.MARKER_ONE.index],
      this._chart.series[CHART_CONFIG.MARKER_TWO.index],
    ];

    if (maxHoldEnabled) {
      const isMaxHoldSeriesVisible =
        this._chart.series[CHART_CONFIG.MAX_HOLD.index].visible;
      markersSeries.forEach((series) => {
        series.update(
          {
            type: "scatter",
            linkedTo: CHART_CONFIG.MAX_HOLD.id,
            visible: isMaxHoldSeriesVisible,
            zIndex: 3,
          },
          true
        );
      });
    } else {
      const isFftSeriesVisible =
        this._chart.series[CHART_CONFIG.FFT.index].visible;
      markersSeries.forEach((series) => {
        series.update(
          {
            type: "scatter",
            linkedTo: CHART_CONFIG.FFT.id,
            visible: isFftSeriesVisible,
          },
          true
        );
      });
    }
  }

  updateChartTarget(maxHoldEnabled: boolean): void {
    this.updateTooltipTarget(maxHoldEnabled);
    this.updateMarkersTarget(maxHoldEnabled);
  }

  // Tooltip and Mouse Tracking Management
  private updateTooltipTarget(maxHoldEnabled: boolean): void {
    const fftSeries = this._chart.get(CHART_CONFIG.FFT.id) as Highcharts.Series;
    const maxHoldSeries = this._chart.get(
      CHART_CONFIG.MAX_HOLD.id
    ) as Highcharts.Series;

    if (maxHoldEnabled) {
      // Enable tracking on max hold, disable on FFT
      if (maxHoldSeries && fftSeries) {
        fftSeries.update(
          {
            type: "spline",
            enableMouseTracking: false,
            states: { hover: { enabled: false } },
            zIndex: 1,
          },
          false
        );

        maxHoldSeries.update(
          {
            type: "spline",
            enableMouseTracking: true,
            states: { hover: { enabled: true } },
            zIndex: 2,
          },
          false
        );
      }
    } else {
      // Enable tracking on FFT, disable on max hold
      fftSeries.update(
        {
          type: "spline",
          enableMouseTracking: true,
          states: { hover: { enabled: true } },
        },
        false
      );

      if (maxHoldSeries) {
        maxHoldSeries.update(
          {
            type: "spline",
            enableMouseTracking: false,
            states: { hover: { enabled: false } },
          },
          false
        );
      }
    }

    this._chart.redraw();
  }

  // Chart Formatting Management
  updateChartFormatters(unit: FrequencyUnit): void {
    this.updateXAxisFormatters(unit);
    this.updateTooltipFormatters(unit);
    this._chart.redraw();
  }

  private updateXAxisFormatters(unit: FrequencyUnit): void {
    this._chart.xAxis[0].update({
      title: {
        text: `Frequency (${unit})`,
      },
      labels: {
        formatter: function () {
          const value = getFrequencyValue(this.value as number, unit, 0);
          return value;
        },
      },
    });
  }

  private updateTooltipFormatters(unit: FrequencyUnit): void {
    this._chart.tooltip.update({
      formatter: function () {
        return getTooltipFormatter(this, unit);
      },
    });
  }

  setDisplayUnit(unit: FrequencyUnit): void {
    this._state.displayUnit = unit;
    this.notifyDisplayUnitChanged(unit);
  }

  getDisplayUnit(): FrequencyUnit {
    return this._state.displayUnit;
  }

  // Chart State Management
  redraw(): void {
    this._chart.redraw();
  }

  getChart(): Highcharts.Chart {
    return this._chart;
  }

  addCallback<T extends keyof FftDisplayCallbacks>(
    callbackKey: T,
    callback: FftDisplayCallbacks[T]
  ): () => void {
    this.eventBus.on(callbackKey, callback);
    return () => this.eventBus.off(callbackKey, callback);
  }

  private notifyDisplayUnitChanged(unit: FrequencyUnit): void {
    this.eventBus.emit("onDisplayUnitChanged", unit);
  }
}
