import type { FFTChartManager } from "@/lib/FFT/managers/chart-manager";
import type { FrequencyUnit } from "@/lib/FFT/types/frequency-units";
import React, { useState } from "react";

function FftController({ fftManager }: { fftManager: FFTChartManager }) {
  const sampleRateRef = React.useRef<HTMLInputElement>(null);
  const centerFrequencyRef = React.useRef<HTMLInputElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<FrequencyUnit>(() =>
    fftManager.display.getUnit()
  );
  const availableUnits = fftManager.display.getAvailableUnits();

  const handleApplySettings = () => {
    if (sampleRateRef.current && centerFrequencyRef.current) {
      const sampleRate = Number(sampleRateRef.current.value);
      const centerFrequency = Number(centerFrequencyRef.current.value);

      if (!isNaN(sampleRate) && !isNaN(centerFrequency)) {
        // Convert input values from selected unit to Hz for internal use
        const sampleRateInHz = convertToHz(sampleRate, selectedUnit);
        const centerFrequencyInHz = convertToHz(centerFrequency, selectedUnit);

        fftManager.chart.zoomOut();
        fftManager.setFftParams({
          sampleRate: sampleRateInHz,
          centerFrequency: centerFrequencyInHz,
          fftSize: 1024,
        });
      }
    }
  };

  const handleUnitChange = (unit: FrequencyUnit) => {
    setSelectedUnit(unit);
    fftManager.display.setUnit(unit);
  };

  // Helper function to convert frequency to Hz
  const convertToHz = (value: number, unit: FrequencyUnit): number => {
    const multipliers: Record<FrequencyUnit, number> = {
      Hz: 1,
      kHz: 1_000,
      MHz: 1_000_000,
      GHz: 1_000_000_000,
    };
    return value * multipliers[unit];
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center shadow-md">
          <span className="text-xs">⚙️</span>
        </div>
        <div>
          <p className="text-text-secondary text-base">FFT parameters</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="space-y-2">
        {/* Unit Selector */}
        <div>
          <label
            htmlFor="frequencyUnit"
            className="block text-text-primary text-xs font-semibold mb-1"
          >
            <span className="flex items-center gap-1">
              <span className="text-xs">🎯</span>
              Unit
            </span>
          </label>
          <div className="relative">
            <select
              id="frequencyUnit"
              value={selectedUnit}
              onChange={(e) =>
                handleUnitChange(e.target.value as FrequencyUnit)
              }
              className="w-full text-sm bg-surface-elevated border border-border text-text-primary px-2 py-1.5 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer font-medium "
              aria-label="Select frequency unit"
            >
              {availableUnits.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                  className="bg-surface text-text-primary"
                >
                  {unit}
                </option>
              ))}
            </select>
            <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-3 h-3 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Input Grid */}
        <div className="space-y-2">
          {/* Sample Rate */}
          <div>
            <label
              htmlFor="sampleRate"
              className="block text-text-primary text-xs font-semibold mb-1"
            >
              <span className="flex items-center gap-1">
                <span className="text-xs">📡</span>
                Sample Rate ({selectedUnit})
              </span>
            </label>
            <input
              ref={sampleRateRef}
              id="sampleRate"
              type="number"
              step="any"
              className="w-full
               bg-surface-elevated border border-border text-text-primary px-2 py-1.5 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all duration-200 font-mono text-sm"
              placeholder={
                selectedUnit === "MHz"
                  ? "40"
                  : selectedUnit === "kHz"
                  ? "44100"
                  : "44100"
              }
              aria-label={`Sample rate in ${selectedUnit}`}
              min="0"
            />
          </div>

          {/* Center Frequency */}
          <div>
            <label
              htmlFor="centerFrequency"
              className="block text-text-primary text-xs font-semibold mb-1"
            >
              <span className="flex items-center gap-1">
                <span className="text-xs">🎵</span>
                Center Frequency ({selectedUnit})
              </span>
            </label>
            <input
              ref={centerFrequencyRef}
              id="centerFrequency"
              type="number"
              step="any"
              className="w-full text-sm bg-surface-elevated border border-border text-text-primary px-2 py-1.5 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all duration-200 font-mono "
              placeholder={
                selectedUnit === "GHz"
                  ? "2.4"
                  : selectedUnit === "MHz"
                  ? "2400"
                  : "1000"
              }
              aria-label={`Center frequency in ${selectedUnit}`}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={handleApplySettings}
          className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white px-2 py-2 rounded-md hover:from-active hover:to-accent transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 group text-xs"
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm group-hover:animate-pulse">🔥</span>
            <span>Apply</span>
            <svg
              className="w-3 h-3 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );
}

export default FftController;
