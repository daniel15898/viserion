import { useEffect, useMemo, useRef, useState } from "react";
import FftChartPresenter from "../../../lib/FFT/components/FftChartPresenter";
import highcharts from "highcharts/highcharts";
import { useFftChartManager } from "@/lib/FFT/hooks/useFftManager";
import type { HighchartsReactRefObject } from "highcharts-react-official";
import { convertFloat16BufferToArray } from "@/lib/FFT/utils/fft-parser";
import { createFftChartOptions } from "@/lib/FFT/config/fft-config";

import SliderWithInput from "@/components/ui/slider-with-input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SampleFFTMarkersCard from "./SampleFFTMarkersCard";

function SampleFFT() {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const manager = useFftChartManager(chartRef, {
    defaultParams: {
      fftParams: {
        sampleRate: 200000000,
        centerFrequency: 700000000,
        fftSize: 1024,
      },
      displayUnit: "MHz",
    },
  });

  const [isMaxHoldEnabled, setIsMaxHoldEnabled] = useState(false);

  const fftConfig = useMemo(() => {
    return createFftChartOptions();
  }, []);

  useEffect(() => {
    if (!manager) return;

    const ws = new WebSocket(
      "ws://localhost:8002/ws?size=1024&f_per_second=24"
    );
    ws.binaryType = "arraybuffer";

    ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      const data = convertFloat16BufferToArray(event.data);

      const startTime2 = performance.now();
      manager.updateFFTData(data);
      const endTime2 = performance.now();
      // console.log(
      //   `updateFFTData Time taken: ${endTime2 - startTime2} milliseconds`
      // );
    };
    ws.onopen = () => {
      console.log("WebSocket connection established");
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    return () => {
      ws.close();
    };
  }, [manager]);

  useEffect(() => {
    if (!manager) return;
    const unsubscribe = manager.maxHold.onMaxHoldToggled((enabled) => {
      setIsMaxHoldEnabled(enabled);
    });
    return () => {
      unsubscribe();
    };
  }, [manager]);

  return (
    <div className="flex gap-6 py-4 w-full h-full ">
      <div className="basis-1/4 flex flex-col  pl-2 ">
        <div className="h-44">
          <Card className="rounded-lg gap-2 pb-0.5">
            <CardHeader>
              <CardTitle className="text-xl">USRP Channel</CardTitle>
            </CardHeader>
            <CardContent className="  h-full flex items-center justify-center gap-4">
              <Button variant="default" className="w-full font-bold">
                CH-1
              </Button>
              <Button variant="default" className="w-full font-bold">
                CH-2
              </Button>
            </CardContent>
            <CardHeader>
              <CardTitle className="text-lg">Anttena</CardTitle>
            </CardHeader>
            <CardContent className="px-3 mb-2 h-full flex items-center justify-center">
              <Select defaultValue="1">
                <SelectTrigger className="cursor-pointer h-10 hover:bg-background/20 transition-colors">
                  <SelectValue placeholder="Select Antenna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">React</SelectItem>
                  <SelectItem value="2">Next.js</SelectItem>
                  <SelectItem value="3">Astro</SelectItem>
                  <SelectItem value="4">Gatsby</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1 pt-2">
          <Card className="rounded-lg gap-0 h-full bg-transparent border-0 pt-0">
            <CardContent className="px-4 py-4 space-y-12">
              <SliderWithInput title="Sample Rate" unit="MHz" />
              <SliderWithInput title="Center Frequency" unit="MHz" />
              <SliderWithInput title="Gain" unit="dB" />
            </CardContent>
            <CardFooter className="p-2 mt-4 justify-center flex">
              <Button
                variant="default"
                className="w-44 text-lg py-6 bg-primary/90"
              >
                Continue
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="basis-3/4 h-full flex flex-col">
        <div className="grid grid-cols-[repeat(3,1fr)_0.6fr] gap-4 h-44 pr-4">
          {manager && (
            <SampleFFTMarkersCard
              fftManager={manager}
              className="rounded-lg col-span-2"
            />
          )}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Band Power</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-center">Chart Mode</CardTitle>
            </CardHeader>
            <Button onClick={() => manager?.maxHold.enable()}></Button>
          </Card>
        </div>
        <div className="flex-1">
          <FftChartPresenter
            options={fftConfig}
            highcharts={highcharts}
            constructorType="chart"
            ref={chartRef}
            allowChartUpdate={false}
          />
        </div>
      </div>
    </div>
  );
}

export default SampleFFT;
