/*
   inspired by https://codepen.io/ju-az/pen/eYJQwLx/
   licensed under MIT
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
        bottomHeight: 480
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
};

var preloaded = false,
    canvas,
    ctx,
    worldImage,
    birdImage,
    obstacleImage,
    flappyBirdImage,
    playButtonImage,
    settingsButtonImage,
    birdVersion = 0;

// general game settings
let gamePlaying = false,
    settingsOpened = false,
    speed = 6.0 * (gameLoopInterval / 40),
    animation = 0,
    settingsPress = 0;


// initialize
function init() {
    console.log("init() called!");

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // preload all assets
    preloadAssets();
}

// game loop
function gameLoop() {

    // increase animation index to display the animations
    animation++;

    // draw assets
    drawAssets();

    if (preloaded) {
        // move position of buttons on click
        /*
        canvas.addEventListener("mousedown", function ()  { settingsPress = 2; console.log("settings pressed") });
        canvas.addEventListener("mouseup", function ()  { settingsPress = 0; console.log("settings released") });
        */

        //document.getElementById("test").addEventListener("mouseup", () => console.log("test"));


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

    /*
        sprite sheet taken by https://www.spriters-resource.com/mobile/flappybird/sheet/59894/
        (c) Superjustinbros
     */

    // add world background
    worldImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    // add bird image
    birdImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    // add obstacle image
    obstacleImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    // add flappy bird image
    flappyBirdImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    // add play button
    playButtonImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    // add play button
    settingsButtonImage = addImage("assets/FlappyBird_SpriteSheet_3x.png");

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

    //drawObstacles();
    if (!settingsOpened) {
        drawBird();
    }

    if (!gamePlaying || !settingsOpened) {
        drawMainScreen();
    }

}

// draw background
function drawBackground() {

    // draw world background (left part)
    ctx.drawImage(worldImage, background.startLeft, background.startTop, background.width, background.height,
        -((animation * speed) % background.width), 0, background.width, background.height);

    // draw world background (right part)
    ctx.drawImage(worldImage, background.startLeft, background.startTop, background.width, background.height,
        -((animation * speed) % background.width) + background.width, 0, background.width, background.height);

}

function drawObstacles() {

    // draw obstacle
    ctx.drawImage(obstacleImage, obstacle.topStartLeft, obstacle.topStartTop, obstacle.topWidth, obstacle.topHeight,
        ((canvas.width / 2) - (obstacle.topWidth / 2)), -200, obstacle.topWidth, obstacle.topHeight);

}

function drawBird() {

    // draw bird
    ctx.drawImage(
        birdImage,

        bird.startLeft + (bird.width * birdVersion), bird.startTop + (bird.height * birdVersion),
        bird.width, bird.height,

        (canvas.width / 2 - (bird.width / 2)), (canvas.height / 2 - (bird.height / 2)),
        bird.width, bird.height);

}

function drawMainScreen() {

    // draw flappy bird logo
    ctx.drawImage(
        // image
        flappyBirdImage,

        // start pos x, start pos y
        flappyBird.startLeft, flappyBird.startTop,
        // width, height
        flappyBird.width, flappyBird.height,

        // canvas pos x, canvas pos y
        ((canvas.width / 2) - (flappyBird.width / 2)), ((canvas.height / 2) - (flappyBird.height / 2) - 275),
        // width on canvas, height on canvas
        flappyBird.width, flappyBird.height);

    // draw settings button
    ctx.drawImage(
        // image
        settingsButtonImage,

        // start pos x, start pos y
        settingsButton.startLeft, settingsButton.startTop,
        // width, height
        settingsButton.width, settingsButton.height,

        // canvas pos x, canvas pos y
        ((canvas.width / 2) - (settingsButton.width / 2) - 100), ((canvas.height / 2) - (settingsButton.height / 2) + 275) + settingsPress,
        // width on canvas, height on canvas
        settingsButton.width, settingsButton.height);

    // draw play button
    ctx.drawImage(
        // image
        playButtonImage,

        // start pos x, start pos y
        playButton.startLeft, playButton.startTop,
        // width, height
        playButton.width, playButton.height,

        // canvas pos x, canvas pos y
        ((canvas.width / 2) - (playButton.width / 2) + 100), ((canvas.height / 2) - (playButton.height / 2) + 275),
        // width on canvas, height on canvas
        playButton.width, playButton.height);

}

function buttonPressed(e) {
    if (ctx.isPointInPath(settingsButtonImage, e.offsetX, e.offsetY)) {
        console.log("settings button pressed!")
        settingsPress = 2;
    }
}

function buttonReleased(e) {

}


document.getElementById("gameDiv").addEventListener("mousedown", buttonPressed);
document.getElementById("gameDiv").addEventListener("mouseup", buttonReleased);

// wait until everything is loaded
document.addEventListener("DOMContentLoaded", init);