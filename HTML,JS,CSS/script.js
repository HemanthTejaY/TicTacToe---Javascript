//Confetii

var confetti = {
	maxCount: 150,		//set max confetti count
	speed: 2,			//set the particle animation speed
	frameInterval: 15,	//the confetti animation frame interval in milliseconds
	alpha: 1.0,			//the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false,	//whether to use gradients for the confetti particles
	start: null,		//call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null,			//call to stop adding confetti
	toggle: null,		//call to start or stop the confetti animation depending on whether it's already running
	pause: null,		//call to freeze confetti animation
	resume: null,		//call to unfreeze confetti animation
	togglePause: null,	//call to toggle whether the confetti animation is paused
	remove: null,		//call to stop the confetti animation and remove all confetti immediately
	isPaused: null,		//call and returns true or false depending on whether the confetti animation is paused
	isRunning: null		//call and returns true or false depending on whether the animation is running
};

(function() {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function() {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min == max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}
	
	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			} else
				context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();


//Game Code

//Win possibilities
const winBoardPatterns = [
    [0, 4, 8],  //right diagonal
    [2, 4, 6],  //left diagonal
    [0, 1, 2],  //top row
    [3, 4, 5],  //middle row
    [6, 7, 8],  //bottom row
    [0, 3, 6],  //first column
    [1, 4, 7],  //second column
    [2, 5, 8]   //third column
];
//Attain Current Status of the Board and display to players
const boardCurrentStatus = document.querySelector('.game--status');

//Determine if game is running
let isGameAlive = true; 

//Initial Player's turn on first click 
let playerTurn = "O";

//Variable to store the board's upto date position
let boardStatus = ["","","","","","","","",""];

//Displaying results - who won or if draw
const printWinner = () => `${playerTurn} won!`; 
const printDraw = () => `Draw!`;

//Display whose turn it is currently at every alternating click
const whoseTurn = () => `${playerTurn} turn`;

//First Play initialized
boardCurrentStatus.innerHTML = whoseTurn();



//Invoke and fill cell that is clicked
function fillClickedCell(clickedCell, clickedCellIndex) {
    boardStatus[clickedCellIndex] = playerTurn;
    clickedCell.innerHTML = playerTurn;
}

//Alternate player after click and chose player
function alternatePlayer() {
    playerTurn = playerTurn === "X" ? "O" : "X";
    boardCurrentStatus.innerHTML = whoseTurn();
}

//Logic to determine who won 
function calculateWinner() {
    //Variable to store boolean - to determine whether the round was won 
    let doWeHaveAWinner = false;
    for (let i = 0; i <= 7; i++) 
    {
        //At each loop check with the winning patterns
        const checkForWinPattern = winBoardPatterns[i];
        let a = boardStatus[checkForWinPattern[0]];
        let b = boardStatus[checkForWinPattern[1]];
        let c = boardStatus[checkForWinPattern[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        //If pattern is met - round is won 
        if (a === b && b === c) 
        {
            doWeHaveAWinner = true;
            break
        }
    }

    //If round is won - print winner and kill game
    if (doWeHaveAWinner) 
    {
        boardCurrentStatus.innerHTML = printWinner();
        isGameAlive = false;
        confetti.start(null,30,100);
        return;
    }
    //Initialize draw possibility
    let didGameDraw = !boardStatus.includes("");
    //if round is a draw - print draw message and kill game
    if (didGameDraw) 
    {
        boardCurrentStatus.innerHTML = printDraw();
        isGameAlive = false;
        //load html2
        
        return;
    }
    //If either conditions are not met - we alternate and pass the game play to the other player
    alternatePlayer();
}

//Function to determine changes after each div-cell click
function makeCellChangesInDivAfterClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (boardStatus[clickedCellIndex] !== "" || !isGameAlive) {
        return;
    }

    fillClickedCell(clickedCell, clickedCellIndex);
    calculateWinner();
}

// Handles Resetting game upon reset button click
function ResetGame() 
{
    //Make game active again
    isGameAlive = true;
    //Reset player turn to O
    playerTurn = "O";
    //Reset board to empty status
    boardStatus = ["", "", "", "", "", "", "", "", ""];
    boardCurrentStatus.innerHTML = whoseTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
    confetti.stop();
}

// To trigger reset of the grids
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', makeCellChangesInDivAfterClick));
document.querySelector('.resetTheGame').addEventListener('click', ResetGame);

