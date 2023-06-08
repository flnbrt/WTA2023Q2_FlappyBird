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
        width: 78,
        height: 480,
        topStartLeft: 168,
        topStartTop: 969,
        topEndTop: 1449,
        bottomStartLeft: 252,
        bottomStartTop: 969,
        bottomEndTop: 1449,
        gap: 270
    },
    flappyBird = {
        startLeft: 1053,
        startTop: 273,
        width: 267,
        height: 72
    };

var preloaded = false,
    canvas,
    sCanvas,
    ctx,
    sCtx,
    img,
    birdVersion = 0;

// general game settings
let currentScore = 0,
    lastScore = 0,
    highScore = 0,
    gameReady = false,
    gamePlaying = false,
    hardMode = false,
    obstacleRunning = false,
    settingsOpened = false,
    playMusic = false,
    playSound = true,
    speed = 6.0 * (gameLoopInterval / 40),
    animation = 0,
    birdAnimation = 0,
    birdFlyHeight = 0,
    birdJumpHeight = -5,
    birdFlyHeightAdjustment = 0,
    gravity = 0.1;

const pipeLocation = () => (Math.random() * ((canvas.height - (obstacle.gap + obstacle.width)) - obstacle.width)) + obstacle.width;

// initialize
function init() {
    console.log("init() called!");

    // gameCanvas
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // scoreCanvas
    sCanvas = document.getElementById("scoreCanvas");
    sCtx = sCanvas.getContext("2d");

    // preload all assets
    preloadAssets();

    // perform setup
    setup();
}

function setup() {

    // reset game variables
    gameReady = false;
    gamePlaying = false;

    // reset game speed
    speed = 6.0 * (gameLoopInterval / 40)

    // reset score
    lastScore = currentScore;
    currentScore = 0;

    // reset flight adjustment
    birdFlyHeightAdjustment = 0;

    // generate first three obstacles
    pipeObstacles = Array(3).fill().map((a, i) => [canvas.width + (i * (obstacle.gap + obstacle.width)), pipeLocation()]);
    console.log(pipeObstacles);

    // set initial bird fly height
    birdFlyHeight = (canvas.height / 2 - (bird.height / 2));

}

// game loop
function gameLoop() {

    // increase animation index to display the animations
    animation++;

    // control sounds
    audioPlayer("music");

    // draw assets
    drawAssets();

    // game functions
    if (gamePlaying) {
        birdFly();
    }
    borderCollisionDetection();

    // enable hard mode
    if (hardMode) {
        applyHardMode();
    }
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

    if (!settingsOpened) {
        drawBird();
        document.getElementById("settingsButtonBird").style.visibility = "hidden";
        document.getElementById("settingsButtonMusic").style.visibility = "hidden";
        document.getElementById("settingsButtonSound").style.visibility = "hidden";
        document.getElementById("settingsButtonGameMode").style.visibility = "hidden";
        document.getElementById("settingsButtonBack").style.visibility = "hidden";
    } else {
        drawSettings();
        document.getElementById("settingsButtonBird").style.visibility = "visible";
        document.getElementById("settingsButtonMusic").style.visibility = "visible";
        document.getElementById("settingsButtonSound").style.visibility = "visible";
        document.getElementById("settingsButtonGameMode").style.visibility = "visible";
        document.getElementById("settingsButtonBack").style.visibility = "visible";
    }

    if (!gamePlaying) {
        drawMainScreen();
        obstacleRunning = false;
    } else {
        drawObstacles();
    }

    if (gameReady || settingsOpened) {
        document.getElementById("playButton").style.visibility = "hidden";
        document.getElementById("settingsButton").style.visibility = "hidden";
    }

    if (!gameReady && !settingsOpened) {
        document.getElementById("playButton").style.visibility = "visible";
        document.getElementById("settingsButton").style.visibility = "visible";
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
    sCtx.drawImage(
        // image
        img,
        // start pos x, start pos y
        876, 30,
        // width, height
        sCanvas.width, sCanvas.height,
        // canvas pos x, canvas pos y
        0, 0,
        // width on canvas, height on canvas
        sCanvas.width, sCanvas.height);
    sCtx.font = "bold 30px courier";

    if (gamePlaying) {
        sCtx.fillText(`Current Score: ${currentScore}`, 80, 35);
    } else {
        sCtx.fillText(`Last Score: ${lastScore}`, 100, 35);
    }

}

function drawObstacles() {

    pipeObstacles.map(pipe => {

        // move pipe
        pipe[0] -= speed;

        // draw obstacle (top)
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            obstacle.topStartLeft, obstacle.topEndTop - pipe[1],
            // width, height
            obstacle.width, pipe[1],
            // canvas pos x, canvas pos y
            pipe[0], 0,
            // width on canvas, height on canvas
            obstacle.width, pipe[1]);

        // draw obstacle (bottom)
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            obstacle.bottomStartLeft, obstacle.bottomStartTop,
            // width, height
            obstacle.width, canvas.height - pipe[1] + obstacle.gap,
            // canvas pos x, canvas pos y
            pipe[0], pipe[1] + obstacle.gap,
            // width on canvas, height on canvas
            obstacle.width ,canvas.height - pipe[1] + obstacle.gap);

        // count score and update pipes
        if (pipe[0] <= -obstacle.width) {
            // increase current score
            currentScore++;
            // update highscore (if necessary)
            highScore = Math.max(currentScore, highScore);

            // remove old pipe and add new one
            pipeObstacles = [...pipeObstacles.slice(1), [pipeObstacles[pipeObstacles.length - 1][0] + obstacle.gap + obstacle.width, pipeLocation()]];
            console.log(pipeObstacles);

            // play audio
            audioPlayer("point");
        }

        // collision detection
        /*if ([
            pipe[0] <= (canvas.width / 10) + bird.width,
            pipe[0] + obstacle.width >= (canvas.width / 10),
            pipe[1] > birdFlyHeight || pipe[1] + obstacle.gap < birdFlyHeight + bird.height,
        ].every(element => element)) {
            audioPlayer("hit");
            setup();
        }*/

        if (pipe[0] <= (canvas.width / 10) + bird.width &&
            pipe[0] + obstacle.width >= (canvas.width / 10) &&
            (pipe[1] > birdFlyHeight || pipe[1] + obstacle.gap < birdFlyHeight + bird.height)) {
            console.log("collision detected!");
            console.log(`pipe[0]: ${pipe[0]} pipe[1]: ${pipe[1]}`);
            audioPlayer("hit");
            setup();
        }

    });
}

function drawBird() {

    // draw bird
    if (gamePlaying) {
        ctx.drawImage(
            // image
            img,
            // start pos x, start pos y
            (bird.startLeft + (bird.width * birdAnimation)), bird.startTop + (bird.height * birdVersion),
            // width, height
            bird.width, bird.height,
            // canvas pos x, canvas pos y
            (canvas.width / 10), birdFlyHeight,
            // width on canvas, height on canvas
            bird.width, bird.height);
    } else {
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
        ctx.font = "bold 30px courier";
        ctx.fillText('Press "Space" or', 75, 550);
        ctx.fillText('tap the screen to start!', 0, 580);
    }

    // draw current highscore
    if (!settingsOpened) {
        ctx.font = "bold 30px courier";
        ctx.fillText(`Highscore: ${highScore}`, 110, 240);
    }

}

function drawSettings() {

    // draw bird
    ctx.drawImage(
        // image
        img,
        // start pos x, start pos y
        (bird.startLeft + (bird.width * birdAnimation)), bird.startTop + (bird.height * birdVersion),
        // width, height
        bird.width, bird.height,
        // canvas pos x, canvas pos y
        (canvas.width / 2 - (bird.width / 2)), birdFlyHeight - 50,
        // width on canvas, height on canvas
        bird.width, bird.height);

    // bird wings animation
    if (animation % gameLoopInterval === 0) {
        birdAnimation++;
        if (birdAnimation > 2) {
            birdAnimation = 0;
        }
    }

    // draw obstacle (top)
    ctx.drawImage(
        // image
        img,
        // start pos x, start pos y
        obstacle.topStartLeft, obstacle.topEndTop - 250,
        // width, height
        obstacle.width, obstacle.height,
        // canvas pos x, canvas pos y
        (canvas.width / 2 - (obstacle.width / 2)), 0,
        // width on canvas, height on canvas
        obstacle.width, obstacle.height);

}

function birdFly() {

    // bird flight height adjustment
    birdFlyHeightAdjustment += gravity;
    birdFlyHeight = Math.min(birdFlyHeight + birdFlyHeightAdjustment, canvas.height - bird.height);

}

function borderCollisionDetection() {

    // upper canvas border
    if (birdFlyHeight <= 0) {
        audioPlayer("swoosh");
        setup();
    }

    // bottom canvas border
    if (birdFlyHeight >= (canvas.height - bird.height)) {
        audioPlayer("die");
        setup();
    }
}

function applyHardMode() {

    // increase game speed after 10 points
    if (currentScore > 5) {
        if (animation % gameLoopInterval === 0) {
            speed = 6.0 * (gameLoopInterval / 40) + (currentScore / 100);
        }
        console.log("current game speed: " + speed);
    }

}

function audioPlayer(type) {
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
            case "die":
                document.getElementById("die").volume = 0.1;
                document.getElementById("die").play();
                break;
            case "swoosh":
                document.getElementById("swoosh").volume = 0.1;
                document.getElementById("swoosh").play();
                break;
        }
    }
}

// play button
document.getElementById("playButton").addEventListener('click', () => {
    gameReady = true;
    gamePlaying = false;
});

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
        audioPlayer("flap");
    }

});

window.onclick = () => {

    if (gamePlaying) {
        birdFlyHeightAdjustment = birdJumpHeight;
        audioPlayer("flap");
    }

};

document.getElementById("settingsButtonMusic").addEventListener('click', () => playMusic = !playMusic);
document.getElementById("settingsButtonSound").addEventListener('click', () => playSound = !playSound);
document.getElementById("settingsButtonGameMode").addEventListener('click', () => {
    if (hardMode) {
        document.getElementById("settingsButtonGameMode").innerHTML = "Game mode: normal";
        hardMode = false;
    } else {
        document.getElementById("settingsButtonGameMode").innerHTML = "Game mode: hard";
        hardMode = true;
    }
});
document.getElementById("settingsButtonBack").addEventListener('click', () => settingsOpened = false);

// keyboard actions
document.querySelector("html").onkeydown = function (e) {

    switch (e.key) {
        case " ":
            if (gameReady) {
                if (gamePlaying) {
                    birdFlyHeightAdjustment = birdJumpHeight;
                } else {
                    gamePlaying = true;
                    birdFlyHeightAdjustment = birdJumpHeight;
                }
                audioPlayer("flap");
            }
            break;
        // quit
        case "Escape":
            if (gameReady || gamePlaying) {
                gamePlaying = false;
                gameReady = false;
            }
            if (settingsOpened) {
                document.getElementById("settingsButtonBack").click();
            }
            break;
        // change bird color
        case "b":
            document.getElementById("settingsButtonBird").click();
            break;
        // toggle music
        case "m":
            document.getElementById("settingsButtonMusic").click();
            break;
        // toggle sound
        case "s":
            document.getElementById("settingsButtonSound").click();
            break;
        case "Enter":
            if (!gameReady && !settingsOpened && !gamePlaying) {
                gameReady = true;
            }
            break;
    }

}

// wait until everything is loaded
document.addEventListener("DOMContentLoaded", init);