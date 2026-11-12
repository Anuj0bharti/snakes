
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const statusElement = document.getElementById("gameStatus");

const GRID = 20;
const CELL = canvas.width / GRID;

let snake;
let food;
let direction;
let nextDirection;
let score = 0;
let highScore = Number(localStorage.getItem("nokiaSnakeBest")) || 0;

let gameRunning = false;
let gameOver = false;
let gameTimer = null;
let speed = 140;

highScoreElement.textContent = highScore;

// Initialize game
function initializeGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = "right";
    nextDirection = "right";

    score = 0;
    speed = 140;
    gameOver = false;

    scoreElement.textContent = score;

    generateFood();
    drawGame();

    statusElement.textContent = "READY";
}

// Generate food at random position
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID),
            y: Math.floor(Math.random() * GRID)
        };
    } while (
        snake.some(segment =>
            segment.x === food.x &&
            segment.y === food.y
        )
    );
}

// Draw game
function drawGame() {
    // LCD background
    ctx.fillStyle = "#9bbc0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle pixel grid
    ctx.strokeStyle = "rgba(40, 65, 15, 0.12)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(canvas.width, i * CELL);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#306230";
    ctx.fillRect(
        food.x * CELL + 4,
        food.y * CELL + 4,
        CELL - 8,
        CELL - 8
    );

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#0f380f" : "#306230";

        ctx.fillRect(
            segment.x * CELL + 1,
            segment.y * CELL + 1,
            CELL - 2,
            CELL - 2
        );

        // Snake head eyes
        if (index === 0) {
            ctx.fillStyle = "#9bbc0f";

            const eyeSize = 3;

            if (direction === "right" || direction === "left") {
                ctx.fillRect(
                    segment.x * CELL + (direction === "right" ? 13 : 4),
                    segment.y * CELL + 5,
                    eyeSize,
                    eyeSize
                );

                ctx.fillRect(
                    segment.x * CELL + (direction === "right" ? 13 : 4),
                    segment.y * CELL + 13,
                    eyeSize,
                    eyeSize
                );
            } else {
                ctx.fillRect(
                    segment.x * CELL + 5,
                    segment.y * CELL + (direction === "down" ? 13 : 4),
                    eyeSize,
                    eyeSize
                );

                ctx.fillRect(
                    segment.x * CELL + 13,
                    segment.y * CELL + (direction === "down" ? 13 : 4),
                    eyeSize,
                    eyeSize
                );
            }
        }
    });

    // Ready screen
    if (!gameRunning && !gameOver) {
        drawMessage("SNAKE II", "PRESS START");
    }

    // Pause screen
    if (!gameRunning && gameOver === false && statusElement.textContent === "PAUSED") {
        drawMessage("PAUSED", "PRESS START");
    }

    // Game over screen
    if (gameOver) {
        drawMessage("GAME OVER", "PRESS RESTART");
    }
}

// Draw screen messages
function drawMessage(title, subtitle) {
    ctx.fillStyle = "rgba(155, 188, 15, 0.92)";
    ctx.fillRect(35, 150, 330, 95);

    ctx.strokeStyle = "#0f380f";
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 150, 330, 95);

    ctx.textAlign = "center";
    ctx.fillStyle = "#0f380f";
    ctx.font = "bold 23px monospace";
    ctx.fillText(title, 200, 190);

    ctx.font = "bold 12px monospace";
    ctx.fillText(subtitle, 200, 220);
}

// Start game
function startGame() {
    if (gameRunning) return;

    if (gameOver) {
        initializeGame();
    }

    gameRunning = true;
    statusElement.textContent = "PLAYING";

    clearTimeout(gameTimer);
    drawGame();
    gameLoop();
}

// Pause game
function pauseGame() {
    if (!gameRunning) return;

    gameRunning = false;
    clearTimeout(gameTimer);

    statusElement.textContent = "PAUSED";
    drawGame();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();

    if (gameRunning) {
        gameTimer = setTimeout(gameLoop, speed);
    }
}

// Update snake position
function updateGame() {
    direction = nextDirection;

    const head = { ...snake[0] };

    switch (direction) {
        case "up":
            head.y--;
            break;

        case "down":
            head.y++;
            break;

        case "left":
            head.x--;
            break;

        case "right":
            head.x++;
            break;
    }

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= GRID ||
        head.y < 0 ||
        head.y >= GRID
    ) {
        endGame();
        return;
    }

    // Check whether snake eats food
    const ateFood =
        head.x === food.x &&
        head.y === food.y;

    // Ignore the tail if it will move away this turn
    const bodyToCheck = ateFood
        ? snake
        : snake.slice(0, -1);

    // Self collision
    if (
        bodyToCheck.some(segment =>
            segment.x === head.x &&
            segment.y === head.y
        )
    ) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (ateFood) {
        score += 10;
        scoreElement.textContent = score;

        // Increase speed gradually
        speed = Math.max(65, 140 - Math.floor(score / 50) * 8);

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("nokiaSnakeBest", highScore);
            highScoreElement.textContent = highScore;
        }

        generateFood();
    } else {
        snake.pop();
    }
}

// Game over
function endGame() {
    gameRunning = false;
    gameOver = true;

    clearTimeout(gameTimer);

    statusElement.textContent = "GAME OVER";
    drawGame();
}

// Change direction
function changeDirection(newDirection) {
    if (!gameRunning) return;

    const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    };

    if (newDirection !== opposite[direction]) {
        nextDirection = newDirection;
    }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
    const keys = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right"
    };

    const newDirection = keys[event.key] || keys[event.key.toLowerCase()];

    if (newDirection) {
        event.preventDefault();
        changeDirection(newDirection);
    }

    if (event.code === "Space") {
        event.preventDefault();

        if (gameRunning) {
            pauseGame();
        } else {
            startGame();
        }
    }
});

// Mobile navigation buttons
document.querySelectorAll("[data-dir]").forEach(button => {
    button.addEventListener("click", () => {
        changeDirection(button.dataset.dir);
    });
});

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 20) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        changeDirection(deltaX > 0 ? "right" : "left");
    } else {
        changeDirection(deltaY > 0 ? "down" : "up");
    }
}, { passive: true });

// Button events
document.getElementById("startBtn").addEventListener("click", startGame);

document.getElementById("pauseBtn").addEventListener("click", pauseGame);

document.getElementById("restartBtn").addEventListener("click", () => {
    clearTimeout(gameTimer);
    gameRunning = false;
    initializeGame();
    startGame();
});

// Initial setup
initializeGame();
