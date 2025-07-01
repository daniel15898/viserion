import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FFTChartManager } from "@/lib/FFT/managers/chart-manager";
import { useEffect, useState } from "react";

function SampleBandPowerCard({ fftManager }: { fftManager: FFTChartManager }) {
  const [bandPower, setBandPower] = useState(0);
  const [markersBandPower, setMarkersBandPower] = useState(0);

  useEffect(() => {
    const unsubscribe = fftManager.markers.addCallback(
      "onMarkersBandPowerChanged",
      setMarkersBandPower
    );
    const unsubscribe2 = fftManager.addCallback(
      "onChartBandPowerChanged",
      setBandPower
    );
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [fftManager]);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Band Power</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p>: {bandPower}</p>
          <div className="flex flex-row gap-2">
            <p>Markers Band Power: {markersBandPower}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SampleBandPowerCard;
