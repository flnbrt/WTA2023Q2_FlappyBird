// global variables
const backgroundSize = [432, 768],
    birdSize = [51, 36];

var canvas,
    ctx,
    world,
    bird;

// general game settings
let gamePlaying = false,
    speed = 6.0,
    index = 0;


// initialize
function init() {
    console.log("init() called!");

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    //background = new Image();
    //background.src = "assets/FlappyBird_SpriteSheet.png";

    //background = document.getElementById("background");

    //document.getElementsByTagName("body");

    // preload all assets
    preloadAssets();
}

// game loop
function gameLoop() {

    // increase index to display the animations
    index++;

    // draw background
    drawBackground();
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

    // add world background
    world = addImage("assets/FlappyBird_SpriteSheet_3x.png");
    bird = addImage("assets/FlappyBird_SpriteSheet_3x.png");

    /*
    world = addImage("https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png");
    bird = addImage("https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png");
    */

    // call gameLoop if every asset is loaded
    var checkResources = function () {

        if (preloadCount === 0) {
            // every 40ms
            console.log("gameLoop() called")
            setInterval(gameLoop, 40);
        } else {
            // 200ms timeout
            console.log("waiting for " + preloadCount + " asset(s) to load!")
            setTimeout(checkResources, 200);
        }
    }
    checkResources();
}

// draw background
function drawBackground() {

    // draw world background
    ctx.drawImage(world, 0, 0, backgroundSize[0], backgroundSize[1],
        0, 0, backgroundSize[0], backgroundSize[1]);

    // draw bird
    ctx.drawImage(bird, 6, 1473, birdSize[0], birdSize[1],
        (canvas.width / 2 - (birdSize[0] / 2)), (canvas.height / 2 - (birdSize[0] / 2)), birdSize[0], birdSize[1]);

}

// wait until everything is loaded
document.addEventListener("DOMContentLoaded", init);