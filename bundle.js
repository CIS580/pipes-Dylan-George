(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Pipe Game
* Author: Dylan George (Framework provided by Nathan Bean)
*/

"use strict";

/* Classes */
const Game = require('./game');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var pipes_image = new Image();
pipes_image.src = 'assets/pipes.png';
var rotate = new Audio();
rotate.src = 'assets/rotate.wav';
rotate.volume = 0.25;
var place = new Audio();
place.src = 'assets/place.wav';
place.volume = 0.25;

var totalCells = 81;
var cellSize = 96;
var board = [];
var lost = false;
var won = false;
var score = 0;
var level = 1;
var speedMultiplier = 1;
//Array of possible random pipe pieces (Not all default ones are desirable)
var futurePipes = [];
var currentIndex;
var startIndex = -1;
var endIndex;
var x = 0;
var y = 0;

var fluid =
{
	x: 0,
	y: 0,
	direction: "up",
	speed: 1/50,
	index: 0
}
var bezierPoints = { one: {x :0, y: 0}, two: {x: 0, y: 0}, three: {x: 0, y: 0}, four: {x: 0, y: 0}};

//List of pipes and their index on the spritesheet
var pipeList = 
{
	empty: 3,
	cross: 2,
	upDown: 1,
	leftRight: 0
}
var randomPipeList = [0, 1, 2, 4, 5];
var filled = [];
for(var i=0; i<totalCells; i++)
{
	board.push({pipe: pipeList.empty, x: 0, y: 0, fluid: false, filled: false});
}
for(var i=0; i<3; i++)
{
	futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
}

//Initialize start and end pipes
startIndex = initialPipes();
board[startIndex].fluid = true;
fluid.index = startIndex;
endIndex = initialPipes();
while(endIndex == startIndex)
{
	endIndex = initialPipes();
}
board[endIndex].fluid = true;

function restart()
{
	lost = false;
	if(!won)
	{
		level = 1;
		score = 0;
		speedMultiplier = 1;
	}
	won = false;
	filled = [];
	board = [];
	futurePipes = [];
	startIndex = -1;
	fluid =
	{
		x: 0,
		y: 0,
		direction: "up",
		speed: 1/50 * speedMultiplier,
		index: 0
	}
	var bezierPoints = { one: {x :0, y: 0}, two: {x: 0, y: 0}, three: {x: 0, y: 0}, four: {x: 0, y: 0}};
	for(var i=0; i<totalCells; i++)
	{
		board.push({pipe: pipeList.empty, x: 0, y: 0, fluid: false, filled: false});
	}
	for(var i=0; i<3; i++)
	{
		futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
	}
	startIndex = initialPipes();
	board[startIndex].fluid = true;
	fluid.index = startIndex;
	endIndex = initialPipes();
	while(endIndex == startIndex)
	{
		endIndex = initialPipes();
	}
	board[endIndex].fluid = true;
}

function initialPipes()
{
	var rand = Math.floor(Math.random()*4);
	var nextPipe;
	var index;
	
	//Left
	if(rand == 0)
	{
		y = Math.floor(Math.random()*9);
		x = 0;
		nextPipe = pipeList.leftRight;
		if(startIndex == -1)
		{
			fluid.direction = "right";
			fluid.y = cellSize*y + cellSize/2;
			fluid.x = 116;
		}
		
	}
	//Top
	else if(rand == 1)
	{
		x = Math.floor(Math.random()*9);
		y = 0;
		nextPipe = pipeList.upDown;
		if(startIndex == -1)
		{		
			fluid.direction = "down";
			fluid.x = 116 + cellSize*x + cellSize/2;
			fluid.y = 0;
		}
	}
	//Right
	else if(rand == 2)
	{
		y = Math.floor(Math.random()*9);
		x = 8;
		nextPipe = pipeList.leftRight;
		
		if(startIndex == -1)
		{
			fluid.direction = "left";
			fluid.y = cellSize*y + cellSize/2;
			fluid.x = 116 + x * cellSize + cellSize;
		}
	}
	//Bottom
	else
	{
		x = Math.floor(Math.random()*9);
		y = 8;
		nextPipe = pipeList.upDown;
		
		if(startIndex == -1)
		{
			fluid.direction = "up";
			fluid.y = cellSize*y + cellSize;
			fluid.x = 116 + x * cellSize + cellSize/2;
		}
	}
	index = y * 9 + x;
	board[index].pipe = nextPipe;
	board[index].x = x * cellSize + 116;
	board[index].y = y * cellSize;
	return index;
}

canvas.onclick = function(event) {
	event.preventDefault();
	if(!lost)
	{
		if(event.offsetX > 116)
		{
			x = Math.floor((event.offsetX-116)/ cellSize);
			y = Math.floor(event.offsetY/ cellSize);
			currentIndex = y * 9 + x;
			if(board[currentIndex].pipe == pipeList.empty)
			{
				place.play();
				board[currentIndex].pipe = futurePipes.shift();
				board[currentIndex].x = x*96 + 116;
				board[currentIndex].y = y*96;
				futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
			}
		}
	}
}

//Right click to rotate
window.oncontextmenu = function(event)
{
	event.preventDefault();	
	if(!lost)
	{
		x = Math.floor((event.offsetX-116)/ cellSize);
		y = Math.floor(event.offsetY/ cellSize);
		currentIndex = y * 9 + x;
		if(!board[currentIndex].fluid)
		{
			var pipe = board[currentIndex].pipe;
			if (pipe != 3) rotate.play();
			switch(pipe)
			{
				
				case 0:
				case 4:
				case 5:
				case 6:
				case 8:
				case 9:
				case 10:
					board[currentIndex].pipe++;
					break;
				case 1:
					board[currentIndex].pipe--;
					break;
				case 7:
				case 11:
					board[currentIndex].pipe-=3;
					
			}
		}
	}
}

window.onkeydown = function(event)
{
	//Space to restart

	if(event.keyCode == 32)
	{	
		if (lost) restart();
		event.preventDefault();
	}
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
	if(!lost)
	{
		var x = board[fluid.index].x;
		var y = board[fluid.index].y;
		
		if(fluid.direction == "up") 
		{		
			fluid.y -= fluid.speed * elapsedTime;
			bezierPoints.one.x = x;
			bezierPoints.one.y = y + 96;
			bezierPoints.two.x = fluid.x - 48;
			bezierPoints.two.y = fluid.y - 30;
			bezierPoints.three.x = fluid.x + 48;
			bezierPoints.three.y = fluid.y - 30;
			bezierPoints.four.x = x + 96;
			bezierPoints.four.y = y + 96;
			if(fluid.y - 10 <= board[fluid.index].y)
			{
				filled.push({x: board[fluid.index].x, y: board[fluid.index].y});
				if(!findNextPipe()) lost = true;
			}
		}
		else if(fluid.direction == "down") 
		{
			fluid.y += fluid.speed * elapsedTime;
			bezierPoints.one.x = x;
			bezierPoints.one.y = y;
			bezierPoints.two.x = fluid.x - 48;
			bezierPoints.two.y = fluid.y + 30;
			bezierPoints.three.x = fluid.x + 48;
			bezierPoints.three.y = fluid.y + 30;
			bezierPoints.four.x = x + 96;
			bezierPoints.four.y = y;
			if(fluid.y >= board[fluid.index].y + 86)
			{
				filled.push({x: board[fluid.index].x, y: board[fluid.index].y});
				if(!findNextPipe()) lost = true;
			}
		}
		else if(fluid.direction == "right") 
		{
			fluid.x += fluid.speed * elapsedTime;
			bezierPoints.one.x = x;
			bezierPoints.one.y = y;
			bezierPoints.two.x = fluid.x + 30;
			bezierPoints.two.y = fluid.y - 48;
			bezierPoints.three.x = fluid.x + 30;
			bezierPoints.three.y = fluid.y + 48;
			bezierPoints.four.x = x;
			bezierPoints.four.y = y + 96;
			if(fluid.x >= board[fluid.index].x + 86)
			{
				filled.push({x: board[fluid.index].x, y: board[fluid.index].y});
				if(!findNextPipe()) lost = true;
			}
		}
		else 
		{
			fluid.x -= fluid.speed * elapsedTime;
			bezierPoints.one.x = x+96;
			bezierPoints.one.y = y;
			bezierPoints.two.x = fluid.x - 30;
			bezierPoints.two.y = fluid.y - 48;
			bezierPoints.three.x = fluid.x - 30;
			bezierPoints.three.y = fluid.y + 48;
			bezierPoints.four.x = x + 96;
			bezierPoints.four.y = y + 96;
			if(fluid.x - 10 <= board[fluid.index].x)
			{
				filled.push({x: board[fluid.index].x, y: board[fluid.index].y});
				if(!findNextPipe()) lost = true;
			}
		}
	}
}
function findNextPipe()
{
	if(fluid.index == endIndex) 
	{
		won = true;
		restart();
		speedMultiplier += 0.5;
		level++;
		score+=200;
	}
	if(!won)
	{
		var p = board[fluid.index].pipe;
		var p2;
		switch(p)
		{
			case 0: 						
				if(fluid.direction == "right")
				{
					p2 = board[fluid.index+1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
					fluid.index += 1;
				}
				else if(fluid.direction == "left")
				{
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11)) return false;
					fluid.index -= 1;
				}
				break;
			case 1:
				if(fluid.direction == "down")
				{
					p2 = board[fluid.index+9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 6 || p2 == 7 || p2 == 9 || p2 == 10 || p2 == 11)) return false;
					fluid.index +=9 ;
				}
				else if(fluid.direction == "up")
				{
					p2 = board[fluid.index-9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 4 || p2 == 5 || p2 == 8 || p2 == 9 || p2 == 11)) return false;
					fluid.index -= 9;
				}
				break;
			case 2: 
				if(fluid.direction == "right")
				{
					p2 = board[fluid.index+1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
					fluid.index += 1;
				}
				else if(fluid.direction == "left")
				{
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11)) return false;
					fluid.index -= 1;
				}
				else if(fluid.direction == "down")
				{
					p2 = board[fluid.index+9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 6 || p2 == 7 || p2 == 9 || p2 == 10 || p2 == 11)) return false;
					fluid.index += 9;
				}
				else if(fluid.direction == "up")
				{
					p2 = board[fluid.index-9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 4 || p2 == 5 || p2 == 8 || p2 == 9 || p2 == 11)) return false;
					fluid.index -= 9;
				}
				break;
			case 4:
				if(fluid.direction == "up")
				{
					if(!board[fluid.index+1]) return false;
					p2 = board[fluid.index+1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
					else
					{
						fluid.direction = "right";
						fluid.index++;
						fluid.x = board[fluid.index].x;
						fluid.y = board[fluid.index].y + 48;
					}
				}
				else if(fluid.direction == "left")
				{
					if(!board[fluid.index+9]) return false;
					p2 = board[fluid.index+9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 6 || p2 == 7 || p2 == 9 || p2 == 10 || p2 == 11)) return false;
					else
					{
						fluid.direction = "down";
						fluid.index+=9;
						fluid.x = board[fluid.index].x + 48;
						fluid.y = board[fluid.index].y;
					}
				}
				break;
			case 5:
				if(fluid.direction == "right")
				{
					if(!board[fluid.index+9]) return false;
					p2 = board[fluid.index+9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 6 || p2 == 7 || p2 == 9 || p2 == 10 || p2 == 11)) return false;
					else
					{
						fluid.direction = "down";
						fluid.index += 9;
						fluid.x = board[fluid.index].x + 48;
						fluid.y = board[fluid.index].y;
					}
				}
				else if (fluid.direction == "up")
				{
					if(!board[fluid.index-1]) return false;
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11)) return false;
					else
					{
						fluid.direction = "left";
						fluid.index--;
						fluid.x = board[fluid.index].x + 96;
						fluid.y = board[fluid.index].y + 48;
					}
				}
				break;
			case 6:
				if(fluid.direction == "right")
				{
					if(!board[fluid.index-9]) return false;
					p2 = board[fluid.index-9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 4 || p2 == 5 || p2 == 8 || p2 == 9 || p2 == 11)) return false;
					else
					{
						fluid.direction = "up";
						fluid.index -= 9;
						fluid.x = board[fluid.index].x + 48;
						fluid.y = board[fluid.index].y + 96;
					}
				}
				else if (fluid.direction == "down")
				{
					if(!board[fluid.index-1]) return false;
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11)) return false;
					else
					{
						fluid.direction = "left";
						fluid.index--;
						fluid.x = board[fluid.index].x + 96;
						fluid.y = board[fluid.index].y + 48;
					}
				}
				break;
			case 7:
				if(fluid.direction == "down")
				{
					if(!board[fluid.index+1]) return false;
					p2 = board[fluid.index+1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
					else
					{
						fluid.direction = "right";
						fluid.index++;
						fluid.x = board[fluid.index].x + 96;
						fluid.y = board[fluid.index].y + 48;
					}
				}
				else if(fluid.direction == "left")
				{
					if(!board[fluid.index-9]) return false;
					p2 = board[fluid.index-9].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 1 || p2 == 2 || p2 == 4 || p2 == 5 || p2 == 8 || p2 == 9 || p2 == 11)) return false;
					else
					{
						fluid.direction = "up";
						fluid.index-=9;
						fluid.x = board[fluid.index].x + 48;
						fluid.y = board[fluid.index].y + 96;
					}
				}
				break;
			case 8:
				if(fluid.direction == "right")
				{
					p2 = board[fluid.index+1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
					fluid.index += 1;
				}
				else if(fluid.direction == "left")
				{
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11)) return false;
					fluid.index -= 1;
				}
				else
				{
					p2 = board[fluid.index-1].pipe;
					if(p2 == 3) return false;
					if(!(p2 == 0 || p2 == 2 || p2 == 4 || p2 == 7 || p2 == 8 || p2 == 10 || p2 == 11))
					{
						p2 = board[fluid.index+1].pipe;
						if(p2 == 3) return false;
						if(!(p2 == 0 || p2 == 2 || p2 == 5 || p2 == 6 || p2 == 8 || p2 == 9 || p2 == 10)) return false;
						fluid.index += 1;
					}
					else fluid.index -= 1;
					
				}
		}
		
		board[fluid.index].fluid = true;
		return true;
	}
	return true;
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
	ctx.fillStyle = "darkgrey";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Render the fluid
	ctx.fillStyle = "lightgreen";
	filled.forEach(function(pipe) 
	{
		ctx.fillRect(pipe.x, pipe.y, 96, 96);
	});
	ctx.moveTo(bezierPoints.one.x, bezierPoints.one.y);
	ctx.bezierCurveTo(bezierPoints.two.x, bezierPoints.two.y, 
						bezierPoints.three.x, bezierPoints.three.y,
						bezierPoints.four.x, bezierPoints.four.y);
	ctx.fill();
	
	//Rendering objects on the board
	for(var y = 0; y < 9; y++) {
		for(var x = 0; x < 9; x++) {
			var pipe = board[y * 9 + x];
			// draw the pipe sprite for this board spot
			ctx.drawImage(pipes_image,
			  // Source rect
			  pipe.pipe%4 * cellSize, Math.floor((pipe.pipe/4))*cellSize, cellSize, cellSize,
			  // Dest rect
			  x * cellSize + 116, y * cellSize, cellSize, cellSize
			);
		}
	}
	
	//Rendering the level, score, and future pipes
	ctx.fillStyle = "#B8B8B8";
	ctx.fillRect(0, 0, 116, 864);
	ctx.strokeStyle = "#404040";
	ctx.lineWidth = 3;
	ctx.strokeRect(0, 0, 116, 864);
	ctx.font = "20px Georgia";
	ctx.fillStyle = "black";
	ctx.fillText("Score: " + score, 10, 400);
	ctx.fillText("Level: " + level, 10, 450);
	var infoY = futurePipes.length;
	for(var i = 0; i < futurePipes.length; i++)
	{
		infoY--;
		if(i != 0)
		{
			ctx.drawImage(pipes_image,
			  // Source rect
			  futurePipes[i]%4 * cellSize, Math.floor((futurePipes[i]/4))*cellSize, cellSize, cellSize,
			  // Dest rect
			  10, infoY*cellSize + 5, cellSize, cellSize
			);
		}
		else
		{
			ctx.drawImage(pipes_image,
			  // Source rect
			  futurePipes[i]%4 * cellSize, Math.floor((futurePipes[i]/4))*cellSize, cellSize, cellSize,
			  // Dest rect
			  5, infoY*cellSize + 35, 106, 106
			);
			ctx.strokeStyle = "#66c2ff"
			ctx.strokeRect(5, infoY*cellSize + 35, 106, 106);
		}	
		  	ctx.beginPath();
	}
	
	if(lost)
	{
		ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
		ctx.fillRect(0, canvas.height/4, canvas.width, 320);
		ctx.fillStyle = 'black';
		ctx.font = "40px Arial"; 
		ctx.fillText("Game over :(", canvas.width/3 + 5, canvas.height/3 + 60);
		ctx.fillText("Press Space to try again.", canvas.width/5 + 20, canvas.height/3+140);
	}
}

},{"./game":2}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');
  	
	this.frontCtx.beginPath();
  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;
  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}]},{},[1]);
