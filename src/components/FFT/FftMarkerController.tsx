import type { FFTChartManager } from "@/lib/FFT/managers/chart-manager";
import type { TargetSeries } from "@/lib/FFT/types/fft-data-manager";
import type { MarkerData } from "@/lib/FFT/types/fft-markers";
import type { FrequencyUnit } from "@/lib/FFT/types/frequency-units";
import { getFrequencyValue } from "@/lib/FFT/utils/unitFormmater";
import { useEffect, useState, useMemo } from "react";

import { toast } from "react-toastify";

function FftMarkerController({ fftManager }: { fftManager: FFTChartManager }) {
  const [markers, setMarkers] = useState<Record<string, MarkerData>>(
    fftManager.markers.getAll()
  );
  const [displayUnit, setDisplayUnit] = useState<FrequencyUnit>(
    fftManager.display.getUnit()
  );

  const [isMaxHoldEnabled, setIsMaxHoldEnabled] = useState(false);
  const [targetSeries, setTargetSeries] = useState<TargetSeries>(
    fftManager.targetSeries.get()
  );

  useEffect(() => {
    if (!fftManager) return;
    const unsubscribe = fftManager.markers.addCallback(
      "onMarkersChanged",
      setMarkers
    );
    const unsubscribe2 = fftManager.markers.addCallback(
      "onMarkerRemoved",
      (marker, reason) => {
        if (reason) {
          toast.warn(`Marker ${marker.index} removed: ${reason}`);
        }
        toast.success(`Marker ${marker.index} removed`);
      }
    );
    const unsubscribe3 = fftManager.display.addCallback(
      "onDisplayUnitChanged",
      (unit) => {
        setDisplayUnit(unit);
      }
    );
    const unsubscribe4 = fftManager.maxHold.onMaxHoldToggled((enabled) => {
      console.log("onMaxHoldToggled", enabled);

      setIsMaxHoldEnabled(enabled);
    });

    const unsubscribe5 = fftManager.targetSeries.addCallback((target) => {
      setTargetSeries(target);
    });

    return () => {
      unsubscribe();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
      unsubscribe5();
    };
  }, [fftManager]);

  // const formatAmplitude = (amp: number) => {
  //   return `${amp.toFixed(2)} dB`;
  // };

  const handleDeleteMarker = (markerId: string) => {
    fftManager.markers.remove(markerId);
  };

  const markerEntries = useMemo(() => Object.entries(markers), [markers]);

  return (
    <div className="space-y-1 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center shadow-md">
          <span className="text-xs">📍</span>
        </div>
        <div className="flex items-center justify-center">
          <p className="text-text-secondary text-base"> Markers</p>
          <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {markerEntries.length}
          </span>
        </div>
        {isMaxHoldEnabled ? (
          <div className="flex items-center gap-2">
            <button
              className={`bg-surface-elevated border border-border rounded-md p-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
              onClick={() => fftManager.targetSeries.set("fft")}
              disabled={targetSeries === "fft"}
            >
              fft
            </button>
            <button
              className={`bg-surface-elevated border border-border rounded-md p-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
              disabled={targetSeries === "maxhold"}
              onClick={() => fftManager.targetSeries.set("maxhold")}
            >
              max hold
            </button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {markerEntries.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-3 bg-surface-elevated border-2 border-dashed w-full h-[100%] border-border rounded-lg max-w-xs flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center ">
                <div className="w-8 h-8 mx-auto mb-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg opacity-50">🎯</span>
                </div>
                <h4 className="text-text-primary font-medium mb-1 text-xs">
                  No Markers
                </h4>
                <p className="text-text-secondary text-xs leading-relaxed mb-2">
                  Click on chart to place markers
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono text-text-secondary">
                      Cmd
                    </kbd>
                    <span className="text-text-secondary">+</span>
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono text-text-secondary">
                      Click
                    </kbd>
                  </div>
                  <div className="text-text-secondary text-xs">or</div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono text-text-secondary">
                      Shift
                    </kbd>
                    <span className="text-text-secondary">+</span>
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-xs font-mono text-text-secondary">
                      Click
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto space-y-1.5 pr-1">
            {markerEntries.map(([id, marker], index) => (
              <div
                key={id}
                className="group relative bg-surface-elevated border border-border rounded-lg p-2 hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between ">
                  <div className="flex items-center justify-center ">
                    <div className="flex gap-2 ">
                      <div className="relative">
                        <div
                          className="w-4 h-4 rounded-md border border-border  shadow-sm flex items-center justify-center"
                          style={{ backgroundColor: marker.color || "#FFEB3B" }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">
                            {index + 1}
                          </span>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-surface-elevated animate-pulse"></div>
                      </div>
                      <h4 className="font-semibold text-text-primary  h-full flex items-center justify-center text-xs">
                        {id.includes("marker-1") ? "🟡 Golden" : "🔵 Ice"}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMarker(id)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-0.5 hover:bg-hover rounded-md text-text-secondary hover:text-accent"
                    aria-label={`Delete ${id} marker`}
                    title="Delete marker"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-surface border border-border rounded-md p-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs">📡</span>
                      <span className="text-text-secondary text-xs font-medium">
                        Freq
                      </span>
                    </div>
                    <div className="text-text-primary font-mono text-xs font-bold">
                      {getFrequencyValue(marker.x, displayUnit)}{" "}
                      <span className="text-xs font-medium text-text-secondary">
                        {displayUnit}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface border border-border rounded-md p-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs">📊</span>
                      <span className="text-text-secondary text-xs font-medium">
                        Amp
                      </span>
                    </div>
                    <div className="text-text-primary font-mono text-xs font-bold">
                      {marker.y.toFixed(1)}{" "}
                      <span className="text-xs font-medium text-text-secondary">
                        dB
                      </span>
                    </div>
                  </div>
                </div>

                {/* <MarkerPositionInput
                  markerId={id}
                  fftManager={fftManager}
                  onPositionChange={() => {}}
                /> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FftMarkerController;
