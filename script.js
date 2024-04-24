const numberOfBalls = 30;
const balls = [];
const ballBox = document.querySelector('.ballBox');
const maxX = ballBox.clientWidth;
const maxY = ballBox.clientHeight;
const gravityStrength = 0.2; // Adjust gravity strength
const horizontalMomentum = 0.05; // Adjust horizontal momentum
const elasticity = 0.8; // Adjust elasticity
const dragTargets = new Set();

for (let i = 0; i < numberOfBalls; i++) {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.top = `${Math.random() * maxY}px`;
    ball.style.left = `${Math.random() * maxX}px`;

    const title = document.createElement('span');
    title.textContent = `${i}`;
    ball.appendChild(title);

    ballBox.appendChild(ball);
    balls.push(ball);

    let velocityX = 0;
    let velocityY = 0;

    ball.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dragTargets.add(ball);
        const rect = ball.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        function moveBall(e) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            ball.style.left = `${Math.max(0, Math.min(maxX - ball.clientWidth, x))}px`;
            ball.style.top = `${Math.max(0, Math.min(maxY - ball.clientHeight, y))}px`;
        }

        function releaseBall() {
            dragTargets.delete(ball);
            document.removeEventListener('mousemove', moveBall);
            document.removeEventListener('mouseup', releaseBall);
        }

        document.addEventListener('mousemove', moveBall);
        document.addEventListener('mouseup', releaseBall);
    });

    balls[i].velocityX = velocityX;
    balls[i].velocityY = velocityY;
}

function gravity(ball) {
    if (!dragTargets.has(ball)) {
        ball.velocityY += gravityStrength; // Apply gravity
        ball.style.top = `${parseFloat(ball.style.top) + ball.velocityY}px`;
    }
}

function updateBalls() {
    balls.forEach(ball => {
        gravity(ball);
        checkWallCollisions(ball);
    });

    checkCollisions();

    requestAnimationFrame(updateBalls);
}

function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < balls.length; j++) {
            if (i !== j) {
                const ball1 = balls[i];
                const ball2 = balls[j];

                const distance = getDistance(getCenter(ball1), getCenter(ball2));
                const minDistance = ball1.clientWidth / 2 + ball2.clientWidth / 2;

                if (distance < minDistance) {
                    const angle = Math.atan2(getCenter(ball2).y - getCenter(ball1).y, getCenter(ball2).x - getCenter(ball1).x);
                    const pushDistance = minDistance - distance;

                    const newX1 = getCenter(ball1).x - pushDistance * Math.cos(angle) / 2;
                    const newY1 = getCenter(ball1).y - pushDistance * Math.sin(angle) / 2;

                    const newX2 = getCenter(ball2).x + pushDistance * Math.cos(angle) / 2;
                    const newY2 = getCenter(ball2).y + pushDistance * Math.sin(angle) / 2;

                    ball1.style.left = `${newX1 - ball1.clientWidth / 2}px`;
                    ball1.style.top = `${newY1 - ball1.clientHeight / 2}px`;

                    ball2.style.left = `${newX2 - ball2.clientWidth / 2}px`;
                    ball2.style.top = `${newY2 - ball2.clientHeight / 2}px`;

                    checkWallCollisions(ball1);
                    checkWallCollisions(ball2);

                    // Apply elastic bounce effect
                    const relativeVelocityX = ball2.velocityX - ball1.velocityX;
                    const relativeVelocityY = ball2.velocityY - ball1.velocityY;

                    ball1.velocityX += relativeVelocityX * elasticity;
                    ball1.velocityY += relativeVelocityY * elasticity;

                    ball2.velocityX -= relativeVelocityX * elasticity;
                    ball2.velocityY -= relativeVelocityY * elasticity;
                }
            }
        }
    }
}

function checkWallCollisions(ball) {
    const ballRect = ball.getBoundingClientRect();

    if (ballRect.left < 0) {
        ball.style.left = '0';
        ball.velocityX *= -elasticity; // Bounce effect when hitting the left wall
    }

    if (ballRect.right > maxX) {
        ball.style.left = `${maxX - ball.clientWidth}px`;
        ball.velocityX *= -elasticity; // Bounce effect when hitting the right wall
    }

    if (ballRect.top < 0) {
        ball.style.top = '0';
        ball.velocityY *= -elasticity; // Bounce effect when hitting the top wall
    }

    if (ballRect.bottom > maxY) {
        ball.style.top = `${maxY - ball.clientHeight}px`;
        ball.velocityY *= -elasticity; // Bounce effect when hitting the bottom wall
    }
}

function getCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

updateBalls(); // Start the animation loop
