import React from 'react';

type PercentageBarProps = {
  percentage: number;
  direction: 'left' | 'right';
  color: string;
};

const PercentageBar: React.FC<PercentageBarProps> = ({ percentage, direction, color }) => {
  const barStyle = {
    width: `${percentage}%`,
    backgroundColor: color,
  };

  return (
    <div className="relative w-full bg-gray-700 rounded-full h-4 flex items-center m-1">
      <div
        className={`absolute h-full rounded-full ${direction === 'left' ? 'right-0' : 'left-0'}`}
        style={barStyle}
      ></div>
      <span
        className={`absolute text-[10px] font-semibold text-white ${
          direction === 'left' ? 'left-2' : 'right-2'
        }`}
        style={{ zIndex: 1 }} // Ensure the text stays above the fill
      >
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
};

export default PercentageBar;