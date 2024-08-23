import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 5;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 8;
const BRICK_WIDTH = 90;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const INITIAL_BALL_SPEED = 5;
const MAX_BALL_SPEED = 8;

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  // 게임의 현재상태를 관리
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'over'>('idle');

  const initializeBricks = () => {
    const bricks: Brick[] = [];
    for (let i = 0; i < BRICK_ROWS; i++) {
      for (let j = 0; j < BRICK_COLUMNS; j++) {
        bricks.push({ 
          x: j * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING, 
          y: i * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 30,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          visible: true 
        });
      }
    }
    return bricks;
  };


  const gameStateRef = useRef({
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 30,
    ballDX: INITIAL_BALL_SPEED,
    ballDY: -INITIAL_BALL_SPEED,
    bricks: [] as Brick[],
    gameOver: false
  });

  const limitBallSpeed = (speed: number) => {
    const currentSpeed = Math.sqrt(speed * speed);
    if (currentSpeed > MAX_BALL_SPEED) {
      return (speed / currentSpeed) * MAX_BALL_SPEED;
    }
    return speed;
  };

  // 게임상태를 초기화 
  const initializeGame = () => {
    gameStateRef.current = {
      paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT - 30,
      ballDX: INITIAL_BALL_SPEED,
      ballDY: -INITIAL_BALL_SPEED,
      bricks: initializeBricks(),
      gameOver: false
    };
    setScore(0);
    setGameStatus('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPaddle = () => {
      if (!ctx) return;
      ctx.fillStyle = 'white';
      ctx.fillRect(gameStateRef.current.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    };

    const drawBall = () => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(gameStateRef.current.ballX, gameStateRef.current.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      if (!ctx) return;
      gameStateRef.current.bricks.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = 'red';
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.strokeStyle = 'white';
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
      });
    };

    /** 주요 디버깅 해야 하는 포인트 1 */
    const collisionDetection = () => {
      gameStateRef.current.bricks.forEach(brick => {
        if (brick.visible) {
          if (
            gameStateRef.current.ballX > brick.x &&
            gameStateRef.current.ballX < brick.x + brick.width &&
            gameStateRef.current.ballY > brick.y &&
            gameStateRef.current.ballY < brick.y + brick.height
          ) {
            gameStateRef.current.ballDY = -gameStateRef.current.ballDY;
            gameStateRef.current.ballDY = limitBallSpeed(gameStateRef.current.ballDY * 1.05);
            gameStateRef.current.ballDX = limitBallSpeed(gameStateRef.current.ballDX * 1.05);
            brick.visible = false;
            setScore(prevScore => prevScore + 1);
          }
        }
      });
    };

    const movePaddle = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        gameStateRef.current.paddleX = relativeX - PADDLE_WIDTH / 2;
      }
    };

    canvas.addEventListener('mousemove', movePaddle);
    let renderFrame: number;

    const gameLoop = () => {
      if (gameStatus !== 'playing')  return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawBricks();
      drawPaddle();
      drawBall();
      collisionDetection();


      // x축 벽에 닿을 때
      if (gameStateRef.current.ballX + gameStateRef.current.ballDX > CANVAS_WIDTH - BALL_RADIUS || gameStateRef.current.ballX + gameStateRef.current.ballDX < BALL_RADIUS) {
        gameStateRef.current.ballDX = -gameStateRef.current.ballDX;
      }
      
      // y축 천장에 닿을 때
      if (gameStateRef.current.ballY + gameStateRef.current.ballDY < BALL_RADIUS) {
        gameStateRef.current.ballDY = -gameStateRef.current.ballDY;
      }
       // y축  땅에 닿을 때 
      else if (gameStateRef.current.ballY + gameStateRef.current.ballDY > CANVAS_HEIGHT - BALL_RADIUS) {
        if (
          // 공이 패들의 x축과 만나는가
          gameStateRef.current.ballX > gameStateRef.current.paddleX && gameStateRef.current.ballX < gameStateRef.current.paddleX + PADDLE_WIDTH
        ) {
          const hitPoint = (gameStateRef.current.ballX - (gameStateRef.current.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          gameStateRef.current.ballDX = hitPoint * 5;
          gameStateRef.current.ballDY = -Math.abs(gameStateRef.current.ballDY);
          gameStateRef.current.ballDX = limitBallSpeed(gameStateRef.current.ballDX);
          gameStateRef.current.ballDY = limitBallSpeed(gameStateRef.current.ballDY);
        } 
        // 패들과 부딪힌게 아니라면
        else {
          setGameStatus('over');
          return;
        }
      }

      gameStateRef.current.ballX += gameStateRef.current.ballDX;
      gameStateRef.current.ballY += gameStateRef.current.ballDY;

      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Score: ${score}`, 8, 20);

      renderFrame = requestAnimationFrame(gameLoop);
    };

    if (gameStatus === 'playing') {
      gameLoop();
    }

    return () => {
      canvas.removeEventListener('mousemove', movePaddle);
      cancelAnimationFrame(renderFrame)
    };
  }, [gameStatus, score]);

  const handleStartRestart = () => {
    initializeGame();
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-white"
      />
      {gameStatus === 'idle' && (
        <button 
          onClick={handleStartRestart}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Game
        </button>
      )}
      {gameStatus === 'over' && (
        <div className="mt-4 text-center">
          <p className="text-white text-xl mb-2">Game Over! Your score: {score}</p>
          <button 
            onClick={handleStartRestart}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;