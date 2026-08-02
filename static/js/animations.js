/* Interactive Canvas Particle Animations - QR Wishes */

// --- 1. CONFETTI EMITTER ---
let confettiCanvas = null;
let confettiCtx = null;
let confettiActive = false;
let confettiParticles = [];
const CONFETTI_COLORS = ['#ff3388', '#0066cc', '#cc9900', '#00ffcc', '#ff6600', '#a855f7', '#10b981', '#f59e0b'];

function startConfettiEmitter() {
    confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;
    
    confettiCtx = confettiCanvas.getContext('2d');
    confettiActive = true;
    
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
    
    // Generate initial particles
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
        confettiParticles.push(createConfettiParticle(true));
    }
    
    requestAnimationFrame(updateConfetti);
}

function resizeConfettiCanvas() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

function createConfettiParticle(isInitial = false) {
    return {
        x: Math.random() * confettiCanvas.width,
        y: isInitial ? Math.random() * -confettiCanvas.height : -10,
        size: Math.random() * 8 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        oscillationSpeed: Math.random() * 0.03 + 0.01,
        oscillationAmplitude: Math.random() * 20 + 10,
        oscillationAngle: Math.random() * Math.PI
    };
}

function updateConfetti() {
    if (!confettiActive || !confettiCtx) return;
    
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles.forEach((p, idx) => {
        // Move particle
        p.y += p.speedY;
        p.oscillationAngle += p.oscillationSpeed;
        p.x += p.speedX + Math.sin(p.oscillationAngle) * 0.5;
        p.rotation += p.rotationSpeed;
        
        // Draw particle
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        
        // Random shape: rectangle or triangle
        if (idx % 3 === 0) {
            // Triangle
            confettiCtx.beginPath();
            confettiCtx.moveTo(0, -p.size / 2);
            confettiCtx.lineTo(p.size / 2, p.size / 2);
            confettiCtx.lineTo(-p.size / 2, p.size / 2);
            confettiCtx.closePath();
            confettiCtx.fill();
        } else {
            // Rectangle
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        }
        
        confettiCtx.restore();
        
        // Recycle particle if out of screen
        if (p.y > confettiCanvas.height) {
            confettiParticles[idx] = createConfettiParticle(false);
        }
    });
    
    requestAnimationFrame(updateConfetti);
}

// --- 2. FIREWORKS EXPLOSIONS ---
let fireworksCanvas = null;
let fireworksCtx = null;
let fireworksActive = false;
let fireworksParticles = [];
let fireworkRockets = [];
const FIREWORK_COLORS = ['#ff1f5a', '#3026ff', '#ffd700', '#00ffcc', '#ff9900', '#ff00ff', '#ffffff'];

function startFireworksDisplay() {
    fireworksCanvas = document.getElementById('fireworks-canvas');
    if (!fireworksCanvas) return;
    
    fireworksCtx = fireworksCanvas.getContext('2d');
    fireworksActive = true;
    
    resizeFireworksCanvas();
    window.addEventListener('resize', resizeFireworksCanvas);
    
    fireworksParticles = [];
    fireworkRockets = [];
    
    // Auto launch rockets periodically
    launchRocketLoop();
    
    requestAnimationFrame(updateFireworks);
}

function resizeFireworksCanvas() {
    if (fireworksCanvas) {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
}

function launchRocketLoop() {
    if (!fireworksActive) return;
    
    // Launch a rocket
    const startX = Math.random() * (fireworksCanvas.width - 200) + 100;
    const startY = fireworksCanvas.height;
    const targetX = startX + (Math.random() * 200 - 100);
    const targetY = Math.random() * (fireworksCanvas.height * 0.4) + (fireworksCanvas.height * 0.1);
    
    fireworkRockets.push({
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        speed: Math.random() * 3 + 4,
        angle: Math.atan2(targetY - startY, targetX - startX),
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
    });
    
    // Schedule next launch
    setTimeout(launchRocketLoop, Math.random() * 1500 + 800);
}

function explodeFirework(x, y, color) {
    const particleCount = Math.floor(Math.random() * 60) + 40;
    for (let i = 0; i < particleCount; i++) {
        const speed = Math.random() * 5 + 2;
        const angle = Math.random() * Math.PI * 2;
        fireworksParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.008,
            gravity: 0.08,
            friction: 0.98
        });
    }
}

function updateFireworks() {
    if (!fireworksActive || !fireworksCtx) return;
    
    // Clear screen with a slight opacity fade to create light trails
    fireworksCtx.globalCompositeOperation = 'destination-out';
    fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    
    // Set composite operation back to draw sparkles on top of dark trails
    fireworksCtx.globalCompositeOperation = 'lighter';
    
    // Update rockets
    fireworkRockets.forEach((r, idx) => {
        const dx = r.targetX - r.x;
        const dy = r.targetY - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10) {
            // Explode rocket!
            explodeFirework(r.x, r.y, r.color);
            fireworkRockets.splice(idx, 1);
        } else {
            // Move rocket
            r.x += Math.cos(r.angle) * r.speed;
            r.y += Math.sin(r.angle) * r.speed;
            
            // Draw rocket particle
            fireworksCtx.beginPath();
            fireworksCtx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            fireworksCtx.fillStyle = r.color;
            fireworksCtx.fill();
        }
    });
    
    // Update particles
    fireworksParticles.forEach((p, idx) => {
        // Move particle
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) {
            fireworksParticles.splice(idx, 1);
        } else {
            // Draw spark
            fireworksCtx.beginPath();
            fireworksCtx.arc(p.x, p.y, Math.random() * 2 + 1, 0, Math.PI * 2);
            fireworksCtx.fillStyle = p.color;
            fireworksCtx.globalAlpha = p.alpha;
            fireworksCtx.fill();
            fireworksCtx.globalAlpha = 1; // reset alpha
        }
    });
    
    requestAnimationFrame(updateFireworks);
}
