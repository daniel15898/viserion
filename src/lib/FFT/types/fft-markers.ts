export type MarkerData = {
  id: string;
  x: number; // frequency
  y: number; // amplitude
  color?: string;
  index: number;
  marker: Highcharts.Series;
};
