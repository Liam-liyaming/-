const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 40; // 提升物理分辨率
const tileCount = canvas.width / gridSize;
let foodParticles = [];

let snake = [
  {x: 5, y: 5},
];
let food = {x: 15, y: 15};
let dx = 1;
let dy = 0;
let score = 0;
let gameLoop;
let baseSpeed = 1500; // 基础移动间隔（毫秒）
let lastMoveTime = performance.now();

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
      const eatenFood = {x: food.x, y: food.y}; // 保存被吃食物坐标
      generateParticles(eatenFood); // 使用旧坐标生成粒子
      generateFood(); // 生成新食物
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
    // 绘制苹果主体
    ctx.fillStyle = '#FF3300';
    ctx.beginPath();
    ctx.moveTo(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize*0.2);
    ctx.bezierCurveTo(
      food.x * gridSize + gridSize*0.8, food.y * gridSize - gridSize*0.2,
      food.x * gridSize + gridSize*1.0, food.y * gridSize + gridSize*0.6,
      food.x * gridSize + gridSize/2, food.y * gridSize + gridSize*0.8
    );
    ctx.bezierCurveTo(
      food.x * gridSize - gridSize*0.3, food.y * gridSize + gridSize*0.6,
      food.x * gridSize + gridSize*0.2, food.y * gridSize - gridSize*0.2,
      food.x * gridSize + gridSize/2, food.y * gridSize + gridSize*0.2
    );
    ctx.fill();

    // 绘制苹果叶子
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.moveTo(food.x * gridSize + gridSize*0.6, food.y * gridSize - gridSize*0.1);
    ctx.quadraticCurveTo(
      food.x * gridSize + gridSize*0.8, food.y * gridSize - gridSize*0.3,
      food.x * gridSize + gridSize*0.4, food.y * gridSize - gridSize*0.2
    );
    ctx.fill();

    // 更新和绘制食物粒子
    updateParticles();

    // 绘制蛇身
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
      const opacity = Math.max(0.8, 1 - index / (snake.length * 0.5));
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
  dx = 1;
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

function generateParticles(eatenFood) {
  const particleCount = Math.floor(Math.random() * 5) + 8;
  for (let i = 0; i < particleCount; i++) {
    foodParticles.push({
      x: eatenFood.x * gridSize + gridSize/2,
      y: eatenFood.y * gridSize + gridSize/2,
      dx: (Math.random() - 0.5) * 12,
      dy: (Math.random() - 0.5) * 12,
      alpha: 1,
      decay: 0.2,
      size: Math.random() * 3 + 2
    });
  }
}

function updateParticles() {
  ctx.fillStyle = '#FF3300';
  foodParticles.forEach((p, index) => {
    p.x += p.dx;
    p.y += p.dy;
    p.dy += 0.3;
    p.alpha -= 0.1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.globalAlpha = p.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (p.alpha <= 0) {
      foodParticles.splice(index, 1);
    }
  });
}
