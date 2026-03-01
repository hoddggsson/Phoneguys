// --- WOBBLE FRIENDS ---
// Step 7: Individual face personalities

let guys = [];
let NUM_GUYS = 3;
let gx = 0;
let gy = 0;
let tiltPermissionGranted = false;
let isMobile = false;

let PALETTE = [15, 35, 55, 90, 160, 195, 225, 270, 310, 345];

function makeGuy(x, y, r) {
  let c = randomColour();
  return {
    x: x, y: y,
    vx: random(-2, 2), vy: random(-2, 2),
    r: r,
    fx: x, fy: y,
    fvx: 0, fvy: 0,
    col: c,
    targetCol: c,
    noiseOffset: random(1000),
    noiseSpeed: random(0.004, 0.009),

    // face personality — unique per guy
    eyeSize:   random(0.8, 1.4),   // scale factor on eye radius
    eyeSpread: random(0.22, 0.36), // horizontal distance from centre
    eyeHeight: random(-0.1, 0.1),  // vertical offset (negative = higher up)
  };
}

function randomColour() {
  let h = PALETTE[floor(random(PALETTE.length))];
  h += random(-8, 8);
  return color(h, 85, 95);
}

function minRadius() {
  return min(width, height) * 0.12;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  spawnGuys();
  if (isMobile) showTiltButton();
}

function spawnGuys() {
  guys = [];
  let r = minRadius();
  for (let i = 0; i < NUM_GUYS; i++) {
    let x = map(i, 0, NUM_GUYS - 1, width * 0.25, width * 0.75);
    let y = height / 2;
    let blobR = r * random(0.85, 1.25);
    guys.push(makeGuy(x, y, blobR));
  }
}

function draw() {
  background(0);

  if (!isMobile) {
    gx = map(mouseX, 0, width, -1, 1);
    gy = map(mouseY, 0, height, -1, 1);
  }

  for (let b of guys) updateGuy(b);

  for (let i = 0; i < guys.length; i++) {
    for (let j = i + 1; j < guys.length; j++) {
      collidePair(guys[i], guys[j]);
    }
  }

  for (let b of guys) drawGuy(b);
}

function collidePair(a, b) {
  let dx   = b.x - a.x;
  let dy   = b.y - a.y;
  let dist = sqrt(dx * dx + dy * dy);
  let minD = a.r + b.r;

  if (dist < minD && dist > 0) {
    let nx = dx / dist;
    let ny = dy / dist;

    let overlap = (minD - dist) / 2;
    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    let dvx = a.vx - b.vx;
    let dvy = a.vy - b.vy;
    let dot = dvx * nx + dvy * ny;

    if (dot > 0) {
      let restitution = 1.8;
      a.vx -= dot * nx * restitution;
      a.vy -= dot * ny * restitution;
      b.vx += dot * nx * restitution;
      b.vy += dot * ny * restitution;

      a.targetCol = randomColour();
      b.targetCol = randomColour();
    }
  }
}

function updateGuy(b) {
  let gravity  = 0.45;
  let damping  = 0.55;
  let friction = 0.98;

  b.vx += gx * gravity;
  b.vy += gy * gravity;
  b.vx *= friction;
  b.vy *= friction;
  b.x += b.vx;
  b.y += b.vy;

  if (b.x - b.r < 0)      { b.x = b.r;         b.vx *= -damping; b.targetCol = randomColour(); }
  if (b.x + b.r > width)  { b.x = width - b.r; b.vx *= -damping; b.targetCol = randomColour(); }
  if (b.y - b.r < 0)      { b.y = b.r;          b.vy *= -damping; b.targetCol = randomColour(); }
  if (b.y + b.r > height) { b.y = height - b.r; b.vy *= -damping; b.targetCol = randomColour(); }

  b.col = lerpColor(b.col, b.targetCol, 0.1);
  b.noiseOffset += b.noiseSpeed;

  let springK    = 0.4;
  let springDamp = 0.7;
  let faceBounce = 0.4;

  b.fvx += (b.x - b.fx) * springK;
  b.fvy += (b.y - b.fy) * springK;
  b.fvx *= springDamp;
  b.fvy *= springDamp;
  b.fx += b.fvx;
  b.fy += b.fvy;

  let limit = b.r * 0.55;
  let dx = b.fx - b.x;
  let dy = b.fy - b.y;
  let dist = sqrt(dx * dx + dy * dy);
  if (dist > limit) {
    let nx = dx / dist;
    let ny = dy / dist;
    b.fx = b.x + nx * limit;
    b.fy = b.y + ny * limit;
    let dot = b.fvx * nx + b.fvy * ny;
    b.fvx = (b.fvx - 2 * dot * nx) * faceBounce;
    b.fvy = (b.fvy - 2 * dot * ny) * faceBounce;
  }
}

function drawGuy(b) {
  noStroke();
  fill(b.col);

  let numPoints  = 36;
  let noiseScale = 0.2;
  let noiseMag   = b.r * 0.4;

  beginShape();
  for (let i = 0; i < numPoints; i++) {
    let angle = (TWO_PI / numPoints) * i;
    let nx   = cos(angle) * noiseScale + b.noiseOffset;
    let ny   = sin(angle) * noiseScale + b.noiseOffset + 100;
    let bump = map(noise(nx, ny), 0, 1, -noiseMag, noiseMag);
    let r    = b.r + bump;
    curveVertex(b.x + cos(angle) * r, b.y + sin(angle) * r);
  }
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / numPoints) * i;
    let nx   = cos(angle) * noiseScale + b.noiseOffset;
    let ny   = sin(angle) * noiseScale + b.noiseOffset + 100;
    let bump = map(noise(nx, ny), 0, 1, -noiseMag, noiseMag);
    let r    = b.r + bump;
    curveVertex(b.x + cos(angle) * r, b.y + sin(angle) * r);
  }
  endShape(CLOSE);

  drawFace(b);
}

function drawFace(b) {
  let x  = b.fx;
  let y  = b.fy;
  let r  = b.r;
  let vx = b.fvx;
  let vy = b.fvy;

  let eyeOffset = r * b.eyeSpread;
  let eyeR      = r * 0.13 * b.eyeSize;
  let eyeY      = y + r * b.eyeHeight; // vertical position tweak per guy
  let speed     = sqrt(vx * vx + vy * vy);

  // eyes drift in direction of travel, clamped to eye radius
  let ex = constrain(vx * 0.5, -eyeR, eyeR);
  let ey = constrain(vy * 0.5, -eyeR, eyeR);

  // whites
  fill(255, 0, 100);
  circle(x - eyeOffset + ex, eyeY + ey, eyeR * 2);
  circle(x + eyeOffset + ex, eyeY + ey, eyeR * 2);

  // pupils
  fill(0, 0, 10);
  circle(x - eyeOffset + ex * 1.5, eyeY + ey * 1.5, eyeR);
  circle(x + eyeOffset + ex * 1.5, eyeY + ey * 1.5, eyeR);

  // mouth sits below eyes, also shifts slightly with movement
  let mouthW = r * 0.32;
  let mouthH = map(speed, 0, 10, r * 0.06, r * 0.35);
  mouthH = constrain(mouthH, r * 0.06, r * 0.35);
  fill(0, 0, 10);
  ellipse(x + ex * 0.4, eyeY + eyeR * 2.2 + ey * 0.4, mouthW, mouthH);
}

// --- TILT ---
function deviceTilted(event) {
  gx = constrain(event.gamma / 90, -1, 1);
  gy = constrain(event.beta / 90, -1, 1);
}

// --- PERMISSION BUTTON ---
function showTiltButton() {
  let overlay = document.createElement("div");
  overlay.id = "tilt-overlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
  `;
  let btn = document.createElement("button");
  btn.innerText = "Tap to enable tilt";
  btn.style.cssText = `
    font-size: 1.4rem; padding: 20px 40px;
    border-radius: 50px; border: none;
    background: white; color: #5020aa;
    font-weight: bold; cursor: pointer;
  `;
  btn.addEventListener("click", function () {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((r) => {
          if (r === "granted") {
            tiltPermissionGranted = true;
            window.addEventListener("deviceorientation", deviceTilted);
          }
        }).catch(console.error);
    } else {
      tiltPermissionGranted = true;
      window.addEventListener("deviceorientation", deviceTilted);
    }
    document.getElementById("tilt-overlay").remove();
  });
  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}

// --- RESIZE ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let r = minRadius();
  for (let b of guys) {
    b.r = max(b.r, r * 0.85);
  }
}
