// --- WOBBLE FRIENDS ---
// Step 1: Responsive canvas + tilt input + single bouncing circle

let ball;
let gx = 0;
let gy = 0;
let tiltPermissionGranted = false;
let isMobile = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  ball = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    r: min(width, height) * 0.08,
  };

  if (isMobile) {
    showTiltButton();
  }
}

function draw() {
  background(240, 235, 255);

  if (!isMobile) {
    gx = map(mouseX, 0, width, -1, 1);
    gy = map(mouseY, 0, height, -1, 1);
  }

  let gravity = 0.4;
  let damping = 0.75;
  let friction = 0.99;

  ball.vx += gx * gravity;
  ball.vy += gy * gravity;
  ball.vx *= friction;
  ball.vy *= friction;
  ball.x += ball.vx;
  ball.y += ball.vy;

  // wall bouncing
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -damping; }
  if (ball.x + ball.r > width) { ball.x = width - ball.r; ball.vx *= -damping; }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -damping; }
  if (ball.y + ball.r > height) { ball.y = height - ball.r; ball.vy *= -damping; }

  // draw
  noStroke();
  fill(120, 80, 220);
  circle(ball.x, ball.y, ball.r * 2);
  drawFace(ball.x, ball.y, ball.r, ball.vx, ball.vy);
}

function drawFace(x, y, r, vx, vy) {
  let eyeOffset = r * 0.28;
  let eyeR = r * 0.13;
  let speed = sqrt(vx * vx + vy * vy);
  let ex = vx * 0.3;
  let ey = vy * 0.3;

  fill(255);
  circle(x - eyeOffset + ex, y - eyeOffset * 0.4 + ey, eyeR * 2);
  circle(x + eyeOffset + ex, y - eyeOffset * 0.4 + ey, eyeR * 2);

  fill(30);
  circle(x - eyeOffset + ex * 1.4, y - eyeOffset * 0.4 + ey * 1.4, eyeR);
  circle(x + eyeOffset + ex * 1.4, y - eyeOffset * 0.4 + ey * 1.4, eyeR);

  let mouthOpen = map(speed, 0, 15, 2, r * 0.4);
  mouthOpen = constrain(mouthOpen, 2, r * 0.4);
  fill(30);
  ellipse(x + ex * 0.5, y + eyeOffset * 0.6 + ey * 0.5, r * 0.3, mouthOpen);
}

function deviceTilted(event) {
  let rawX = event.gamma;
  let rawY = event.beta;
  gx = constrain(rawX / 45, -1, 1);
  gy = constrain((rawY - 45) / 45, -1, 1);
}

function showTiltButton() {
  let overlay = document.createElement("div");
  overlay.id = "tilt-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  `;

  let btn = document.createElement("button");
  btn.innerText = "Tap to enable tilt";
  btn.style.cssText = `
    font-size: 1.4rem;
    padding: 20px 40px;
    border-radius: 50px;
    border: none;
    background: white;
    color: #5020aa;
    font-weight: bold;
    cursor: pointer;
  `;

  btn.addEventListener("click", function () {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            tiltPermissionGranted = true;
            window.addEventListener("deviceorientation", deviceTilted);
          }
        })
        .catch(console.error);
    } else {
      tiltPermissionGranted = true;
      window.addEventListener("deviceorientation", deviceTilted);
    }
    document.getElementById("tilt-overlay").remove();
  });

  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ball.r = min(width, height) * 0.08;
}
