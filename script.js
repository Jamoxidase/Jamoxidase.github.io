document.addEventListener('DOMContentLoaded', function() {
    const numberOfBalls = 15;
    const balls = [];
    const ballBox = document.querySelector('.ballBox');
    const maxX = ballBox.clientWidth;
    const maxY = ballBox.clientHeight;
    const gravityStrength = 2; // Adjust gravity strength
    const elasticity = 0.5; // Adjust elasticity
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

        ball.velocityX = 0; // Added velocityX property
        ball.velocityY = 0; // Added velocityY property

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
    }

    function getCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}


function launchBalls() {
        balls.forEach(ball => {
            ball.velocityX = (Math.random() - 0.5) * 20; // Random X velocity
            ball.velocityY = -(Math.random() * 30 + 10); // Random Y velocity
        });
    }

    document.getElementById('launchButton').addEventListener('click', launchBalls); // Added event listener



function gravity(ball) {
    if (!dragTargets.has(ball)) {
        const currentY = parseFloat(ball.style.top) || 0;
        const newY = currentY + ball.velocityY;

        if (newY > maxY - ball.clientHeight) {
            ball.style.top = `${maxY - ball.clientHeight}px`; // Set to the bottom
            ball.velocityY *= -elasticity; // Bounce effect when hitting the bottom
        } else {
            ball.style.top = `${newY}px`;
            ball.velocityY += gravityStrength; // Apply gravity
        }

        const currentX = parseFloat(ball.style.left) || 0;
        const newX = currentX + ball.velocityX;

        if (newX < 0 || newX > maxX - ball.clientWidth) { // Added boundary check for X-axis
            ball.velocityX *= -elasticity; // Bounce effect when hitting the walls
        } else {
            ball.style.left = `${newX}px`;
        }

        // Check for collisions with other balls
        balls.forEach(otherBall => {
            if (otherBall !== ball) {
                const distance = getDistance(getCenter(ball), getCenter(otherBall));
                const minDistance = ball.clientWidth / 2 + otherBall.clientWidth / 2;

                if (distance < minDistance) {
                    // Move the ball away from the other ball
                    const angle = Math.atan2(getCenter(otherBall).y - getCenter(ball).y, getCenter(otherBall).x - getCenter(ball).x);
                    const overlap = minDistance - distance;
                    const moveX = overlap * Math.cos(angle);
                    const moveY = overlap * Math.sin(angle);

                    ball.style.left = `${parseFloat(ball.style.left) - moveX}px`;
                    ball.style.top = `${parseFloat(ball.style.top) - moveY}px`;

                    // Adjust velocities for both balls to avoid sticking
                    const relativeVelocityX = otherBall.velocityX - ball.velocityX;
                    const relativeVelocityY = otherBall.velocityY - ball.velocityY;

                    const normalVelocity = relativeVelocityX * Math.cos(angle) + relativeVelocityY * Math.sin(angle);

                    if (normalVelocity > 0) {
                        const mass1 = ball.clientWidth ** 2;
                        const mass2 = otherBall.clientWidth ** 2;
                        const impulse = 2 * normalVelocity / (mass1 + mass2);

                        ball.velocityX += impulse * Math.cos(angle) * mass2;
                        ball.velocityY += impulse * Math.sin(angle) * mass2;
                        otherBall.velocityX -= impulse * Math.cos(angle) * mass1;
                        otherBall.velocityY -= impulse * Math.sin(angle) * mass1;
                    }
                }
            }
        });
    }
}


function updateBalls() {
    balls.forEach(ball => {
        gravity(ball);
        ball.style.left = `${parseFloat(ball.style.left) + ball.velocityX}px`; // Apply horizontal momentum
        checkWallCollisions(ball);
    });

    checkCollisions();

    requestAnimationFrame(updateBalls);
}

function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) { // Start from i + 1 to avoid checking pairs twice
            const ball1 = balls[i];
            const ball2 = balls[j];

            const distance = getDistance(getCenter(ball1), getCenter(ball2));
            const minDistance = ball1.clientWidth / 2 + ball2.clientWidth / 2;

            if (distance < minDistance) {
                const angle = Math.atan2(getCenter(ball2).y - getCenter(ball1).y, getCenter(ball2).x - getCenter(ball1).x);

                // Calculate relative velocity components
                const dx = ball2.velocityX - ball1.velocityX;
                const dy = ball2.velocityY - ball1.velocityY;

                // Project relative velocity onto collision normal
                const normalVelocity = dx * Math.cos(angle) + dy * Math.sin(angle);

                // If balls are moving away from each other, no collision response needed
                if (normalVelocity <= 0) {
                    continue;
                }

                // Calculate masses (using area as approximation)
                const mass1 = ball1.clientWidth ** 2;
                const mass2 = ball2.clientWidth ** 2;

                // Calculate impulse (change in velocity)
                const impulse = 2 * normalVelocity / (mass1 + mass2);

                // Update velocities
                ball1.velocityX += impulse * Math.cos(angle) * mass2;
                ball1.velocityY += impulse * Math.sin(angle) * mass2;
                ball2.velocityX -= impulse * Math.cos(angle) * mass1;
                ball2.velocityY -= impulse * Math.sin(angle) * mass1;
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
