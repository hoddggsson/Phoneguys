// --- WOBBLE FRIENDS ---
// Step 5: Multiple blobs with blob-to-blob collisions

let guys = [];
let NUM_GUYS = 2;
let gx = 0;
let gy = 0;
let tiltPermissionGranted = false;
let isMobile = false;

function makeGuy(x, y, r) {
  return {
    x: x, y: y,
    vx: random(-2, 2), vy: random(-2, 2),
    r: r,
    fx: x, fy: y,
    fvx: 0, fvy: 0,
    col: randomColour(),
    noiseOffset: random(1000),
  };
}

function randomColour() {
  return color(random(360), 70, 65);
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
  // space them out evenly across the screen to start
  for (let i = 0; i < NUM_GUYS; i++) {
    let x = map(i, 0, NUM_GUYS - 1, width * 0.25, width * 0.75);
    let y = height / 2;
    // give each a slightly different size for variety
    let blobR = r * random(0.85, 1.25);
    guys.push(makeGuy(x, y, blobR));
  }
}

function draw() {
  background(220, 20, 96);

  if (!isMobile) {
    gx = map(mouseX, 0, width, -1, 1);
    gy = map(mouseY, 0, height, -1, 1);
  }

  // update all guys
  for (let b of guys) {
    updateGuy(b);
  }

  // blob-to-blob collisions
  for (let i = 0; i < guys.length; i++) {
    for (let j = i + 1; j < guys.length; j++) {
      collidePair(guys[i], guys[j]);
    }
  }

  // draw all guys
  for (let b of guys) {
    drawGuy(b);
  }
}

function collidePair(a, b) {
  let dx   = b.x - a.x;
  let dy   = b.y - a.y;
  let dist = sqrt(dx * dx + dy * dy);
  let minD = a.r + b.r;

  if (dist < minD && dist > 0) {
    // normalised collision axis
    let nx = dx / dist;
    let ny = dy / dist;

    // push them apart so they don't overlap
    let overlap = (minD - dist) / 2;
    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    // relative velocity along collision axis
    let dvx = a.vx - b.vx;
    let dvy = a.vy - b.vy;
    let dot  = dvx * nx + dvy * ny;

    // only resolve if they're actually moving toward each other
    if (dot > 0) {
      let restitution = 0.6; // bounciness of the collision
      // equal mass assumed — simple swap along normal
      a.vx -= dot * nx * restitution;
      a.vy -= dot * ny * restitution;
      b.vx += dot * nx * restitution;
      b.vy += dot * ny * restitution;

      // colour swap on impact — fun!
      a.col = randomColour();
      b.col = randomColour();
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

  // wall bounce
  if (b.x - b.r < 0)      { b.x = b.r;          b.vx *= -damping; b.col = randomColour(); }
  if (b.x + b.r > width)  { b.x = width - b.r;  b.vx *= -damping; b.col = randomColour(); }
  if (b.y - b.r < 0)      { b.y = b.r;           b.vy *= -damping; b.col = randomColour(); }
  if (b.y + b.r > height) { b.y = height - b.r;  b.vy *= -damping; b.col = randomColour(); }

  // face spring
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
    let nx    = cos(angle) * noiseScale + b.noiseOffset;
    let ny    = sin(angle) * noiseScale + b.noiseOffset + 100;
    let bump  = map(noise(nx, ny), 0, 1, -noiseMag, noiseMag);
    let r     = b.r + bump;
    curveVertex(b.x + cos(angle) * r, b.y + sin(angle) * r);
  }
  for (let i = 0; i < 3; i++) {
    let angle = (TWO_PI / numPoints) * i;
    let nx    = cos(angle) * noiseScale + b.noiseOffset;
    let ny    = sin(angle) * noiseScale + b.noiseOffset + 100;
    let bump  = map(noise(nx, ny), 0, 1, -noiseMag, noiseMag);
    let r     = b.r + bump;
    curveVertex(b.x + cos(angle) * r, b.y + sin(angle) * r);
  }
  endShape(CLOSE);

  drawFace(b.fx, b.fy, b.r, b.fvx, b.fvy);
}

function drawFace(x, y, r, vx, vy) {
  let eyeOffset = r * 0.28;
  let eyeR      = r * 0.13;
  let speed     = sqrt(vx * vx + vy * vy);

  let ex = constrain(vx * 0.5, -eyeR, eyeR);
  let ey = constrain(vy * 0.5, -eyeR, eyeR);

  fill(255, 0, 100);
  circle(x - eyeOffset + ex, y - eyeOffset * 0.3 + ey, eyeR * 2);
  circle(x + eyeOffset + ex, y - eyeOffset * 0.3 + ey, eyeR * 2);

  fill(0, 0, 10);
  circle(x - eyeOffset + ex * 1.5, y - eyeOffset * 0.3 + ey * 1.5, eyeR);
  circle(x + eyeOffset + ex * 1.5, y - eyeOffset * 0.3 + ey * 1.5, eyeR);

  let mouthW = r * 0.32;
  let mouthH = map(speed, 0, 10, r * 0.06, r * 0.35);
  mouthH = constrain(mouthH, r * 0.06, r * 0.35);
  fill(0, 0, 10);
  ellipse(x + ex * 0.4, y + eyeOffset * 0.7 + ey * 0.4, mouthW, mouthH);
}

// --- TILT ---
function deviceTilted(event) {
  gx = constrain(event.gamma / 45, -1, 1);
  gy = constrain((event.beta - 45) / 45, -1, 1);
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
  // recalculate minimum radius but don't shrink existing guys below it
  let r = minRadius();
  for (let b of guys) {
    b.r = max(b.r, r * 0.85);
  }
}
