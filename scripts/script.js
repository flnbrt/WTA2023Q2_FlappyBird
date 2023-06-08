/*
   inspired by https://codepen.io/ju-az/pen/eYJQwLx/
   licensed under MIT

   sprite sheet taken by https://www.spriters-resource.com/mobile/flappybird/sheet/59894/
   (c) Superjustinbros
*/

// global variables
const gameLoopInterval = 10,
    background = {
        startLeft: 0,
        startTop: 0,
        width: 432,
        height: 768
    },
    bird = {
        startLeft: 438,
        startTop: 778,
        width: 53,
        height: 38
    },
    obstacle = {
        topStartLeft: 168,
        topStartTop: 969,
        topWidth: 78,
        topHeight: 480,
        bottomStartLeft: 252,
        bottomStartTop: 969,
        bottomWidth: 78,
        bottomHeight: 480,
        gap: 270
    },
    flappyBird = {
        startLeft: 1053,
        startTop: 273,
        width: 267,
        height: 72
    },
    playButton = {
        startLeft: 1062,
        startTop: 354,
        width: 156,
        height: 87
    },
    settingsButton = {
    startLeft: 1062,
    startTop: 461,
    width: 156,
    height: 87
    },
    pipeLocation = () => (Math.random() * ((canvas.height - (obstacle.gap + obstacle.topWidth)) - obstacle.topWidth)) + obstacle.topWidth;

var preloaded = false,
    canvas,
    sCanvas,
    ctx,
    sCtx,
    img,
    birdVersion = 0,
    pipeObstacles;

// general game settings
let currentScore,
    highScore = 0,
    gameReady = false,
    gamePlaying = false,
    settingsOpened = false,
    playMusic = false,
    playSound = true,
    speed = 6.0 * (gameLoopInterval / 40),
    animation = 0,
    birdAnimation = 0,
    birdFlyHeight = 0,
    birdJumpHeight = 7,
    birdFlyHeightAdjustment = 0,
    gravity = 0.1,
    settingsPress = 0;


// initialize
function init() {
    console.log("init() called!");

    // reset score
    currentScore = 0;

    // gameCanvas
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // scoreCanvas
    sCanvas = document.getElementById("scoreCanvas");
    sCtx = sCanvas.getContext("2d");

    // set initial bird fly height
    birdFlyHeight = (canvas.height / 2 - (bird.height / 2));

    // preload all assets
    preloadAssets();

    // generate first three obstacles
    pipeObstacles = Array(3).fill().map((i, j) => [canvas.width + (i * (obstacle.gap + obstacle.topWidth)), pipeLocation()]);
}

// game loop
function gameLoop() {

    // increase animation index to display the animations
    animation++;

    // control sounds
    audioplayer("music");

    // draw assets
    drawAssets();

    // game functions
    if (gamePlaying) {
        birdFly();
    }
    borderCollisionDetection();

}

/*
   preload assets
   (c) Prof. Dr. Brändle
*/
function preloadAssets() {

    console.log("preloadAssets() called!");

    var preloadCount = 0;

    var addImage = function (src) {

        console.log("addImage() with source '" + src + "' called!");

        var img = new Image();
        img.src = src;
        preloadCount++;

        img.addEventListener("load", function () { preloadCount-- });

        return img;
    }

    // add spritesheet
    img = addImage("assets/FlappyBird_SpriteSheet_3x.png");

    // call gameLoop if every asset is loaded
    var checkResources = function () {

        if (preloadCount === 0) {
            console.log("gameLoop() called!")
            preloaded = true;
            setInterval(gameLoop, gameLoopInterval);
        } else {
            // 200ms timeout
            console.log("waiting for " + preloadCount + " asset(s) to load!")
            setTimeout(checkResources, 200);
        }
    }
    checkResources();
}

// draw assets
function drawAssets() {

    drawBackground();

    drawBird();

    if (!gamePlaying) {
        drawMainScreen();
    } else {
        drawObstacles()
    }

    if (gameReady || settingsOpened) {
        document.getElementById("playButton").style.visibility = "hidden";
        document.getElementById("settingsButton").style.visibility = "hidden";
    }

    if (!gameReady && !settingsOpened) {
        document.getElementById("playButton").style.visibility = "visible";
        document.getElementById("settingsButton").style.visibility = "visible";
    }

    if (settingsOpened) {
        document.getElementById("settingsButtonBird").style.visibility = "visible";
        document.getElementById("settingsButtonMusic").style.visibility = "visible";
        document.getElementById("settingsButtonSound").style.visibility = "visible";
        document.getElementById("settingsButtonBack").style.visibility = "visible";
    } else {
        document.getElementById("settingsButtonBird").style.visibility = "hidden";
        document.getElementById("settingsButtonMusic").style.visibility = "hidden";
        document.getElementById("settingsButtonSound").style.visibility = "hidden";
        document.getElementById("settingsButtonBack").style.visibility = "hidden";
    }

}

// draw background
function drawBackground() {

    // draw world background (left part)
    ctx.drawImage(img, background.startLeft, background.startTop, background.width, background.height,
        -((animation * speed) % background.width), 0, background.width, background.height);

    // draw world background (right part)
    ctx.drawImage(img, background.startLeft, background.startTop, background.width, background.height,
        -((animation * speed) % background.width) + background.width, 0, background.width, background.height);

    // score
    sCtx.font = "30px Arial";
    sCtx.drawImage(
        // image
        img,
        // start pos x, start pos y
        background.startLeft, background.startTop + (background.height - sCanvas.height - 50),
        // width, height
        sCanvas.width, sCanvas.height,
        // canvas pos x, canvas pos y
        0, 0,
        // width on canvas, height on canvas
        sCanvas.width, sCanvas.height);
    sCtx.fillText(`Current Score: ${currentScore}`, 0, 0);

}

function drawObstacles() {

    pipeObstacles.map(pipe => {

        // draw obstacle (top)
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            obstacle.topStartLeft, obstacle.topStartTop - pipe[1],
            // width, height
            obstacle.topWidth, pipe[1],
            // canvas pos x, canvas pos y
            pipe[0], 0,
            // width on canvas, height on canvas
            obstacle.topWidth, pipe[1]);

        // draw obstacle (bottom)
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            obstacle.bottomStartLeft + obstacle.topWidth, obstacle.bottomStartTop,
            // width, height
            obstacle.bottomWidth, canvas.height - pipe[1] + obstacle.gap,
            // canvas pos x, canvas pos y
            pipe[0], pipe[1] + obstacle.gap,
            // width on canvas, height on canvas
            obstacle.bottomWidth ,canvas.height - pipe[1] + obstacle.gap);

        // count score and update pipes
        if (pipe[0] === (canvas.width / 2 - (obstacle.topWidth / 2))) {
            // increase current score
            currentScore++;
            // update highscore (if necessary)
            highScore = Math.max(currentScore, highScore);

            // remove old pipe and add new one
            pipeObstacles = [...pipeObstacles.slice(1, [pipeObstacles[pipeObstacles.length - 1][0] + obstacle.gap + obstacle.topWidth, pipeLocation()])];
            console.log(pipeObstacles);

            // play audio
            audioplayer("point");
        }

        // collision detection
        if ([
            pipe[0] <= (canvas.width / 10) + bird.width,
            pipe[0] + obstacle.topWidth >= (canvas.width / 10),
            pipe[1] > birdFlyHeight || pipe[1] + obstacle.gap < birdFlyHeight + bird.height,
        ].every(element => element)) {
            gameReady = false
            gamePlaying = false;
            audioplayer("hit")
        }
    });

}

function drawBird() {

    if (!settingsOpened) {
        // draw bird
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            (bird.startLeft + (bird.width * birdAnimation)), bird.startTop + (bird.height * birdVersion),
            // width, height
            bird.width, bird.height,
            // canvas pos x, canvas pos y
            (canvas.width / 2 - (bird.width / 2)), birdFlyHeight,
            // width on canvas, height on canvas
            bird.width, bird.height);
    } else {
        // draw bird
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            (bird.startLeft + (bird.width * birdAnimation)), bird.startTop + (bird.height * birdVersion),
            // width, height
            bird.width, bird.height,
            // canvas pos x, canvas pos y
            (canvas.width / 2 - (bird.width / 2)), birdFlyHeight - 100,
            // width on canvas, height on canvas
            bird.width, bird.height);
    }

    // bird wings animation
    if (animation % gameLoopInterval === 0) {
        birdAnimation++;
        if (birdAnimation > 2) {
            birdAnimation = 0;
        }
    }

}

function drawMainScreen() {

    // draw flappy bird logo
    ctx.drawImage(
        // image
        img,

        // start pos x, start pos y
        flappyBird.startLeft, flappyBird.startTop,
        // width, height
        flappyBird.width, flappyBird.height,

        // canvas pos x, canvas pos y
        ((canvas.width / 2) - (flappyBird.width / 2)), ((canvas.height / 2) - (flappyBird.height / 2) - 275),
        // width on canvas, height on canvas
        flappyBird.width, flappyBird.height);

    // give instructions to start the game
    if (gameReady && !settingsOpened) {
        ctx.fillText('Press "Space" or', 75, 550);
        ctx.fillText('tap the screen to start!', 0, 580);
    }

    // draw current highscore
    if (!settingsOpened) {
        ctx.font = "bold 30px courier";
        ctx.fillText(`Highscore: ${highScore}`, 110, 240);
    }

}

function birdFly() {

    // bird flight height adjustment
    if (birdFlyHeight !== (canvas.height - bird.height)) {
        birdFlyHeightAdjustment += gravity;
    }
    birdFlyHeight = Math.min(birdFlyHeight + birdFlyHeightAdjustment, canvas.height - bird.height);

}

function borderCollisionDetection() {

    // upper canvas border
    if (birdFlyHeight <= 0) {
        gameReady = false;
        gamePlaying = false;
        birdFlyHeightAdjustment = 0;
    }

    // bottom canvas border
    if (birdFlyHeight >= (canvas.height - bird.height)) {
        gameReady = false;
        gamePlaying = false;
        birdFlyHeightAdjustment = 0;
    }

    // reset flight height
    if (!gamePlaying) {
        birdFlyHeight = (canvas.height / 2) - (bird.height / 2);
    }
}

function audioplayer(type) {
    // music
    if (type === "music") {
        if (playMusic) {
            document.getElementById("music").volume = 0.1;
            document.getElementById("music").play();
        } else {
            document.getElementById("music").pause();
            document.getElementById("music").currentTime = 0;
        }
    }

    if (playSound) {
        // flap
        switch (type) {
            case "flap":
                document.getElementById("flap").volume = 0.1;
                document.getElementById("flap").play();
                break;
            case "point":
                document.getElementById("point").volume = 0.1;
                document.getElementById("point").play();
                break;
            case "hit":
                document.getElementById("hit").volume = 0.1;
                document.getElementById("hit").play();
                break;
        }
    }
}

// play button
document.getElementById("playButton").addEventListener('click', () => gameReady = true);

// settings button
document.getElementById("settingsButton").addEventListener('click', () => settingsOpened = true);

// settings button change bird color
document.getElementById("settingsButtonBird").addEventListener('click', () => {
    birdVersion++;
    if (birdVersion > 2) {
        birdVersion = 0;
    }
});

// click actions
document.addEventListener('click', () => {

    if (gameReady) {
        gamePlaying = true
        audioplayer("flap");
    }

});

window.onclick = () => {

    if (gamePlaying) {
        birdFlyHeightAdjustment -= birdJumpHeight
        audioplayer("flap");
    }

};

document.getElementById("settingsButtonMusic").addEventListener('click', () => playMusic = !playMusic);
document.getElementById("settingsButtonSound").addEventListener('click', () => playSound = !playSound);
document.getElementById("settingsButtonBack").addEventListener('click', () => settingsOpened = false);

// keyboard actions
document.querySelector("html").onkeydown = function (e) {

    if (gameReady) {
        if (e.key === " ") {
            if (gamePlaying) {
                birdFlyHeightAdjustment -= birdJumpHeight;
            } else {
                gamePlaying = true;
                birdFlyHeightAdjustment -= birdJumpHeight;
            }
        }
        audioplayer("flap");
    }
}

// wait until everything is loaded
document.addEventListener("DOMContentLoaded", init);