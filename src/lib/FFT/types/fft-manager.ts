import type { FrequencyUnit } from "./frequency-units";

export type FFTParams = {
  sampleRate: number;
  centerFrequency: number;
  fftSize: number;
};

export type FFTManagerState = {
  fftParams: FFTParams;
  frequencies: number[];
  fftData: number[];
  chartData: number[][];
  displayUnit: FrequencyUnit;
};

export type FFTManagerConfig = {
  defaultParams: {
    fftParams: FFTParams;
    displayUnit: FrequencyUnit;
  };
};
