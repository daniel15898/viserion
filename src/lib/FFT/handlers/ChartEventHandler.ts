import { CHART_CONFIG } from "../config/fft-config";

export class ChartEventHandler {
  private chart: Highcharts.Chart;
  private isInitialized: boolean = false;

  constructor(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  initialize(
    addMarkerFunction: (id: string, index: number, x: number) => void
  ): void {
    if (this.isInitialized) return;

    this.setupEventHandlers(addMarkerFunction);
    this.isInitialized = true;
    this.chart.redraw();
  }

  destroy(): void {
    if (!this.isInitialized) return;

    this.removeEventHandlers();
    this.isInitialized = false;
  }

  private setupEventHandlers(
    addMarkerFunction: (id: string, index: number, x: number) => void
  ): void {
    const fftSeries = this.chart.series[CHART_CONFIG.FFT.index];
    const maxHoldSeries = this.chart.series[CHART_CONFIG.MAX_HOLD.index];

    // Setup chart click handler
    this.chart.update(
      {
        chart: {
          events: {
            click: (event) => {
              const x = (event as any).xAxis[0].value;
              this.handleClick(event as any, x, addMarkerFunction);
            },
          },
        },
      },
      false
    );

    // Setup series click handlers
    if (fftSeries) {
      fftSeries.update({
        type: "spline",
        events: {
          click: (event) => {
            const { x } = (event as any).point;
            if (x) {
              this.handleClick(event as any, x, addMarkerFunction);
            }
          },
        },
      });
    }

    if (maxHoldSeries) {
      maxHoldSeries.update({
        type: "spline",
        events: {
          click: (event) => {
            const { x } = (event as any).point;
            if (x) {
              this.handleClick(event as any, x, addMarkerFunction);
            }
          },
        },
      });
    }
  }

  private handleClick(
    event:
      | Highcharts.ChartClickEventObject
      | (Highcharts.SeriesClickEventObject & MouseEvent),
    x: number,
    addMarkerFunction: (id: string, index: number, x: number) => void
  ): void {
    // Add marker one on Meta/Alt + click
    if (event.metaKey || event.altKey) {
      addMarkerFunction(
        CHART_CONFIG.MARKER_ONE.id,
        CHART_CONFIG.MARKER_ONE.index,
        x
      );
    }

    // Add marker two on Shift + click
    if (event.shiftKey) {
      addMarkerFunction(
        CHART_CONFIG.MARKER_TWO.id,
        CHART_CONFIG.MARKER_TWO.index,
        x
      );
    }
  }
}
