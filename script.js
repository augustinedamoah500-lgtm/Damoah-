// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;

// Player paddle
const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    mouseY: canvas.height / 2
};

// Computer paddle
const computer = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballRadius,
    maxSpeed: 8
};

// Score
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Keyboard input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.mouseY = e.clientY - rect.top;
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Draw background
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawLine(canvas.width / 2, 0, canvas.width / 2, canvas.height, '#00ff00');
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff00');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff0080');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Update functions
function updatePlayerPaddle() {
    // Use arrow keys or mouse position
    if (keys['ArrowUp'] || keys['w']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // Also allow mouse control - move paddle to follow mouse
    const targetY = player.mouseY - player.height / 2;
    const diff = targetY - player.y;
    
    if (Math.abs(diff) > 5) {
        player.y += diff * 0.15; // Smooth mouse following
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // AI: Follow the ball with some delay
    const difference = ballCenter - computerCenter;
    const threshold = 35;
    
    if (difference > threshold) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (difference < -threshold) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
    
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (player.y + player.height / 2);
        ball.dy = collidePoint * 0.15;
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        ball.dy = collidePoint * 0.15;
    }
    
    // Limit ball speed
    const speed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
    if (speed > ball.maxSpeed) {
        ball.dx = (ball.dx / speed) * ball.maxSpeed;
        ball.dy = (ball.dy / speed) * ball.maxSpeed;
    }
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    drawGame();
    
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    } else {
        // Draw "PAUSED" text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize and start
updateScore();
gameLoop();