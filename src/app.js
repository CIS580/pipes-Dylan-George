"use strict";

/* Classes */
const Game = require('./game');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var pipes_image = new Image();
pipes_image.src = 'assets/pipes.png';

var totalCells = 81;
var cellSize = 96;
var board = [];

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
	speed: 1/100,
	turns: [],
	turnIndex: 0,
	index: 0
}

//List of pipes and their index on the spritesheet
var pipeList = 
{
	empty: 3,
	cross: 2,
	upDown: 1,
	leftRight: 0
}
var randomPipeList = [0, 1, 2, 4, 5, 8, 9];

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
fluid.turns.push({x: fluid.x, y: fluid.y});
endIndex = initialPipes();
while(endIndex == startIndex)
{
	endIndex = initialPipes();
}
board[endIndex].fluid = true;

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
	if(event.offsetX > 116)
	{
		x = Math.floor((event.offsetX-116)/ cellSize);
		y = Math.floor(event.offsetY/ cellSize);
		currentIndex = y * 9 + x;
		if(board[currentIndex].pipe == pipeList.empty)
		{
			board[currentIndex].pipe = futurePipes.shift();
			board[currentIndex].x = x*96 + 116;
			board[currentIndex].y = y*96;
			futurePipes.push(randomPipeList[Math.floor(Math.random()*randomPipeList.length)]);
		}
	}
}

//Right click
window.oncontextmenu = function(event)
{
	event.preventDefault();
	x = Math.floor((event.offsetX-116)/ cellSize);
	y = Math.floor(event.offsetY/ cellSize);
	currentIndex = y * 9 + x;
	if(!board[currentIndex].fluid)
	{
		var pipe = board[currentIndex].pipe;
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

	if(fluid.direction == "up") 
	{
		fluid.y -= fluid.speed * elapsedTime;

		if(fluid.y - 10 <= board[fluid.index].y)
		{
			if(board[fluid.index-9].pipe == pipeList.empty) lost = true;
			else 
			{
				fluid.index -= 9;
			}
		}
	}
	else if(fluid.direction == "down") 
	{
		fluid.y += fluid.speed * elapsedTime;

		if(fluid.y >= board[fluid.index].y + 86)
		{
			if(board[fluid.index + 9].pipe == pipeList.empty) lost = true;
			else 
			{
				fluid.index += 9;
			}
		}
	}
	else if(fluid.direction == "right") 
	{
		fluid.x += fluid.speed * elapsedTime;
		if(fluid.x >= board[fluid.index].x + 86)
		{
			if(board[fluid.index + 1].pipe == pipeList.empty) lost = true;
			else
			{
				fluid.index++;
			}
		}
	}
	else 
	{
		fluid.x -= fluid.speed * elapsedTime;
		if(fluid.x - 10 <= board[fluid.index].x)
		{
			if(board[fluid.index - 1].pipe == pipeList.empty) lost = true;
			else 
			{
				fluid.index--;
			}
		}
	}
    var pipeCenter = {x: board[fluid.index].x + 48, y: board[fluid.index].y + 48};
	if (fluid.x >= pipeCenter.x - 5 && fluid.x <= pipeCenter.x + 5
			&& fluid.y >= pipeCenter.y - 5 && fluid.y <= pipeCenter.y + 5)
	{
		switch(board[fluid.index].pipe)
		{
			case 4:
				if(fluid.direction == "up")
				{
					fluid.direction = "right";
					fluid.turns.push({x: fluid.x-10, y: fluid.y});
					fluid.turnIndex++;
				}			
				else if(fluid.direction == "left")
				{
					fluid.direction = "down";				
					fluid.turns.push({x: fluid.x, y: fluid.y-10});
					fluid.turnIndex++;
				}
				break;
			case 5:
				if(fluid.direction == "up")
				{
					fluid.direction = "left";
					fluid.turns.push({x: fluid.x+10, y: fluid.y});
					fluid.turnIndex++;
				}			
				else if(fluid.direction == "right")
				{
					fluid.direction = "down";				
					fluid.turns.push({x: fluid.x, y: fluid.y-10});
					fluid.turnIndex++;
				}
				break;
			case 6: 
				if(fluid.direction == "down")
				{
					fluid.direction = "left";
					fluid.turns.push({x: fluid.x+10, y: fluid.y});
					fluid.turnIndex++;
				}			
				else if(fluid.direction == "right")
				{
					fluid.direction = "up";				
					fluid.turns.push({x: fluid.x, y: fluid.y+10});
					fluid.turnIndex++;
				}
				break;
			case 7:
				if(fluid.direction == "down")
				{
					fluid.direction = "right";
					fluid.turns.push({x: fluid.x-10, y: fluid.y});
					fluid.turnIndex++;
				}			
				else if(fluid.direction == "left")
				{
					fluid.direction = "up";				
					fluid.turns.push({x: fluid.x, y: fluid.y+10});
					fluid.turnIndex++;
				}
				break;
			case 8:
				if(fluid.direction == "up")
				{
					var r = board[fluid.index + 1].pipe;
					var l = board[fluid.index - 1].pipe;
					if(r == pipeList.empty && l != pipeList.empty) fluid.direction = "left";
					else if(l == pipeList.empty && r != pipeList.empty) fluid.direction = "right";
					else
					{
						var rand = Math.floor(Math.rand()*2) + 1;
						if(rand == 1) fluid.direction = "left";
						else fluid.direction = "right";
					}
				}
				break;
			case 9:
				if(fluid.direction == "right")
				{
					var b = board[fluid.index + 9].pipe;
					var a = board[fluid.index - 9].pipe;
					if(b == pipeList.empty && a != pipeList.empty) fluid.direction = "up";
					else if(a == pipeList.empty && b != pipeList.empty) fluid.direction = "down";
					else
					{
						var rand = Math.floor(Math.rand()*2) + 1;
						if(rand == 1) fluid.direction = "up";
						else fluid.direction = "down";
					}
				}
				break;
			case 10:
				if(fluid.direction == "down")
				{
					var r = board[fluid.index + 1].pipe;
					var l = board[fluid.index - 1].pipe;
					if(r == pipeList.empty && l != pipeList.empty) fluid.direction = "left";
					else if(l == pipeList.empty && r != pipeList.empty) fluid.direction = "right";
					else
					{
						var rand = Math.floor(Math.rand()*2) + 1;
						if(rand == 1) fluid.direction = "left";
						else fluid.direction = "right";
					}
				}
				break;
			case 11:
				if(fluid.direction == "left")
				{
					if(!board[fluid.index + 9])
					{
						fluid.direction = "up";
						fluid.turns.push({x: fluid.x, y: fluid.y+10});
						fluid.turnIndex++;
					}
					else if(!board[fluid.index - 9]) 
					{
						fluid.direction = "down";
						fluid.turns.push({x: fluid.x, y: fluid.y-10});
						fluid.turnIndex++;
					}
					else
					{
						var b = board[fluid.index + 9].pipe;
						var a = board[fluid.index - 9].pipe;
						if(b == pipeList.empty && a != pipeList.empty) fluid.direction = "up";
						else if(a == pipeList.empty && b != pipeList.empty) fluid.direction = "down";
						else
						{
							var rand = Math.floor(Math.random()*2) + 1;
							if(rand == 1) fluid.direction = "up";
							else fluid.direction = "down";
						}
					}
				}
				break;
		}
	}
			
	
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

	ctx.moveTo(fluid.turns[fluid.turnIndex].x, fluid.turns[fluid.turnIndex].y);
	ctx.lineWidth = 20;
	ctx.lineTo(fluid.x, fluid.y);
	ctx.strokeStyle = "lightgreen";
	ctx.stroke();
	for(i = 0; i < fluid.turns.length-1; i++)
	{
		ctx.moveTo(fluid.turns[i].x, fluid.turns[i].y);
		ctx.lineTo(fluid.turns[i+1].x, fluid.turns[i+1].y);
		ctx.stroke();
	}
		ctx.arc(fluid.x, fluid.y, 10, 0, 2*Math.PI);
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
}
