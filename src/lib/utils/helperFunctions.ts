export function zipArrays(
  xValues: number[],
  yValues: number[]
): [number, number][] {
  return xValues.map((x, index) => [x, yValues[index]]);
}
