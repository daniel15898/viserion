import type { FFTParams } from "./fft-manager";

export type TargetSeries = "fft" | "maxhold";

export type FFTDataManagerState = {
  fftParams: FFTParams;
  frequencies: number[];
  fftData: number[];
  chartData: [number, number][];
  targetSeries: TargetSeries;
} & MaxHoldState;

export type MaxHoldState = {
  maxHoldEnabled: boolean;
  maxHoldData: number[];
  maxHoldChartData: [number, number][];
};
