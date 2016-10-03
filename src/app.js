"use strict";

/* Classes */
const Game = require('./game');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var pipes_image = new Image();
pipes_image.src = 'assets/pipes.png';

var totalCells = 81;
var board = [];

//Array of possible random pipe pieces (Not all default ones are desirable)
var randomPipeList = [0, 5, 6, 7, 11, 13, 14];
var futurePipes = [];
var currentIndex;
var startIndex;
var x = 0;
var y = 0;
var rand;
//List of pipes and their index on the spritesheet
var pipeList = 
{
	empty: 16,
	cross: 0,
	straightDown: 4,
	straightUp: 12,
	straightLeft: 3,
	straightRight: 1
}

for(var i=0; i<totalCells; i++)
{
	board.push({pipe: pipeList.empty, fluid: false, filled: false});
}
for(var i=0; i<3; i++)
{
	futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
}

rand = Math.floor(Math.random()*4);
var nextPipe;
//Left
if(rand == 0)
{
	y = Math.floor(Math.random()*9);
	x = 0;
	nextPipe = pipeList.straightRight;
}
//Top
else if(rand == 1)
{
	x = Math.floor(Math.random()*9);
	y = 0;
	nextPipe = pipeList.straightDown;
}
//Right
else if(rand == 2)
{
	y = Math.floor(Math.random()*9);
	x = 8;
	nextPipe = pipeList.straightLeft;
}
//Bottom
else
{
	x = Math.floor(Math.random()*9);
	y = 8;
	nextPipe = pipeList.straightUp;
}
startIndex = y * 9 + x;
board[startIndex].pipe = nextPipe;
board[startIndex].fluid = true;


canvas.onclick = function(event) {
	event.preventDefault();
	if(event.offsetX > 116)
	{
		x = Math.floor((event.offsetX-116)/ 96);
		y = Math.floor(event.offsetY/ 96);
		currentIndex = y * 9 + x;
		if(board[currentIndex].pipe == pipeList.empty)
		{
			board[currentIndex].pipe = futurePipes.shift();
			futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
		}
		else
		{
			
		}
	}
	
  // TODO: Place or rotate pipe tile
  
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  // TODO: Advance the fluid
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // TODO: Render the board
	for(var y = 0; y < 9; y++) {
		for(var x = 0; x < 9; x++) {
			var pipe = board[y * 9 + x];
			// draw the pipe sprite for this board spot
			ctx.drawImage(pipes_image,
			  // Source rect
			  pipe.pipe%4 * 96, Math.floor((pipe.pipe/4))*96, 96, 96,
			  // Dest rect
			  x * 96 + 116, y * 96, 96, 96
			);
		}
	}
	//Info bar rect (level/score/next pipes)
	ctx.fillStyle = "#B8B8B8";
	ctx.fillRect(0, 0, 116, 864);
	ctx.strokeStyle = "#404040";
	ctx.lineWidth = 3;
	ctx.strokeRect(0, 0, 116, 864);

	var infoY = futurePipes.length;
	for(var i = 0; i < futurePipes.length; i++)
	{
		infoY--;
		if(i != 0)
		{
			ctx.drawImage(pipes_image,
			  // Source rect
			  futurePipes[i]%4 * 96, Math.floor((futurePipes[i]/4))*96, 96, 96,
			  // Dest rect
			  10, infoY*96 + 5, 96, 96
			);
		}
		else
		{
			ctx.drawImage(pipes_image,
			  // Source rect
			  futurePipes[i]%4 * 96, Math.floor((futurePipes[i]/4))*96, 96, 96,
			  // Dest rect
			  5, infoY*96 + 35, 106, 106
			);
			ctx.strokeStyle = "#66c2ff"
			ctx.strokeRect(5, infoY*96 + 35, 106, 106);
		}	
		
	}
}
