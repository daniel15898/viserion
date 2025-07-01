export type MarkerData = {
  id: string;
  x: number; // frequency
  y: number; // amplitude
  seriesIndex: number;
  frequencyIndex: number;
  color?: string;
  marker: Highcharts.Series;
};
