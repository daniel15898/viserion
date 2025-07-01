import Highcharts from "highcharts";
import { CHART_CONFIG } from "../config/fft-config";
import type { ChartEventActions } from "../types/fft-chart-events";

export class ChartEventManager {
  private _chart: Highcharts.Chart;
  constructor(chart: Highcharts.Chart) {
    this._chart = chart;
  }

  initialize(actions: ChartEventActions) {
    this.setupChartClickHandler(actions.addMarker);
  }

  private setupChartClickHandler(addMarker: ChartEventActions["addMarker"]) {
    const fftChart = this._chart.series[CHART_CONFIG.FFT.index];
    const maxHoldChart = this._chart.series[CHART_CONFIG.MAX_HOLD.index];
    if (!fftChart) return;
    // Setup series click handler
    fftChart.update({
      type: "spline",
      events: {
        click: (event) =>
          this.handleSeriesClick(
            event as Highcharts.SeriesClickEventObject & MouseEvent,
            addMarker
          ),
      },
    });

    // Setup chart click handler
    this._chart.update(
      {
        chart: {
          events: {
            click: (event) => {
              this.handleChartClick(
                event as Highcharts.ChartClickEventObject,
                addMarker
              );
            },
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
              event as Highcharts.SeriesClickEventObject & MouseEvent,
              addMarker
            ),
        },
      });
    }
  }
  private addMarkerBasedOnModifier(
    event: MouseEvent,
    x: number,
    addMarker: ChartEventActions["addMarker"]
  ) {
    if (event.metaKey || event.altKey) {
      addMarker(CHART_CONFIG.MARKER_ONE.id, CHART_CONFIG.MARKER_ONE.index, x);
    }

    if (event.shiftKey) {
      addMarker(CHART_CONFIG.MARKER_TWO.id, CHART_CONFIG.MARKER_TWO.index, x);
    }
  }

  private handleChartClick(
    event: Highcharts.ChartClickEventObject,
    addMarker: ChartEventActions["addMarker"]
  ) {
    const x = event.xAxis[0].value;
    this.addMarkerBasedOnModifier(event, x, addMarker);
  }

  private handleSeriesClick(
    event: Highcharts.SeriesClickEventObject & MouseEvent,
    addMarker: ChartEventActions["addMarker"]
  ) {
    const { x } = event.point;

    if (!x) return;

    this.addMarkerBasedOnModifier(event, x, addMarker);
  }
}
