const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Game objects
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
let playerScore = 0;
let computerScore = 0;
const maxScore = 10; // End game when this score is reached

const player = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0
};

const computer = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  speed: 4
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: ballSize,
  dx: 4 * (Math.random() > 0.5 ? 1 : -1),
  dy: 4 * (Math.random() > 0.5 ? 1 : -1),
  maxSpeed: 8
};

let gameRunning = false;
let mouseY = canvas.height / 2;

// Draw functions
function drawPaddle(paddle, isPlayer = false) {
  ctx.fillStyle = isPlayer ? '#0f0' : '#0f0';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 10;
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
  ctx.shadowColor = 'transparent';
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawScore() {
  document.getElementById('player-score').innerText = playerScore;
  document.getElementById('computer-score').innerText = computerScore;
}

// Game functions
function movePlayerPaddle() {
  player.y += player.dy;
  
  // Mouse tracking
  if (mouseY) {
    let targetY = mouseY - player.height / 2;
    if (Math.abs(targetY - player.y) > 5) {
      player.y += (targetY - player.y) * 0.1;
    }
  }
  
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function moveComputerPaddle() {
  const computerCenter = computer.y + computer.height / 2;
  const ballCenter = ball.y + ball.size / 2;
  
  if (ballCenter < computerCenter - 10) {
    computer.y -= computer.speed;
  } else if (ballCenter > computerCenter + 10) {
    computer.y += computer.speed;
  }
  
  if (computer.y < 0) computer.y = 0;
  if (computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;
}

function moveBall() {
  if (!gameRunning) return;
  
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (top/bottom)
  if (ball.y < 0 || ball.y + ball.size > canvas.height) {
    ball.dy *= -1;
    if (ball.y < 0) ball.y = 0;
    if (ball.y + ball.size > canvas.height) ball.y = canvas.height - ball.size;
  }

  // Player paddle collision
  if (
    ball.x < player.x + player.width &&
    ball.x + ball.size > player.x &&
    ball.y < player.y + player.height &&
    ball.y + ball.size > player.y
  ) {
    ball.dx = Math.abs(ball.dx);
    ball.x = player.x + player.width;
    
    // Add spin based on where ball hits paddle
    const hitPos = (ball.y - player.y) / player.height;
    ball.dy = (hitPos - 0.5) * 8;
    
    // Speed up slightly
    if (Math.abs(ball.dx) < ball.maxSpeed) ball.dx *= 1.05;
    if (Math.abs(ball.dy) < ball.maxSpeed) ball.dy *= 1.05;
  }

  // Computer paddle collision
  if (
    ball.x + ball.size > computer.x &&
    ball.x < computer.x + computer.width &&
    ball.y < computer.y + computer.height &&
    ball.y + ball.size > computer.y
  ) {
    ball.dx = -Math.abs(ball.dx);
    ball.x = computer.x - ball.size;
    
    // Add spin based on where ball hits paddle
    const hitPos = (ball.y - computer.y) / computer.height;
    ball.dy = (hitPos - 0.5) * 8;
    
    // Speed up slightly
    if (Math.abs(ball.dx) < ball.maxSpeed) ball.dx *= 1.05;
    if (Math.abs(ball.dy) < ball.maxSpeed) ball.dy *= 1.05;
  }

  // Scoring
  if (ball.x < 0) {
    computerScore++;
    drawScore();
    resetBall();
  } else if (ball.x > canvas.width) {
    playerScore++;
    drawScore();
    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);

  if (playerScore === maxScore || computerScore === maxScore) {
    const winner = playerScore === maxScore ? 'Player' : 'Computer';
    setTimeout(() => {
      alert(`Game Over! ${winner} wins! Final Score: Player ${playerScore} - Computer ${computerScore}`);
      playerScore = 0;
      computerScore = 0;
      gameRunning = false;
      drawScore();
    }, 100);
  }
}

// Main game loop
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(player, true);
  drawPaddle(computer, false);
  drawBall();

  movePlayerPaddle();
  moveComputerPaddle();
  moveBall();

  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    player.dy = -6;
  } else if (e.key === 'ArrowDown') {
    player.dy = 6;
  } else if (e.key === ' ') {
    e.preventDefault();
    gameRunning = !gameRunning;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    player.dy = 0;
  }
});

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
  mouseY = null;
});

// Start game loop
gameLoop();