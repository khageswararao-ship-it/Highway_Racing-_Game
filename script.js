/*=========================================
    HIGHWAY RACING V4.0
=========================================*/

// Canvas
const canvas = document.getElementById("roadCanvas");
const ctx = canvas.getContext("2d");

// Player
const playerCar = document.getElementById("playerCar");

// HUD
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const speedElement = document.getElementById("speedValue");
const rpmFill = document.getElementById("rpmFill");

// Buttons
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// Screens
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

// =========================================
// GAME VARIABLES
// =========================================

let gameRunning = false;
let animationId = null;

// Road
const laneCount = 7;
let laneWidth = 0;
let roadWidth = 0;
let roadLeft = 0;
let roadRight = 0;
let laneCenters = [];

let roadOffset = 0;

// Speed
let speed = 0;
let maxSpeed = 220;
let acceleration = 0.15;
let braking = 0.25;

// Score
let score = 0;
let bestScore = 0;

// =========================================
// PLAYER
// =========================================

const player = {

    lane: 3,

    x: 0,

    y: 0,

    width: 72,

    height: 130

};

// =========================================
// TRAFFIC
// =========================================

const traffic = [];

// =========================================
// KEYBOARD
// =========================================

const keys = {

    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false

};

// =========================================
// RESIZE CANVAS
// =========================================

function resizeCanvas(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

/*=========================================
    ROAD CALCULATION
=========================================*/

function calculateRoad() {

    // Road occupies 70% of the screen
    roadWidth = canvas.width * 0.70;

    roadLeft = (canvas.width - roadWidth) / 2;
    roadRight = roadLeft + roadWidth;

    laneWidth = roadWidth / laneCount;

    laneCenters = [];

    for (let i = 0; i < laneCount; i++) {

        laneCenters.push(
            roadLeft + (i * laneWidth) + laneWidth / 2
        );

    }

    player.x = laneCenters[player.lane];
    player.y = canvas.height - 280;

playerCar.style.position = "absolute";
playerCar.style.left = player.x + "px";
playerCar.style.top = player.y + "px";
playerCar.style.transform = "translate(-50%, -50%)";

}

calculateRoad();

/*=========================================
    START GAME
=========================================*/

function startGame() {

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    gameRunning = true;

    speed = 0;
    score = 0;
    roadOffset = 0;

    updateHUD();

    startCountdown();

}

/*=========================================
    RESET GAME
=========================================*/

function resetGame() {

    traffic.length = 0;

    player.lane = 3;

    calculateRoad();

    startGame();

}

/*=========================================
    HUD
=========================================*/

function updateHUD(){

    scoreElement.textContent=Math.floor(score);

    bestScoreElement.textContent=Math.floor(bestScore);

    speedElement.textContent=Math.floor(speed);

    rpmFill.style.width=((speed/maxSpeed)*100)+"%";

}

/*=========================================
    EVENTS
=========================================*/

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", resetGame);

window.addEventListener("keydown", (e) => {

    if (keys.hasOwnProperty(e.key)) {

        keys[e.key] = true;

        e.preventDefault();

    }

});

window.addEventListener("keyup", (e) => {

    if (keys.hasOwnProperty(e.key)) {

        keys[e.key] = false;

        e.preventDefault();

    }

});

window.addEventListener("resize", () => {

    resizeCanvas();

    calculateRoad();

});



/*=========================================
    UPDATE ROAD
=========================================*/

function updateRoad() {

    roadOffset += speed * 0.4;

    if (roadOffset > 70) {

        roadOffset = 0;


    }

}

/*=========================================
    UPDATE GAME
=========================================*/

function updateGame() {

    if (!gameRunning) return;

    // Acceleration
    if (keys.ArrowUp)
        speed += acceleration;

    // Braking
    if (keys.ArrowDown)
        speed -= braking;

    // Engine drag
    if (!keys.ArrowUp && !keys.ArrowDown)
        speed -= 0.05;

    speed = Math.max(0, Math.min(speed, maxSpeed));

    score += speed * 0.02;

    if (score > bestScore)
        bestScore = score;

    updateRoad();

    handleInput();

    updatePlayer();

    updateTraffic();

    checkCollision();

    updateHUD();

    updateDashboard();

}

/*=========================================
    RENDER
=========================================*/

function renderGame() {

    drawRoad();

}
/*=========================================
    COLLISION DETECTION
=========================================*/

function checkCollision() {

    const playerRect = {
        left: player.x - player.width / 2,
        right: player.x + player.width / 2,
        top: player.y - player.height / 2,
        bottom: player.y + player.height / 2
    };

    for (const car of traffic) {

        const trafficRect = {
            left: car.x - car.width / 2,
            right: car.x + car.width / 2,
            top: car.y - car.height / 2,
            bottom: car.y + car.height / 2
        };

        if (
            playerRect.left < trafficRect.right &&
            playerRect.right > trafficRect.left &&
            playerRect.top < trafficRect.bottom &&
            playerRect.bottom > trafficRect.top
        ) {

            gameOver();
            return;

        }

    }

}




/*=========================================
    CLEAR TRAFFIC
=========================================*/

function clearTraffic() {

    traffic.forEach(car => car.element.remove());

    traffic.length = 0;

}



/*=========================================
    DASHBOARD SYSTEM
=========================================*/

// Dashboard Elements
const gearDisplay = document.querySelector(".activeGear");
const distanceDisplay = document.createElement("span");

// Create Distance Display
distanceDisplay.id = "distance";
distanceDisplay.textContent = "0 m";
document.getElementById("topHUD").appendChild(distanceDisplay);

// Speedometer Canvas
const speedCanvas = document.getElementById("speedometer");
const speedCtx = speedCanvas.getContext("2d");

speedCanvas.width = 180;
speedCanvas.height = 180;

// Dashboard Variables
let distance = 0;
let gear = "P";
let paused = false;

/*=========================================
    UPDATE DASHBOARD
=========================================*/

function updateDashboard() {

    // Distance
    distance += speed * 0.03;

    if (distance < 1000) {

        distanceDisplay.textContent =
            `${Math.floor(distance)} m`;

    } else {

        distanceDisplay.textContent =
            `${(distance / 1000).toFixed(2)} km`;

    }

    // Automatic Gear
    if (speed === 0)
        gear = "P";
    else if (speed < 20)
        gear = "D1";
    else if (speed < 50)
        gear = "D2";
    else if (speed < 90)
        gear = "D3";
    else if (speed < 140)
        gear = "D4";
    else
        gear = "D5";

    gearDisplay.textContent = gear;

    // RPM
    const rpm = Math.min(speed / maxSpeed, 1);

    rpmFill.style.width = `${rpm * 100}%`;

    drawSpeedometer();
}




/*=========================================
    PAUSE
=========================================*/

window.addEventListener("keydown", (e) => {

    if (e.code === "Space") {

        paused = !paused;

        if (paused) {

            cancelAnimationFrame(animationId);

        } else {

            gameLoop();

        }

    }

});

const vehicleTypes = [

{
name:"sedan",
image:"assets/cars/sedan.png",
speed:8
},

{
name:"suv",
image:"assets/cars/suv.png",
speed:7
},

{
name:"van",
image:"assets/cars/van.png",
speed:6
},

{
name:"truck",
image:"assets/cars/truck.png",
speed:5
},

{
name:"bus",
image:"assets/cars/bus.png",
speed:4
}

];

/*=========================================
    PLAYER MOVEMENT
=========================================*/

player.targetLane = player.lane;
player.targetX = laneCenters[player.lane];

player.x = laneCenters[player.lane];
player.targetX = player.x;

const laneChangeSpeed = 0.18;

let leftPressed = false;
let rightPressed = false;

function handleInput() {

    if (keys.ArrowLeft && !leftPressed) {

        if (player.targetLane > 0) {

            player.targetLane--;
            player.targetX = laneCenters[player.targetLane];

        }

        leftPressed = true;

    }

    if (!keys.ArrowLeft) leftPressed = false;

    if (keys.ArrowRight && !rightPressed) {

        if (player.targetLane < laneCount - 1) {

            player.targetLane++;
            player.targetX = laneCenters[player.targetLane];

        }

        rightPressed = true;

    }

    if (!keys.ArrowRight) rightPressed = false;

}

function updatePlayer() {

    player.x += (player.targetX - player.x) * laneChangeSpeed;

    if (Math.abs(player.x - player.targetX) < 1) {

        player.x = player.targetX;
        player.lane = player.targetLane;

    }

    playerCar.style.left = player.x + "px";
    playerCar.style.top = player.y + "px";
    playerCar.style.transform = "translate(-50%,-50%)";

}

/*=========================================
    TRAFFIC SYSTEM
=========================================*/

const trafficLayer = document.getElementById("trafficLayer");

let spawnTimer = 0;
let spawnDelay = 70;

const vehicleSizes = {

    sedan:{w:70,h:125},
    suv:{w:74,h:132},
    van:{w:76,h:140},
    truck:{w:82,h:165},
    bus:{w:86,h:180}

};

function laneOccupied(lane){

    for(const car of traffic){

        if(car.lane===lane && car.y<250){

            return true;

        }

    }

    return false;

}

function spawnTraffic(){

    const free=[];

    for(let i=0;i<laneCount;i++){

        if(!laneOccupied(i)){

            free.push(i);

        }

    }

    if(free.length===0) return;

    const lane=free[Math.floor(Math.random()*free.length)];

    const type=vehicleTypes[
        Math.floor(Math.random()*vehicleTypes.length)
    ];

    const size=vehicleSizes[type.name];

    const img=document.createElement("img");

    img.src=type.image;
    
    img.onload = function() {
    console.log(type.image + " loaded");
};

img.onerror = function() {
    console.log(type.image + " NOT FOUND");
};

    img.className="trafficCar";

    img.style.position="absolute";
    img.style.pointerEvents="none";
    img.style.width=size.w+"px";

    trafficLayer.appendChild(img);

    traffic.push({

        lane:lane,

        x:laneCenters[lane],

        y:-size.h,

        width:size.w,

        height:size.h,

        speed:type.speed,

        element:img

    });

}

function updateTraffic(){

    spawnTimer++;

    if(spawnTimer>=spawnDelay){

        spawnTraffic();

        spawnTimer=0;

    }

    for(let i=traffic.length-1;i>=0;i--){

        const car=traffic[i];

        car.y+=car.speed+(speed*0.15);

        car.element.style.left=car.x+"px";
        car.element.style.top=car.y+"px";
        car.element.style.transform="translate(-50%,-50%)";

        if(car.y>canvas.height+250){

            car.element.remove();

            traffic.splice(i,1);

        }

    }

}

/*=========================================
    GAME PHYSICS
=========================================*/

const physics = {

    drag:0.03,

    brakePower:0.35,

    accelPower:0.18,

    steeringPenalty:0.015

};

function updatePhysics(){

    if(keys.ArrowUp){

        speed += physics.accelPower;

    }

    if(keys.ArrowDown){

        speed -= physics.brakePower;

    }

    if(!keys.ArrowUp && !keys.ArrowDown){

        speed -= physics.drag;

    }

    if(keys.ArrowLeft || keys.ArrowRight){

        speed -= physics.steeringPenalty;

    }

    speed=Math.max(0,Math.min(speed,maxSpeed));

}

/*=========================================
    AUTOMATIC GEARBOX
=========================================*/

function updateGearbox(){

    if(speed===0){

        gear="P";

    }else if(speed<20){

        gear="D1";

    }else if(speed<50){

        gear="D2";

    }else if(speed<90){

        gear="D3";

    }else if(speed<140){

        gear="D4";

    }else{

        gear="D5";

    }

    gearDisplay.textContent=gear;

}

/*=========================================
    DIFFICULTY SYSTEM
=========================================*/

function updateDifficulty(){

    if(score<500){

        spawnDelay=70;

    }else if(score<1500){

        spawnDelay=60;

    }else if(score<3000){

        spawnDelay=50;

    }else{

        spawnDelay=40;

    }

}

/*=========================================
    LOCAL HIGH SCORE
=========================================*/

function loadHighScore(){

    const saved=localStorage.getItem("highway_best");

    if(saved){

        bestScore=parseInt(saved);

    }

}

function saveHighScore(){

    if(score>bestScore){

        bestScore=Math.floor(score);

        localStorage.setItem("highway_best",bestScore);

    }

}

loadHighScore();

/*=========================================
    RESTART
=========================================*/

function restartGame(){

    clearTraffic();

    speed=0;

    score=0;

    distance=0;

    roadOffset=0;

    spawnTimer=0;

    player.lane=3;

    player.targetLane=3;

    player.targetX=laneCenters[3];

    calculateRoad();

    gameOverScreen.style.display="none";

    gameRunning=true;

    gameLoop();

}

restartBtn.removeEventListener("click",resetGame);

restartBtn.addEventListener("click",restartGame);

/*=========================================
    IMPROVED GAME OVER
=========================================*/

function gameOver(){

    if(!gameRunning) return;

    gameRunning=false;

    cancelAnimationFrame(animationId);

    saveHighScore();

    document.getElementById("finalScore").textContent=Math.floor(score);

    gameOverScreen.style.display="flex";

}



/*=========================================
    RENDER
=========================================*/

function renderGame(){

    drawRoad();

}

/*=========================================
    MAIN LOOP
=========================================*/

function gameLoop(){

    if(!gameRunning) return;

    updateGame();

    renderGame();

    animationId=requestAnimationFrame(gameLoop);

}

/*=========================================
    VISUAL EFFECTS & POLISH
=========================================*/

let roadGlow = 0;
let roadGlowDirection = 1;

function updateEffects(){



    // Road glow animation
    roadGlow += roadGlowDirection * 0.4;

    if(roadGlow > 20 || roadGlow < 0)
        roadGlowDirection *= -1;

    // Slight car lean while changing lanes
    let rotation = 0;

    if(player.x < player.targetX)
        rotation = 8;

    if(player.x > player.targetX)
        rotation = -8;

    playerCar.style.transform =
        `translate(-50%,-50%) rotate(${rotation}deg)`;

}

/*=========================================
    IMPROVED ROAD DRAWING
=========================================*/

function drawRoad(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Background
    ctx.fillStyle="#181818";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Road
    ctx.fillStyle="#303030";
    ctx.fillRect(roadLeft,0,roadWidth,canvas.height);

    // Edge strips
    ctx.fillStyle="#FFD400";

    ctx.fillRect(roadLeft-6,0,6,canvas.height);
    ctx.fillRect(roadRight,0,6,canvas.height);

    // Lane lines
    ctx.lineWidth=4;
    ctx.strokeStyle="#FFFFFF";
    ctx.setLineDash([35,25]);
    ctx.lineDashOffset=-roadOffset;

    for(let i=1;i<laneCount;i++){

        const x=roadLeft+i*laneWidth;

        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,canvas.height);
        ctx.stroke();

    }

    ctx.setLineDash([]);

    // Road border glow
    ctx.strokeStyle=`rgba(0,170,255,${0.15+roadGlow/100})`;
    ctx.lineWidth=8;

    ctx.strokeRect(
        roadLeft,
        0,
        roadWidth,
        canvas.height
    );

}

/*=========================================
    SPEEDOMETER IMPROVEMENT
=========================================*/

function drawSpeedometer(){

    speedCtx.clearRect(0,0,180,180);

    const cx=90;
    const cy=90;
    const r=72;

    // Outer Ring
    speedCtx.beginPath();
    speedCtx.arc(cx,cy,r,0,Math.PI*2);
    speedCtx.lineWidth=10;
    speedCtx.strokeStyle="#555";
    speedCtx.stroke();

    // Tick Marks
    for(let i=0;i<=11;i++){

        const angle=(-130+i*26)*Math.PI/180;

        const x1=cx+Math.cos(angle)*58;
        const y1=cy+Math.sin(angle)*58;

        const x2=cx+Math.cos(angle)*70;
        const y2=cy+Math.sin(angle)*70;

        speedCtx.beginPath();
        speedCtx.moveTo(x1,y1);
        speedCtx.lineTo(x2,y2);
        speedCtx.lineWidth=2;
        speedCtx.strokeStyle="#DDD";
        speedCtx.stroke();

    }

    // Needle
    const angle=(-130+(speed/maxSpeed)*260)*Math.PI/180;

    speedCtx.beginPath();
    speedCtx.moveTo(cx,cy);

    speedCtx.lineTo(
        cx+Math.cos(angle)*54,
        cy+Math.sin(angle)*54
    );

    speedCtx.lineWidth=4;
    speedCtx.strokeStyle="#00A8FF";
    speedCtx.stroke();

    // Center
    speedCtx.beginPath();
    speedCtx.arc(cx,cy,6,0,Math.PI*2);
    speedCtx.fillStyle="#FFF";
    speedCtx.fill();

}

/*=========================================
    START COUNTDOWN
=========================================*/

let countdown = 3;
let countdownRunning = false;

function startCountdown(){

    if(countdownRunning) return;

    countdownRunning = true;

    const overlay = document.getElementById("countdown");

    overlay.style.display="flex";

    overlay.innerText="3";

    const timer=setInterval(()=>{

        countdown--;

        if(countdown>0){

            overlay.innerText=countdown;

        }else{

            overlay.innerText="GO!";

setTimeout(()=>{

    overlay.style.display = "none";

    gameLoop();   // Start the game after "GO!"

},600);

clearInterval(timer);

countdown = 3;

countdownRunning = false;

        }

    },1000);

}

/*=========================================
    FINAL UPDATE
=========================================*/

const oldUpdateGame = updateGame;

updateGame = function(){

    oldUpdateGame();

    updateEffects();

};