import { cn } from "@/lib/utils/utils";
import HighchartsReact, {
  type HighchartsReactProps,
  type HighchartsReactRefObject,
} from "highcharts-react-official";
import { forwardRef, useCallback, useEffect, type RefObject } from "react";
import "@lib/FFT/style/chartStyle.css";

// Define the props interface with proper extension of HighchartsReact props
interface FftChartPresenterProps {
  options: HighchartsReactProps["options"];
  className?: string;
  highcharts: HighchartsReactProps["highcharts"];
  constructorType?: HighchartsReactProps["constructorType"];
  allowChartUpdate?: HighchartsReactProps["allowChartUpdate"];
  onChartReady?: (chart: Highcharts.Chart) => void;
}

const FftChartPresenter = forwardRef<
  HighchartsReactRefObject,
  FftChartPresenterProps
>(
  (
    {
      options,
      className,
      constructorType,
      highcharts,
      onChartReady,
      allowChartUpdate,
    },
    ref
  ) => {
    const handleResize = useCallback(() => {
      const currentRef = ref as RefObject<HighchartsReactRefObject>;
      if (!currentRef) return;
      const chart = currentRef.current?.chart;
      if (!chart) return;
      const parentWidth = chart.container.parentElement?.offsetWidth;
      const parentHeight = chart.container.parentElement?.offsetHeight;
      chart.setSize(parentWidth, parentHeight, false);
    }, [ref]);

    useEffect(() => {
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [handleResize]);
    return (
      <HighchartsReact
        ref={ref}
        options={options}
        highcharts={highcharts}
        containerProps={{
          className: cn("w-full h-full", className),
          id: "fft-container",
        }}
        constructorType={constructorType}
        allowChartUpdate={allowChartUpdate}
        callback={onChartReady}
      />
    );
  }
);

FftChartPresenter.displayName = "FftChartPresenter";

export default FftChartPresenter;
