import React, { useRef, useEffect, useState, useCallback } from "react";
import "./DualRangeSlider.css";

const DualRangeSlider = ({ min, max, step, value, onChange }) => {
  const [minVal, maxVal] = value;
  const [minValue, setMinValue] = useState(minVal);
  const [maxValue, setMaxValue] = useState(maxVal);
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  const range = useRef(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minValue);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValue, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxValue);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxValue, getPercent]);

  // Sync external value changes
  useEffect(() => {
    setMinValue(minVal);
    setMaxValue(maxVal);
  }, [minVal, maxVal]);

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxValue - step);
    setMinValue(value);
    minValRef.current = value;
    onChange([value, maxValue]);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minValue + step);
    setMaxValue(value);
    maxValRef.current = value;
    onChange([minValue, value]);
  };

  return (
    <div className="dual-range-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        className="thumb thumb--left"
        style={{ zIndex: minValue > max - 100 && "5" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="thumb thumb--right"
      />

      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
      </div>
    </div>
  );
};

export default DualRangeSlider;

