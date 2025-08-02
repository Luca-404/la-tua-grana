import React from 'react';

interface ColorSwatchProps {
  color?: string;
  className?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, className }) => {
  return (
    <div
      className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${className || ''}`}
      style={{ backgroundColor: color } as React.CSSProperties}
    />
  );
};

export default ColorSwatch;