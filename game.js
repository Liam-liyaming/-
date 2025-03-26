const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 40; // 提升物理分辨率
const tileCount = canvas.width / gridSize;

let snake = [
  {x: 10, y: 10},
];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let baseSpeed = 1500; // 基础移动间隔（毫秒）
let lastMoveTime = 0;

function calculateSpeed() {
  const lengthFactor = Math.floor(snake.length / 5);
  return baseSpeed * Math.pow(0.9, lengthFactor);
}

function drawGame(timestamp) {
  const deltaTime = timestamp - lastMoveTime;
  const currentSpeed = calculateSpeed();
  
  // 基于时间差的帧率补偿
  if (!lastMoveTime || deltaTime >= currentSpeed) {
    lastMoveTime = timestamp;
    // 移动蛇身
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    // 碰撞检测
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreElement.textContent = score;
      generateFood();
    } else {
      snake.pop();
    }

    // 游戏结束判断
    if (isGameOver()) {
      gameOver();
      return;
    }

    // 清空画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize/2,
      food.y * gridSize + gridSize/2,
      gridSize/2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 绘制蛇身
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
      const opacity = 1 - index * 0.1;
      ctx.fillStyle = `rgba(76, 175, 80, ${opacity})`;
      ctx.beginPath();
    ctx.arc(
      segment.x * gridSize + gridSize/2,
      segment.y * gridSize + gridSize/2,
      gridSize/2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    });

    lastMoveTime = timestamp;
  }

  // 保持绘制逻辑不变
  gameLoop = requestAnimationFrame(drawGame);
}

function generateFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
  // 确保食物不生成在蛇身上
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

function isGameOver() {
  const head = snake[0];
  return (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  );
}

function gameOver() {
  cancelAnimationFrame(gameLoop);
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('游戏结束！', canvas.width/2 - 80, canvas.height/2);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp':
        if (dy !== 1) {
            dx = 0;
            dy = -1;
            const currentSpeed = calculateSpeed();
            lastMoveTime = performance.now() - currentSpeed;
        }
        break;
    case 'ArrowDown':
        if (dy !== -1) {
            dx = 0;
            dy = 1;
            const currentSpeed = calculateSpeed();
            lastMoveTime = performance.now() - currentSpeed;
        }
        break;
    case 'ArrowLeft':
        if (dx !== 1) {
            dx = -1;
            dy = 0;
            const currentSpeed = calculateSpeed();
            lastMoveTime = performance.now() - currentSpeed;
        }
        break;
    case 'ArrowRight':
        if (dx !== -1) {
            dx = 1;
            dy = 0;
            const currentSpeed = calculateSpeed();
            lastMoveTime = performance.now() - currentSpeed;
        }
        break;
  }
});

// 重新开始游戏
restartBtn.addEventListener('click', () => {
  snake = [{x: 10, y: 10}];
  food = {x: 15, y: 15};
  dx = 0;
  dy = 0;
  score = 0;
  scoreElement.textContent = score;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  cancelAnimationFrame(gameLoop);
  lastMoveTime = performance.now(); // 使用当前时间初始化
  gameLoop = requestAnimationFrame(drawGame);
});

// 开始游戏
drawGame();
