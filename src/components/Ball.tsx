import React from 'react';

interface BallProps {
  x: number;
  y: number;
  radius: number;
}

const Ball: React.FC<BallProps> = ({ x, y, radius }) => {
  return (
    <circle cx={x} cy={y} r={radius} fill="white" />
  );
};

export default Ball;