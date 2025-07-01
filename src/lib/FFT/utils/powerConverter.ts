export function dBmToMilliwatts(dBm: number): number {
  return Math.pow(10, dBm / 10);
}

export function milliwattsTodBm(milliwatts: number): number {
  return 10 * Math.log10(milliwatts);
}

export function bandPowerCalculator(fftData: number[], precision: number = 3) {
  let powerSum = 0;
  fftData.forEach((fftValue) => {
    const dBmValue = dBmToMilliwatts(fftValue);
    powerSum += dBmValue;
  });

  const sumInDb = milliwattsTodBm(powerSum);
  return Number(sumInDb.toFixed(precision));
}
