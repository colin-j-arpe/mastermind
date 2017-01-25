var gameWidth = 4;
var gameColours = 6;
var pegColourNames = ["Yellow", "Red", "Green", "Blue", "Black", "White", "Orange", "Purple", "Cyan", "Magenta","Brown", "Pink"];
var pegColourRGBs = ["#ffff00", "#ff0000", "#00ff00", "#0000ff", "#000000", "#ffffff", "#ff8800", "#880088", "#00ffff", "#ff00ff", "#994400", "#ffaaaa"];
var stopBlinking;

function widthDefault (width)	{
	if (width === gameWidth) return (" selected");
	return;
}
function colourDefault (colour)	{
	if (colour === gameColours) return (" selected");
	return;
}

$(document).ready(function () {
// DOM referents
	var widthMenu = $("#width-menu");
	var colourMenu = $("#colour-menu");
	var instModal = $("#instruc-modal")[0];
	var instButton = $("#open-instructions");
	var instClose = $("#instruc-close-button");
	var newButton = $("#new-game-button");
	var pageBody = $("#previous-guesses");
	var footer = $("#page-footer")[0];
	var guessRow = $("#pending-guess");
	var pickRow = $("#available-colours");
	var guessButton = $("#submit-guess");
	var thisGame = new Game (0,0);

// Fill menus
	for (var i = 2; i <= 16; i++) {
		widthMenu.append("<option value='" + i + "'" + widthDefault(i) + ">" + i + "</option>");
	}
	for (var i = 2; i <= 12; i++) {
		colourMenu.append("<option value='" + i + "'" + colourDefault(i) + ">" + i + "</option>");
	}

// Buttons
	instButton.on("click", function () {
		instModal.style.display = "block";
	});
	instClose.on("click", function () {
		instModal.style.display = "none";
	});

	newButton.on("click", newGame);
	guessButton.on("click", submitGuess);

// Start game
	function newGame ()	{
		var guessPegs = createBlankGuess(widthMenu.val());
		var pickPegs = createColourPicker(colourMenu.val());
		$("#submit-guess")[0].style.visibility = "hidden";
		footer.style.display = "block";
		thisGame = new Game (guessPegs.length, pickPegs.length);

		if (stopBlinking) clearInterval(stopBlinking);
		stopBlinking = setInterval(blinker, 400);
		guessListener(pickPegs, guessPegs, thisGame, stopBlinking);
		
		function blinker () {
			var peg = thisGame.livePeg
			var current = thisGame.guess[peg]
			if ($(".guess-peg").eq(peg)[0].style.backgroundColor === "rgb(68, 68, 68)")	{
				if (isNaN(current)) {
					$(".guess-peg").eq(peg)[0].style.backgroundColor = "#bbbbbb";
				}	else	{
					$(".guess-peg").eq(peg)[0].style.backgroundColor = pegColourRGBs[current];
				}
			}	else	{
				$(".guess-peg").eq(peg)[0].style.backgroundColor = "#444444";
			}
		}
	}

// Submit guess, show result
		function submitGuess () {
console.log("clicked");
			pageBody.prepend("<div class='prev-guess'></div>")
			$(".prev-guess").eq(0).append("<div class='guess-number'><h3>" + $(".prev-guess").length + "</h3></div>")
			for (var i = 0; i < thisGame.guess.length; i++) {
				$(".prev-guess").eq(0).append("<div class='peg' style='background-color: " + pegColourRGBs[thisGame.guess[i]] + "'></div>");
			}
		}

// Fill out footer row content
	function createBlankGuess (num)	{
		guessRow.html("");
		for (var i = 0; i < num; i++) {
			guessRow.append("<div class='peg guess-peg' style='background-color: #bbbbbb'></div>");
		}
		return $(".guess-peg");
	}

	function createColourPicker (num)	{
		pickRow.html("");
		for (var i = 0; i < num; i++) {
			pickRow.append("<div class='peg pick-peg' style='background-color: " + pegColourRGBs[i] + "'></div>");
		}
		return $(".pick-peg");
	}

// Live fucntionality in footer
	function guessListener (colours, guesses, theGame, stop)	{
		colours.each(function (index) {
			$(this).on("click", function() {
				recolourGuess(index, theGame.livePeg);
				updateGuess(index, guesses, theGame);
			});
		});
		guesses.each(function (index) {
			$(this).on("click", function() {
				if (isNaN(theGame.guess[theGame.livePeg])) {
					$(".guess-peg").eq(theGame.livePeg)[0].style.backgroundColor = "#bbbbbb";
				}	else	{
					$(".guess-peg").eq(theGame.livePeg)[0].style.backgroundColor = pegColourRGBs[theGame.guess[theGame.livePeg]];
				}
				theGame.livePeg = index;
			});
		});
	}

	function recolourGuess (colour, guessPeg)	{
		$(".guess-peg")[guessPeg].style.backgroundColor = pegColourRGBs[colour];
	}

	function updateGuess (i, guesses, game)	{
		game.guess[game.livePeg] = i;
		game.livePeg = (game.livePeg + 1) % guesses.length;
		if (!game.guess.some(isNaN)) {
			$("#submit-guess")[0].style.visibility = "visible";
		}
	}

	// var nextGuess = [];
	// for (var i = 0; i < gameWidth; i++) {
	// 	nextGuess[i] = (-1);
	// }


	// for (let i = 0; i < gameWidth; i++) {
	// 	$(".guess-menu").eq(i).on("change", function ()	{
	// 		var colour = $(".guess-menu").eq(i).val();
	// 		$(".guess-peg").eq(i).attr("background-color", pegColourRGBs[colour]);
	// 		nextGuess[i] = colour;
	// 	});
	// }
});

function Game (width, colours)	{
	// this.width = width;
	this.colours = colours;
	this.livePeg = 0;
	this.guess = [];
	this.guess.length = width;
	this.guess.fill(NaN);

	this.createNewCombo = function (width, colours)	{
		var combination = [];
		for (var i = 0; i < width; i++) {
			combination[i] = Math.floor(Math.random() * colours);
		}
		return combination;
	}
	this.combination = this.createNewCombo (width, colours);

	function checkGuess (guess, answer)	{
		var checked = [];
		var black = 0;
		var white = 0;
		for (var i = 0; i < gameWidth; i++) {
			checked.push(false);
		}

		for (var i = 0; i < gameWidth; i++) {
			if (guess[i] === answer[i])	{
				black++;
				checked[i] = true;
			}
		}
		if (black = gameWidth) gameWon();
		
		var guessRemaining = [];
		var answerRemaining = [];
		var counted = [];
		for (var i = 0; i < gameWidth; i++) {
			if (!checked[i])	{
				guessRemaining.push(guess[i]);
				answerRemaining.push(answer[i]);
				counted.push(false);
			}	
		}
		for (var i = 0; i < guessRemaining.length; i++) {
			match = answerRemaining.indexOf(guessRemaining[i]);
			if (match >= 0 && !checked[match])	{
				white++;
				checked[match] = true;
			}
		}
		showResult (guess, black, white);
	}
}


// function guessMenu (colours)	{
// 	var string = "<select class='guess-menu'><option disabled>Select colour...</option>";
// 	for (var i = 0; i < colours; i++) {
// 		string += "<option value='" + i + "'>" + pegColourNames[i] + "</option>"
// 	}
// 	string += "</select>"
// 	return string
// }

function gameWon ()	{

}

function showResult (guess, black, white)	{
	$("#previous-guesses").append("<div class='guess-row'>");
	for (var i = 0; i < gameWidth; i++) {
		$("#previous-guesses").append("<div class='guess-peg' style='background-color: " + pegColourRGBs[guess[i]] + "'></div>");
	}
	$("#previous-guesses").append("<div class='result-section'><div class='result-row-black'>");
	for (var i = 0; i < black.length; i++) {
		$("#previous-guesses").append("<div")
	}
}
