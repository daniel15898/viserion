import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { FFTChartManager } from "@/lib/FFT/managers/chart-manager";
import type { MarkerData } from "@/lib/FFT/types/fft-markers";
import { formatFrequency } from "@/lib/FFT/utils/unitFormmater";
import { cn } from "@/lib/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function SampleFFTMarkersCard({
  fftManager,
  className,
}: {
  fftManager: FFTChartManager;
  className?: string;
}) {
  const [markers, setMarkers] = useState<Record<string, MarkerData>>(
    fftManager.markers.getAll()
  );

  useEffect(() => {
    const unsubscribe = fftManager.markers.addCallback(
      "onMarkersChanged",
      setMarkers
    );
    const unsubscribe2 = fftManager.markers.addCallback(
      "onMarkerRemoved",
      (marker, reason) => {
        if (reason) {
          toast.warn(`Marker ${marker.seriesIndex} removed: ${reason}`);
        }
      }
    );
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [fftManager]);
  return (
    <Card className={cn(className, "h-full")}>
      <CardHeader>
        <CardTitle className="text-lg">Markers</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 px-3 h-full">
        {Object.values(markers).map((marker) => (
          <MarkerCard key={marker.id} marker={marker} />
        ))}

        {Object.values(markers).length === 2 && (
          <DeltaCard markers={Object.values(markers)} />
        )}
      </CardContent>
    </Card>
  );
}

export default SampleFFTMarkersCard;

const MarkerCard = ({ marker }: { marker: MarkerData }) => {
  return (
    <Card className="bg-background rounded-lg">
      <CardHeader className="flex flex-row  items-center">
        {marker.color && (
          <span
            className="w-4 h-4 rounded-md border border-border  shadow-sm flex items-center justify-center"
            style={{ backgroundColor: marker.color }}
          ></span>
        )}
        {/* index -1 because the series are absolute index  => [fft,maxhold,marker-1,marker-2] */}
        <span>{`Marker ${marker.seriesIndex - 1}`}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pl-3">
        <Label className="opacity-80">{`F: ${formatFrequency(
          marker.x,
          "MHz",
          2
        )}`}</Label>
        <Label className="opacity-80">{`P: ${marker.y.toFixed(2)} dBm`}</Label>
      </CardContent>
    </Card>
  );
};

const DeltaCard = ({ markers }: { markers: MarkerData[] }) => {
  return (
    <Card className="w-full bg-background rounded-lg">
      <CardHeader className="pl-3 ">Delta</CardHeader>
      <CardContent className="flex flex-col gap-2 px-0 pl-3">
        <Label className="text-accent-foreground">{`ΔF: ${formatFrequency(
          Math.abs(Object.values(markers)[1].x - Object.values(markers)[0].x),
          "MHz",
          2
        )}`}</Label>
        <Label className="text-accent-foreground">{`ΔP: ${Math.abs(
          Object.values(markers)[1].y - Object.values(markers)[0].y
        ).toFixed(2)} dBm`}</Label>
      </CardContent>
    </Card>
  );
};
