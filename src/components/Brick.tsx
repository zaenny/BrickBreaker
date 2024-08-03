import React from 'react';

interface BrickProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Brick: React.FC<BrickProps> = ({ x, y, width, height }) => {
  return (
    <rect x={x} y={y} width={width} height={height} fill="red" stroke="white" strokeWidth={2} />
  );
};

export default Brick;