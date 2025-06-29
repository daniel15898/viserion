import { Float16Array } from "@petamoriken/float16";

/**
 * Converts an ArrayBuffer containing float16 data into a number array.
 * @param buffer - An ArrayBuffer containing float16 data
 * @returns number[] - Array of float numbers
 */
export function convertFloat16BufferToArray(buffer: ArrayBuffer): number[] {
  const float16Array = new Float16Array(buffer);
  return Array.from(float16Array);
}
