import type { FFTManagerConfig } from "../types/fft-manager";
import type { FrequencyUnit } from "../types/frequency-units";
import { getFrequencyValue } from "../utils/unitFormmater";

export const CHART_CONFIG = {
  FFT: {
    id: "fft",
    name: "FFT",
    index: 0,
  },
  MAX_HOLD: {
    id: "max-hold",
    name: "Max Hold",
    index: 1,
  },
  MARKER_ONE: {
    id: "marker-1",
    name: "Marker 1",
    index: 2,
  },
  MARKER_TWO: {
    id: "marker-2",
    name: "Marker 2",
    index: 3,
  },
} as const;

export const DEFAULT_FFT_CONFIG: FFTManagerConfig = {
  defaultParams: {
    fftParams: {
      sampleRate: 10000000,
      centerFrequency: 10000000,
      fftSize: 1024,
    },
    displayUnit: "Hz",
  },
};

export const createFftChartOptions = () => {
  const options: Highcharts.Options = {
    boost: {
      enabled: true,
      useGPUTranslations: true,
      usePreallocated: true,
      seriesThreshold: 1,
    },
    chart: {
      spacing: [50, 20, 0, 0],
      animation: false,
      backgroundColor: "var(--background)",
      style: {
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "var(--foreground)",
      },

      // Optimize for performance
      borderWidth: 0,
      plotBorderWidth: 0,
      reflow: false, // Disable automatic reflow for better performance

      zooming: {
        type: "x",
        pinchType: "x",
        resetButton: {
          position: {
            align: "left",
            verticalAlign: "top",
            x: 0,
            y: -45,
          },
          theme: {
            fill: "var(--card)",
            stroke: "var(--border)",
            "stroke-width": 1,
            r: 6,
            style: {
              color: "var(--foreground)",
              fontSize: "14px",
              fontWeight: "500",
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            },
            states: {
              hover: {
                fill: "var(--muted)",
                stroke: "var(--primary)",
                "stroke-width": 2,
                style: {
                  color: "var(--foreground)",
                  cursor: "pointer",
                },
              },
              select: {
                fill: "var(--accent)",
                stroke: "var(--primary)",
                "stroke-width": 2,
                style: {
                  color: "var(--foreground)",
                },
              },
            },
          },
          relativeTo: "plotBox",
        },
      },
    },

    legend: {
      enabled: true,
      align: "center",
      verticalAlign: "bottom",
      symbolWidth: 0,
      symbolHeight: 0,
      useHTML: true,
      itemMarginTop: 4,
      itemMarginBottom: 4,
      labelFormatter: function () {
        const isVisible = this.visible;
        const buttonClass = isVisible
          ? "legend-button active"
          : "legend-button inactive";

        return `<span class="${buttonClass}" data-series="${this.name}">
                  <span class="legend-color" style="background-color: ${this.color}"></span>
                  <span class="legend-text">${this.name}</span>
                </span>`;
      },
      itemStyle: {
        cursor: "pointer",
      },
    },
    title: {
      text: undefined,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      outside: true,
      animation: false,
      followPointer: false,
      followTouchMove: false,
      shape: "rect",
      // Completely disable the connector/pointer

      positioner: function (labelWidth) {
        const chart = this.chart;
        const plotLeft = chart.plotLeft;

        const plotWidth = chart.plotWidth;

        return {
          x: plotLeft + plotWidth - labelWidth,
          y: 20,
        };
      },

      backgroundColor: "var(--popover)",
      borderColor: "var(--border)",
      borderRadius: 12,
      borderWidth: 2,
      style: {
        color: "var(--popover-foreground)",
        fontSize: "12px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        fontWeight: "normal",
        padding: "16px",
        minWidth: "220px",
      },
      formatter: function () {
        return getTooltipFormatter(
          this,
          DEFAULT_FFT_CONFIG.defaultParams.displayUnit
        );
      },
    },
    xAxis: {
      title: {
        text: `Frequency (${DEFAULT_FFT_CONFIG.defaultParams.displayUnit})`,
        style: {
          color: "var(--muted-foreground)",
          fontSize: "14px",
          fontWeight: "600",
        },
      },
      labels: {
        style: {
          color: "var(--foreground)",
          fontSize: "12px",
          fontWeight: "500",
        },
        formatter: function (
          this: Highcharts.AxisLabelsFormatterContextObject
        ) {
          const value = getFrequencyValue(
            Number(this.value),
            DEFAULT_FFT_CONFIG.defaultParams.displayUnit,
            2
          );
          return value.toString();
        },
      },
      lineWidth: 0,
    },
    yAxis: {
      title: {
        text: "Amplitude (dBm)",
        style: {
          color: "var(--muted-foreground)",
          fontSize: "14px",
          fontWeight: "600",
        },
      },
      labels: {
        style: {
          color: "var(--foreground)",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      max: 20,
      min: -120,
      gridLineColor: "var(--border)",
      lineColor: "var(--border)",
      tickColor: "var(--border)",
      gridLineWidth: 1,
      lineWidth: 0,
    },

    plotOptions: {
      spline: {
        enableMouseTracking: true,
        tooltip: {
          followPointer: false,
          followTouchMove: false,
        },
        marker: {
          enabled: false,
        },
        lineWidth: 1,
      },

      scatter: {
        marker: {
          radius: 8,
          lineWidth: 2,
        },
        stickyTracking: false,
      },
    },

    series: [
      {
        index: CHART_CONFIG.FFT.index,
        name: CHART_CONFIG.FFT.name,
        id: CHART_CONFIG.FFT.id,
        data: [],
        type: "spline",
        color: "var(--primary)",
        enableMouseTracking: true,
        lineWidth: 2,
        marker: {
          enabled: false,
          symbol: "triangle-down",
          fillColor: "var(--primary)",
          lineColor: "var(--primary)",
          radius: 4, // Fill color
          lineWidth: 1, // Border thickness
          animation: false,
          color: "var(--primary)",
        },
      },
      {
        index: CHART_CONFIG.MAX_HOLD.index,
        name: CHART_CONFIG.MAX_HOLD.name,
        id: CHART_CONFIG.MAX_HOLD.id,
        data: [],
        type: "spline",
        color: "var(--chart-3)",
        enableMouseTracking: false,
        marker: {
          enabled: false,
          radius: 4, // Fill color
          lineWidth: 1, // Border thickness
          symbol: "triangle-down",
        },
        zIndex: 10,
        lineWidth: 1.5,
        visible: false,
        showInLegend: false,
      },
      {
        name: CHART_CONFIG.MARKER_ONE.name,
        index: CHART_CONFIG.MARKER_ONE.index,
        id: CHART_CONFIG.MARKER_ONE.id,
        color: "var(--chart-2)",
        enableMouseTracking: false,
        marker: {
          enabled: true,
          radius: 8,
          symbol: "triangle-down",
          fillColor: "var(--chart-2)",
          lineWidth: 2,
          lineColor: "var(--chart-1)",
          states: {
            hover: {
              enabled: false,
            },
            select: {
              enabled: false,
            },
          },
        },
        data: [],
        type: "scatter",
        linkedTo: CHART_CONFIG.FFT.id,
      },
      {
        index: CHART_CONFIG.MARKER_TWO.index,
        name: CHART_CONFIG.MARKER_TWO.name,
        id: CHART_CONFIG.MARKER_TWO.id,
        color: "var(--chart-4)",
        enableMouseTracking: false,
        marker: {
          enabled: true,
          radius: 8,
          symbol: "triangle-down",
          fillColor: "var(--chart-4)",
          lineWidth: 2,
          lineColor: "var(--chart-6)",
          states: {
            hover: {
              enabled: false,
            },
            select: {
              enabled: false,
            },
          },
        },
        data: [],
        type: "scatter",
        linkedTo: CHART_CONFIG.FFT.id,
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return options;
};

export const getTooltipFormatter = (
  point: Highcharts.Point,
  unit: FrequencyUnit
) => {
  // Cache static styles to avoid recalculation
  const pointerX = getFrequencyValue(point.x, unit, 2);
  const pointerY = point.y?.toFixed(2) || "0.00";

  // Simple tooltip with just current point data
  return `
    <div style="display: flex; gap: 16px; width: 200px; align-items: center; ">
        <div style="width: 100%; text-align: center;">
          <div style="color: var(--muted-foreground); font-size: 10px; margin-bottom: 2px;">Frequency</div>
          <div style="color: var(--foreground); font-family: monospace; font-weight: 600; font-size: 11px;">${pointerX} ${unit}</div>
        </div>
        <div style="width: 100%; text-align: center;">
          <div style="color: var(--muted-foreground); font-size: 10px; margin-bottom: 2px;">Amplitude</div>
          <div style="color: var(--foreground); font-family: monospace; font-weight: 600; font-size: 11px;">${pointerY} dB</div>
        </div>
      </div>
    </div>
  `;
};

export const getChartConfig = () => {
  return {
    ...CHART_CONFIG,
    frequencyUnit: DEFAULT_FFT_CONFIG.defaultParams.displayUnit,
  };
};
