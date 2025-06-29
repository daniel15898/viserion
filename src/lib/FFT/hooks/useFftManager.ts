import { useState } from "react";
import { useEffect } from "react";
import type { HighchartsReactRefObject } from "highcharts-react-official";
import type { FFTManagerConfig } from "../types/fft-manager";
import { FFTChartManager } from "../managers/chart-manager";

export function useFftChartManager(
  chartRef: React.RefObject<HighchartsReactRefObject | null>,
  config?: FFTManagerConfig
) {
  const [manager, setManager] = useState<FFTChartManager | null>(null);

  useEffect(() => {
    if (!manager && chartRef.current?.chart) {
      const chart = chartRef.current.chart;
      const fftManager = new FFTChartManager(chart, config);
      setManager(fftManager);
    }
  }, [chartRef, config, manager]);

  return manager;
}
