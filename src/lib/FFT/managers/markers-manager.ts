import { EventBus } from "@/lib/EventBus/eventBus";
import type { MarkersCallbacks } from "../types/fft-callbacks";
import type { FFTParams } from "../types/fft-manager";
import type { MarkerData } from "../types/fft-markers";

export class MarkerManager {
  private chart: Highcharts.Chart;
  private markers: Record<string, MarkerData> = {};
  private eventBus = new EventBus<MarkersCallbacks>();

  constructor(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  addMarker(id: string, x: number, y: number, frequencyIndex: number) {
    const markerSeries = this.chart.get(id) as Highcharts.Series;
    if (!markerSeries) return;
    markerSeries.setData([{ x, y }], true);
    this.markers[id] = {
      id,
      seriesIndex: markerSeries.index,
      frequencyIndex,
      x,
      y,
      color: markerSeries.color as string,
      marker: markerSeries,
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

  updateMarkersFromFFT(fftData: number[]) {
    Object.keys(this.markers).forEach((markerId) => {
      const marker = this.markers[markerId];
      if (!marker) return;

      const markerY = fftData[marker.frequencyIndex];

      if (!markerY) return;

      this.updateMarker(markerId, marker.x, markerY);
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
    const { centerFrequency, sampleRate, fftSize } = fftParams;
    const closestIndex = Math.round(
      (x - (centerFrequency - sampleRate / 2)) / (sampleRate / fftSize)
    );
    return Math.max(0, Math.min(closestIndex, fftSize - 1));
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
