import React from 'react';

interface VolumeSliderProps {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel: string;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onChange, ariaLabel }) => {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-full"
    />
  );
};

export default VolumeSlider;