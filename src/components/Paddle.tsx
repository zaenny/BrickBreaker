import React from 'react';

interface PaddleProps {
  x: number;
  width: number;
  height: number;
}

const Paddle: React.FC<PaddleProps> = ({ x, width, height }) => {
  return (
    <rect x={x} y={600 - height} width={width} height={height} fill="white" />
  );
};

export default Paddle;