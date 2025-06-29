import { useSliderWithInput } from "@/hooks/use-slider-with-input";

import { Slider } from "./slider";
import { Input } from "./input";
import { Label } from "./label";

interface SliderWithInputProps {
  title?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  initialValue?: number[];
}

function SliderWithInput({
  title,
  unit = "MHz",
  minValue = 0,
  maxValue = 100,
  initialValue = [25],
}: SliderWithInputProps) {
  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({ minValue, maxValue, initialValue });

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center gap-2">
          <Label className="text-base  text-foreground/85">{title}</Label>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="grow">
          <Slider
            className="w-full"
            value={sliderValue}
            onValueChange={handleSliderChange}
            min={minValue}
            max={maxValue}
            aria-label="Slider with input"
            showTooltip
          />
          <div className="flex justify-between mt-2 text-muted">
            <Label className="text-xs text-muted-foreground">
              {minValue}
              {unit && ` ${unit}`}
            </Label>
            <Label className="text-xs text-muted-foreground">
              {maxValue}
              {unit && ` ${unit}`}
            </Label>
          </div>
        </div>
        <Input
          className="h-8 w-12 mb-4 px-2 py-1"
          type="text"
          inputMode="decimal"
          value={inputValues[0]}
          onChange={(e) => handleInputChange(e, 0)}
          onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              validateAndUpdateValue(inputValues[0], 0);
            }
          }}
          aria-label="Enter value"
        />
      </div>
    </div>
  );
}

export default SliderWithInput;
