import { EventBus } from "@/lib/EventBus/eventBus";
import type { MarkersCallbacks } from "../types/fft-callbacks";
import type { FFTDataManagerState } from "../types/fft-data-manager";
import type { FFTParams } from "../types/fft-manager";
import type { MarkerData } from "../types/fft-markers";

export class MarkerManager {
  private chart: Highcharts.Chart;
  private markers: Record<string, MarkerData> = {};
  private eventBus = new EventBus<MarkersCallbacks>();

  constructor(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  addMarker(id: string, index: number, x: number, y: number) {
    this.chart.series[index].setData([{ x, y }], true);
    this.markers[id] = {
      id,
      index,
      x,
      y,
      color: this.chart.series[index].color as string,
      marker: this.chart.series[index],
    };
    this.chart.redraw();
    this.notifyMarkersChanged();
    this.notifyMarkerAdded(this.markers[id]);
  }

  updateMarker(id: string, x: number, y: number) {
    const marker = this.markers[id];
    if (marker) {
      marker.x = x;
      marker.y = y;
      marker.marker.setData([{ x: x, y: y }], true, false, true);
      this.notifyMarkersChanged();
      this.notifyMarkerUpdated(this.markers[id]);
    }
  }

  removeMarker(id: string, reason?: string) {
    const marker = this.markers[id];
    if (marker) {
      const markerToRemove = { ...marker };
      delete this.markers[id];
      marker.marker.setData([], true, false, true);
      this.notifyMarkerRemoved(markerToRemove, reason);
      this.notifyMarkersChanged();
    }
  }

  updateMarkersFromFFT(state: FFTDataManagerState) {
    Object.keys(this.markers).forEach((markerId) => {
      const marker = this.markers[markerId];
      if (!marker) return;

      const closestIndex = this.findClosestIndex(marker.x, state.fftParams);
      if (closestIndex === -1) return;

      let newY: number;

      // Use the single target series variable
      if (
        state.targetSeries === "maxhold" &&
        state.maxHoldEnabled &&
        state.maxHoldData.length > 0
      ) {
        newY = state.maxHoldData[closestIndex];
      } else {
        newY = state.fftData[closestIndex];
      }

      this.updateMarker(markerId, marker.x, newY);
    });
  }

  validateMarkersPosition(state: FFTParams) {
    const maxFrequency = state.centerFrequency + state.sampleRate / 2;
    const minFrequency = state.centerFrequency - state.sampleRate / 2;

    Object.values(this.markers).forEach((marker) => {
      if (marker.x > maxFrequency || marker.x < minFrequency) {
        this.removeMarker(marker.id, "out of range");
        return false;
      }
    });
  }

  private findClosestIndex(x: number, fftParams: FFTParams): number {
    const closestIndex = Math.round(
      (x - (fftParams.centerFrequency - fftParams.sampleRate / 2)) /
        (fftParams.sampleRate / fftParams.fftSize)
    );

    return closestIndex;
  }

  getMarkersData() {
    return { ...this.markers };
  }

  addCallback<T extends keyof MarkersCallbacks>(
    callbackKey: T,
    callback: MarkersCallbacks[T]
  ): () => void {
    this.eventBus.on(callbackKey, callback);
    return () => this.eventBus.off(callbackKey, callback);
  }

  private notifyMarkersChanged() {
    this.eventBus.emit("onMarkersChanged", this.getMarkersData());
  }

  private notifyMarkerAdded(marker: MarkerData) {
    this.eventBus.emit("onMarkerAdded", marker);
  }

  private notifyMarkerRemoved(marker: MarkerData, reason?: string) {
    this.eventBus.emit("onMarkerRemoved", marker, reason);
  }

  private notifyMarkerUpdated(marker: MarkerData) {
    this.eventBus.emit("onMarkerUpdated", marker);
  }
}
