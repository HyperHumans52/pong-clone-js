const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 20;
const paddleHeight = 90;
const paddleSpeed = 5; // Vertical speed (pixels per frame)
const goalPadding = 30; // Space between goal and paddle
const ballSize = 10; // Width and height of the ball
const ballSpeed = 5; // Velocity of the ball (pixels per frame)
const winningScore = 10;

let player1 = { x: goalPadding, y: canvas.height / 2 - paddleHeight / 2 }; // Starting position of player 1
let player2 = { x: canvas.width - (goalPadding + paddleWidth), y: canvas.height / 2 - paddleHeight / 2 }; // Starting position of player 2
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: ballSpeed, dy: ballSpeed }; // Starting position and velocity of the ball
let player1Score = 0;
let player2Score = 0;

function drawGame() {
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
    ctx.fillStyle = '#fff';
    ctx.font = '72px Courier New';
    ctx.fillText(player1Score, canvas.width / 2 - (player1Score < 10 ? 80 : 120), 100); // Adjust position for single-digit scores
    ctx.fillText(player2Score, canvas.width / 2 + 40, 100);
}

drawGame();
