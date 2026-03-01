// --- WOBBLE FRIENDS ---
// Step 1: Responsive canvas + tilt input + single bouncing circle

let ball;
let gx = 0; // gravity x
let gy = 0; // gravity y
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
    r: min(width, height) * 0.08, // size scales with screen
  };

  // On mobile, we need to ask permission for DeviceMotion (iOS 13+)
  if (isMobile) {
    // We'll show a tap-to-start overlay, and request permission on tap
    textAlign(CENTER, CENTER);
  }
}

function draw() {
  background(240, 235, 255);

  // --- GRAVITY SOURCE ---
  // On desktop: gravity points toward mouse
  // On mobile: gravity from tilt (set in deviceTilted())
  if (!isMobile) {
    gx = map(mouseX, 0, width, -1, 1);
    gy = map(mouseY, 0, height, -1, 1);
  }

  // --- PHYSICS ---
  let gravity = 0.4;
  let damping = 0.75; // energy lost on bounce
  let friction = 0.99; // air resistance

  ball.vx += gx * gravity;
  ball.vy += gy * gravity;

  ball.vx *= friction;
  ball.vy *= friction;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // --- WALL BOUNCING ---
  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx *= -damping;
  }
  if (ball.x + ball.r > width) {
    ball.x = width - ball.r;
    ball.vx *= -damping;
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy *= -damping;
  }
  if (ball.y + ball.r > height) {
    ball.y = height - ball.r;
    ball.vy *= -damping;
  }

  // --- DRAW BALL ---
  noStroke();
  fill(120, 80, 220);
  circle(ball.x, ball.y, ball.r * 2);

  // little face
  drawFace(ball.x, ball.y, ball.r, ball.vx, ball.vy);

  // --- MOBILE OVERLAY: ask for permission ---
  if (isMobile && !tiltPermissionGranted) {
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);
    fill(255);
    textSize(width * 0.05);
    text("Tap to enable\ntilt controls", width / 2, height / 2);
  }
}

function drawFace(x, y, r, vx, vy) {
  let eyeOffset = r * 0.28;
  let eyeR = r * 0.13;
  let speed = sqrt(vx * vx + vy * vy);

  // eyes shift slightly in direction of movement
  let ex = vx * 0.3;
  let ey = vy * 0.3;

  // whites
  fill(255);
  circle(x - eyeOffset + ex, y - eyeOffset * 0.4 + ey, eyeR * 2);
  circle(x + eyeOffset + ex, y - eyeOffset * 0.4 + ey, eyeR * 2);

  // pupils
  fill(30);
  circle(x - eyeOffset + ex * 1.4, y - eyeOffset * 0.4 + ey * 1.4, eyeR);
  circle(x + eyeOffset + ex * 1.4, y - eyeOffset * 0.4 + ey * 1.4, eyeR);

  // mouth — open wider when moving fast
  let mouthOpen = map(speed, 0, 15, 2, r * 0.4);
  mouthOpen = constrain(mouthOpen, 2, r * 0.4);
  fill(30);
  ellipse(x + ex * 0.5, y + eyeOffset * 0.6 + ey * 0.5, r * 0.3, mouthOpen);
}

// --- TILT INPUT (mobile) ---
function deviceTilted(event) {
  // gamma = left/right tilt (-90 to 90)
  // beta  = front/back tilt (-180 to 180)
  let rawX = event.gamma; // left/right
  let rawY = event.beta;  // front/back

  gx = constrain(rawX / 45, -1, 1);
  gy = constrain((rawY - 45) / 45, -1, 1); // -45 offset: "flat" position = neutral
}

// --- TAP TO REQUEST PERMISSION (iOS 13+) ---
function mousePressed() {
  if (isMobile && !tiltPermissionGranted) {
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
      // Android or older iOS — no permission needed
      tiltPermissionGranted = true;
      window.addEventListener("deviceorientation", deviceTilted);
    }
  }
}

// --- RESPONSIVE RESIZE ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ball.r = min(width, height) * 0.08;
}
