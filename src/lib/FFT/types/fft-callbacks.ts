import type { TargetSeries } from "./fft-data-manager";
import type { MarkerData } from "./fft-markers";
import type { FrequencyUnit } from "./frequency-units";

// Fft callbacks
export type OnFftDataChangedCallback = (data: number[]) => void;
export type OnMaxHoldToggledCallback = (enabled: boolean) => void;
export type OnTargetSeriesChangedCallback = (target: TargetSeries) => void;

export type FftCallbacks = {
  onFftDataChanged: OnFftDataChangedCallback;
  onMaxHoldToggled: OnMaxHoldToggledCallback;
  onTargetSeriesChanged: OnTargetSeriesChangedCallback;
};

// Display callbacks
export type OnDisplayUnitChangedCallback = (unit: FrequencyUnit) => void;

export type FftDisplayCallbacks = {
  onDisplayUnitChanged: OnDisplayUnitChangedCallback;
};

// Markers callbacks
export type OnMarkersChangedCallback = (
  markers: Record<string, MarkerData>
) => void;
export type OnMarkerAddedCallback = (marker: MarkerData) => void;
export type OnMarkerRemovedCallback = (
  marker: MarkerData,
  reason?: string
) => void;
export type OnMarkerUpdatedCallback = (marker: MarkerData) => void;

export type MarkersCallbacks = {
  onMarkersChanged: OnMarkersChangedCallback;
  onMarkerAdded: OnMarkerAddedCallback;
  onMarkerRemoved: OnMarkerRemovedCallback;
  onMarkerUpdated: OnMarkerUpdatedCallback;
};

// Fft manager callbacks
export type FftManagerCallbacks = FftCallbacks &
  MarkersCallbacks &
  FftDisplayCallbacks;
