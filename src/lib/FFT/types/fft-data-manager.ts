import type { FFTParams } from "./fft-manager";
import type { MarkerData } from "./fft-markers";

export type TargetSeries = "fft" | "maxhold";

export type FFTDataManagerState = {
  fftParams: FFTParams;
  frequencies: number[];
  fftData: number[];
  chartData: [number, number][];
  fftBandPower: number;
} & MaxHoldState &
  MarkersState;

export type MaxHoldState = {
  maxHoldEnabled: boolean;
  maxHoldData: number[];
  maxHoldChartData: [number, number][];
};

export type MarkersState = {
  markers: Record<string, MarkerData>;
  markersBandPower: number;
};
