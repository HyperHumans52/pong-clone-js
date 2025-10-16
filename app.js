const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 20;
const paddleHeight = 90;
const paddleSpeed = 5; // Vertical speed (pixels per frame)
const goalPadding = 30; // Space between goal and paddle
const ballSize = 10; // Width and height of the ball
const ballSpeed = 5; // Velocity of the ball (pixels per frame)
const winningScore = 10;
const wallHitSound = new Audio('assets/audio/wall.mp3');
const paddleHitSound = new Audio('assets/audio/paddle.mp3');
const goalSound = new Audio('assets/audio/goal.mp3');

let player1 = { x: goalPadding, y: canvas.height / 2 - paddleHeight / 2 }; // Starting position of player 1
let player2 = { x: canvas.width - (goalPadding + paddleWidth), y: canvas.height / 2 - paddleHeight / 2 }; // Starting position of player 2
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: ballSpeed, dy: ballSpeed }; // Starting position and velocity of the ball
let player1Score = 0;
let player2Score = 0;
let gameRunning = false;
let canPlay = false;

// Set up/preload images for scoring
const imageFiles = Array.from({ length: 10 }, (_, i) => i + '.png'); // Array of image file names
const images = await Promise.all(
    imageFiles.map(
        (file) =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = 'assets/images/' + file;
            })
    )
);

// Preload audio
const audioFiles = ['assets/audio/wall.mp3', 'assets/audio/paddle.mp3', 'assets/audio/goal.mp3'];
const audioPromises = audioFiles.map(
    (file) =>
        new Promise((resolve, reject) => {
            const audio = new Audio(file);
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
        })
);
const sounds = await Promise.all(audioPromises);

if (images.length === imageFiles.length && sounds.length === audioFiles.length) {
    canPlay = true;
}

const keys = {}; // Object to store pressed keys
document.addEventListener('keydown', (e) => {
    if (gameRunning) {
        keys[e.key] = true;
    } else {
        resetGame();
        gameRunning = true;
        gameLoop();
    }
});
document.addEventListener('keyup', (e) => {
    delete keys[e.key];
});

function drawGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#999';
    ctx.stroke();

    // Set the color for paddle, ball, and scores
    ctx.fillStyle = '#fff';

    // Draw paddles
    ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight); // Draw player 1
    ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight); // Draw player 2

    // Draw ball
    ctx.fillRect(ball.x - ballSize / 2, ball.y - ballSize / 2, ballSize, ballSize); // Implement squared ball

    // Display scores
    const score1Digits = player1Score.toString().split('').reverse();
    const score2Digits = player2Score.toString().split('');
    score1Digits.forEach((digit, index) => {
        ctx.drawImage(images[digit], canvas.width / 2 - 64 - 40 * index, 14);
    });
    score2Digits.forEach((digit, index) => {
        ctx.drawImage(images[digit], canvas.width / 2 + 32 + 40 * index, 14);
    });

    // Check if game is over and display "Game Over" message
    if (!gameRunning) {
        if (player1Score === winningScore || player2Score === winningScore) {
            // Game over
            ctx.fillStyle = '#fff';
            ctx.font = '72px Courier New';
            ctx.fillText('Game Over', canvas.width / 2 - 195, canvas.height / 2);
            ctx.font = '24px Courier New';
            ctx.fillText('Press any key to restart', canvas.width / 2 - 170, canvas.height / 2 + 36);
        } else {
            // Game start
            ctx.fillStyle = '#fff';
            ctx.font = '24px Courier New';
            ctx.fillText('Press any key to start', canvas.width / 2 - 160, canvas.height / 2 - 36);
        }
    }
}

function updateGame() {
    // Player 1 movement
    if ('w' in keys && player1.y > 0) {
        player1.y -= paddleSpeed;
    }
    if ('s' in keys && player1.y < canvas.height - paddleHeight) {
        player1.y += paddleSpeed;
    }
    // aiPlayerControl(player1);
    // Player 2 movement
    // if ('ArrowUp' in keys && player2.y > 0) {
    //     player2.y -= paddleSpeed;
    // }
    // if ('ArrowDown' in keys && player2.y < canvas.height - paddleHeight) {
    //     player2.y += paddleSpeed;
    // }
    aiPlayerControl(player2);

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check for collision with top or bottom wall
    if (ball.y - ballSize / 2 <= 0 || ball.y + ballSize / 2 >= canvas.height) {
        wallHitSound.play();
        ball.dy = -ball.dy;
    }

    // Check for collision with player 1
    if (
        ball.x - ballSize / 2 < player1.x + paddleWidth &&
        ball.x + ballSize / 2 > player1.x &&
        ball.y + ballSize / 2 > player1.y &&
        ball.y - ballSize / 2 < player1.y + paddleHeight
    ) {
        handleCollision(player1);
    }

    // Check for collision with player 2
    if (
        ball.x + ballSize / 2 > player2.x &&
        ball.x - ballSize / 2 < player2.x + paddleWidth &&
        ball.y + ballSize / 2 > player2.y &&
        ball.y - ballSize / 2 < player2.y + paddleHeight
    ) {
        handleCollision(player2);
    }

    // Check for collision with left or right wall and update score
    if (ball.x < 0) {
        updateScore(2);
    } else if (ball.x > canvas.width) {
        updateScore(1);
    }

    // Check score for game over
    if (player1Score >= winningScore || player2Score >= winningScore) {
        // Stop the game loop
        gameRunning = false;
    }
}

function handleCollision(player) {
    const paddleCenter = player.y + paddleHeight / 2;
    const distanceFromCenter = paddleCenter - ball.y;
    paddleHitSound.play();
    ball.x = player.x < canvas.width / 2 ? player1.x + paddleWidth + ballSize / 2 : player.x - ballSize / 2; // Reposition the ball to the right of the paddle to avoid trapping the ball in the paddle
    ball.dx = -ball.dx;
    ball.dy -= 0.1 * distanceFromCenter; // Adjust the ball's velocity based on the distance from the paddle's center
}

function updateScore(player) {
    goalSound.play();
    if (player === 1) player1Score++;
    else player2Score++;
    resetBall(player === 1 ? 2 : 1);
}

function resetBall(player) {
    // Reset position
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - 20) + 10;
    // Reset velocity
    ball.dx = player === 1 ? -ballSpeed : ballSpeed;
    ball.dy = ballSpeed * (Math.random() < 0.5 ? -1 : 1);
}

function resetGame() {
    // Reset scores
    player1Score = 0;
    player2Score = 0;
    // Reset paddle positions
    player1.y = canvas.height / 2 - paddleHeight / 2;
    player2.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
}

function aiPlayerControl(player) {
    const paddleCenter = player.y + paddleHeight / 2;
    // Check if ball is moving towards player on the right side of the canvas
    if (
        (ball.x > canvas.width / 2 && ball.dx > 0 && player.x > canvas.width / 2) ||
        (ball.x < canvas.width / 2 && ball.dx < 0 && player.x < canvas.width / 2)
    ) {
        // Move player to follow the ball
        if (paddleCenter < ball.y) {
            player.y += paddleSpeed;
        } else if (paddleCenter > ball.y) {
            player.y -= paddleSpeed;
        }
        // Prevent player from going off the canvas
        if (player.y < 0) {
            player.y = 0;
        } else if (player.y + paddleHeight > canvas.height) {
            player.y = canvas.height - paddleHeight;
        }
    }
}

if (canPlay) drawGame(); // Initial draw

function gameLoop() {
    if (!gameRunning) return;
    updateGame(); // Update game logic (player movement, collisions, etc.)
    drawGame(); // Redraw elements on the canvas
    requestAnimationFrame(gameLoop); // Schedule next frame
}
gameLoop(); // Start the game
