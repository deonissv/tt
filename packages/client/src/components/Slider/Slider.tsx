import type React from 'react';
import type { ChangeEvent } from 'react';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ min = 0, max = 100, step = 1, label = 'Slider', onChange, value }) => {
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <label htmlFor="slider-input" className="mb-2 text-md font-bold">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          id="slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-bgblue rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default Slider;
