import React, { useState, useEffect, useRef } from 'react';
import Paddle from './Paddle';
import Ball from './Ball';
import Brick from './Brick';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState({
    paddle: { x: 350, width: 100, height: 10 },
    ball: { x: 400, y: 550, dx: 2, dy: -2, radius: 5 },
    bricks: [] as { x: number, y: number, width: number, height: number }[],
    score: 0,
  });

  //useEffect가 아닌 useRef를 사용한 이유 - 블로그 작성해보기 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 게임 초기화 및 애니메이션 프레임 설정
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    // 벽돌 초기화
    const bricks = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
        bricks.push({
            x: j * 100 + 5,
            y: i * 30 + 30,
            width: 90,
            height: 20,
        });
        }
    }
    setGameState(prev => ({ ...prev, bricks }));

    // 게임 루프
    let animationFrameId: number;
    const gameLoop = () => {
        updateGameState();
        drawGame();
        animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const updateGameState = () => {
    // 게임 상태 업데이트 로직
  };

  const drawGame = () => {
    // 캔버스에 게임 요소 그리기
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-white"
      />
    </div>
  );
};


export default Game;