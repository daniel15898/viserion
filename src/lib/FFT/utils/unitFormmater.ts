import Decimal from "decimal.js";
import type { FrequencyUnit } from "../types/frequency-units";

const UNIT_DIVISORS: Record<FrequencyUnit, number> = {
  Hz: 1,
  kHz: 1_000,
  MHz: 1_000_000,
  GHz: 1_000_000_000,
};

/**
 * Convert Hz to specified unit value using Decimal.js
 */
export function getFrequencyValue(
  hzValue: number,
  unit: FrequencyUnit,
  precision = 3
) {
  return new Decimal(hzValue).div(UNIT_DIVISORS[unit]).toFixed(precision);
}

/**
 * Format frequency with Decimal.js precision
 */
export function formatFrequency(
  hzValue: number,
  unit: FrequencyUnit,
  precision = 3
): string {
  const value = getFrequencyValue(hzValue, unit, precision);
  return `${value} ${unit}`;
}
