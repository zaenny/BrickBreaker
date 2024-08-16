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
const INITIAL_BALL_SPEED = 3;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    gameStateRef.current.bricks = initializeBricks();

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

    const gameLoop = () => {
      if (gameStateRef.current.gameOver) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawBricks();
      drawPaddle();
      drawBall();
      collisionDetection();

      if (gameStateRef.current.ballX + gameStateRef.current.ballDX > CANVAS_WIDTH - BALL_RADIUS || gameStateRef.current.ballX + gameStateRef.current.ballDX < BALL_RADIUS) {
        gameStateRef.current.ballDX = -gameStateRef.current.ballDX;
      }
      if (gameStateRef.current.ballY + gameStateRef.current.ballDY < BALL_RADIUS) {
        gameStateRef.current.ballDY = -gameStateRef.current.ballDY;
      } else if (gameStateRef.current.ballY + gameStateRef.current.ballDY > CANVAS_HEIGHT - BALL_RADIUS) {
        if (gameStateRef.current.ballX > gameStateRef.current.paddleX && gameStateRef.current.ballX < gameStateRef.current.paddleX + PADDLE_WIDTH) {
          let hitPoint = (gameStateRef.current.ballX - (gameStateRef.current.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          gameStateRef.current.ballDX = hitPoint * 5;
          gameStateRef.current.ballDY = -Math.abs(gameStateRef.current.ballDY);
          
          gameStateRef.current.ballDX = limitBallSpeed(gameStateRef.current.ballDX);
          gameStateRef.current.ballDY = limitBallSpeed(gameStateRef.current.ballDY);
        } else {
          gameStateRef.current.gameOver = true;
          alert('GAME OVER');
          return;
        }
      }

      gameStateRef.current.ballX += gameStateRef.current.ballDX;
      gameStateRef.current.ballY += gameStateRef.current.ballDY;

      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Score: ${score}`, 8, 20);

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', movePaddle);
    };
  }, [score]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-white"
      />
    </div>
  );
};

export default Game;