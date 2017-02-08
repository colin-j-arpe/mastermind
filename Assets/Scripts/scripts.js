// Global variables
var gameWidth = 4;
var gameColours = 6;
var pegColourNames = ["Yellow", "Red", "Green", "Blue", "Black", "White", "Orange", "Purple", "Cyan", "Magenta","Brown", "Pink"];
var pegColourRGBs = ["#ffff00", "#ff0000", "#00ff00", "#0000ff", "#000000", "#ffffff", "#ff8800", "#880088", "#00ffff", "#ff00ff", "#994400", "#ffaaaa"];
var thisGame;
var thisCode;
var game = true;
var comboPegs = [];
var pickPegs = [];
var livePeg = 0;
var stopBlinking;
var currentCombo = [];

function widthDefault (width)	{
	if (width === gameWidth) return (" selected");
	return;
}
function colourDefault (colour)	{
	if (colour === gameColours) return (" selected");
	return;
}

function totalCombinations (width, colours)	{
	var total = colours;
	for (var i = 0; i < width-1; i++) {
		total *= colours;
	}
	return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function () {
// DOM referents
	var widthMenu = 	$("#width-menu");
	var colourMenu = 	$("#colour-menu");
	var instModal = 	$("#instruc-modal")[0];
	var instButton = 	$("#open-instructions");
	var newButton = 	$("#new-game-button");
	var codeButton = 	$("#enter-code-button");
	var comboMessage = 	$("#combinations-message");
	var pageBody = 		$("#previous-guesses");
	var footer = 		$("#page-footer")[0];
	var comboRow = 		$("#current-combo");
	var pickRow = 		$("#available-colours");
	var guessButton = 	$("#submit-guess");
	var enterButton = 	$("#submit-code");
	var winModal = 		$("#win-game-modal")[0];
	var solveModal =	$("#solve-code-modal")[0];

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
	$(".close-button").eq(0).on("click", function () {
		instModal.style.display = "none";
	});

	newButton.on("click", newGame);
	codeButton.on("click", newCode);
	guessButton.on("click", submitGuess);
	enterButton.on("click", submitCode);

// Start game
	function newGame ()	{
		game = true;
		thisGame = new Game (widthMenu.val(), colourMenu.val());
		resetPage (thisGame.width, thisGame.colours);
	}

// Begin new code break
	function newCode ()	{
		game = false;
		thisCode = new Code (widthMenu.val(), colourMenu.val());
		resetPage (thisCode.width, thisCode.colours);
	}

	function resetPage (width, colours)	{
		pageBody.html("");
		comboMessage.text(totalCombinations(width, colours) + " possible combinations");
		comboPegs = createBlankGuess(width);
		pickPegs = createColourPicker(colours);
		guessButton[0].style.visibility = "hidden";
		enterButton[0].style.visibility = "hidden";
		guessButton.removeAttr("disabled");
		enterButton.removeAttr("disabled");
		footer.style.display = "block";
		currentCombo.length = width;
		currentCombo.fill(NaN);
		livePeg = 0;
		pickListener(width);
	}

	function closeBoard ()	{
		clearInterval(stopBlinking);
		$(".combo-peg").eq(livePeg)[0].style.backgroundColor = pegColourRGBs[currentCombo[livePeg]];
		$(".combo-peg").each(function() {
			$(this).off("click");
		});
		$(".pick-peg").each(function() {
			$(this).off("click");
		});
		guessButton.attr("disabled", true);
		enterButton.attr("disabled", true);
	}

// Live functionality in footer
	function pickListener (width)	{
		if (stopBlinking) clearInterval(stopBlinking);
		stopBlinking = setInterval(blinker, 400);
		pickPegs.each(function (index) {
			$(this).on("click", function() {
				recolourPeg(index);
				updateCombo(width, index);
			});
		});
		comboPegs.each(function (index) {
			$(this).on("click", function() {
				if (isNaN(currentCombo[livePeg])) {
					$(".combo-peg").eq(livePeg)[0].style.backgroundColor = "#bbbbbb";
				}	else	{
					$(".combo-peg").eq(livePeg)[0].style.backgroundColor = pegColourRGBs[currentCombo[livePeg]];
				}
				livePeg = index;
			});
		});
	}

	function blinker () {
		var current = currentCombo[livePeg]
		if ($(".combo-peg").eq(livePeg)[0].style.backgroundColor === "rgb(68, 68, 68)")	{
			if (isNaN(current)) {
				$(".combo-peg").eq(livePeg)[0].style.backgroundColor = "#bbbbbb";
			}	else	{
				$(".combo-peg").eq(livePeg)[0].style.backgroundColor = pegColourRGBs[current];
			}
		}	else	{
			$(".combo-peg").eq(livePeg)[0].style.backgroundColor = "#444444";
		}
	}

	function recolourPeg (colour)	{
		$(".combo-peg")[livePeg].style.backgroundColor = pegColourRGBs[colour];
	}

	function updateCombo (width, colour)	{
		currentCombo[livePeg] = colour;
		livePeg = (livePeg + 1) % width;
		if (!currentCombo.some(isNaN)) {
			if (game) {
				guessButton[0].style.visibility = "visible";
			}	else	{
				enterButton[0].style.visibility = "visible";
			}
		}
	}

// Submit guess, show result
	function submitGuess () {
		newGuessRow();
		$(".guess-results").eq(0).append("<div class='black-peg-row'></div><div class='white-peg-row'></div>");

		results = thisGame.checkGuess(currentCombo);
		for (var i = 0; i < results[0]; i++) {
			$(".black-peg-row").eq(0).append("<div class='result-peg black-peg'></div>");
		}
		for (var i = 0; i < results[1]; i++) {
			$(".white-peg-row").eq(0).append("<div class='result-peg white-peg'></div>");
		}

		if (results[0] === thisGame.combination.length) winGame();
		clearGuess();
	}

	function newGuessRow ()	{
		pageBody.prepend("<div class='prev-guess'></div>")
		$(".prev-guess").eq(0).append("<div class='guess-number'><h3>" + $(".prev-guess").length + "</h3></div>")
		for (var i = 0; i < currentCombo.length; i++) {
			$(".prev-guess").eq(0).append("<div class='peg' style='background-color: " + pegColourRGBs[currentCombo[i]] + "'></div>");
		}
		$(".prev-guess").eq(0).append("<div class='guess-results'></div>");
	}

	function submitCode ()	{
		closeBoard();
		thisCode.combination = currentCombo;
		currentCombo = thisCode.firstGuess();
		results = [];
		resultRow();
	}

	function submitResults ()	{
if (results[0] == thisCode.width) return;
if ($(".prev-guess").length > 20) return;
console.log(thisCode.combosChecked + " checks performed");
// console.log("now checking guess " + $(".prev-guess").length);
		// $(".submit-results").eq(0).attr("disabled", true);
		currentCombo = thisCode.nextGuess(results[0], results[1]);
		resultRow();
	}

	function resultRow ()	{
if (results[0] == thisCode.width) return;
		newGuessRow();
		// $(".guess-results").eq(0).append("Black pegs (exact matches): <select class='black-peg-menu'></select>  White pegs (right colour, wrong place): <select class='white-peg-menu'></select> <button class='submit-results'>Submit Results</button>");
		$(".guess-results").eq(0).append("<div class='black-peg-row'></div><div class='white-peg-row'></div>");
		
		// defaultResults = thisCode.evaluate(currentCombo, thisCode.combination);
		results = thisCode.evaluate(currentCombo, thisCode.combination);
		for (var i = 0; i < results[0]; i++) {
			$(".black-peg-row").eq(0).append("<div class='result-peg black-peg'></div>");
		}
		for (var i = 0; i < results[1]; i++) {
			$(".white-peg-row").eq(0).append("<div class='result-peg white-peg'></div>");
		}
// console.log("results[0] is " + results[0] + ", thisCode.width is " + thisCode.width);
		// results.fill(NaN);
		if (results[0] == thisCode.width)	{
console.log("running solveCode");
			solveCode();
			return;
		}	else	{
			setTimeout(submitResults(), 5000);
		}

		// for (var i = 0; i <= comboPegs.length; i++) {
		// 	$(".black-peg-menu").eq(0).append("<option" + blackDefault(i) + ">" + i + "</option>");
		// 	$(".white-peg-menu").eq(0).append("<option" + whiteDefault(i) + ">" + i + "</option>");
		// }
		// $(".submit-results").eq(0).on("click", submitResults);

		// function blackDefault (num)	{
		// 	if (defaultResults[0] === num) return (" selected");
		// }
		// function whiteDefault (num)	{
		// 	if (defaultResults[1] === num) return (" selected");
		// }
	}

// Fill out footer row content
	function createBlankGuess (num)	{
		comboRow.html("");
		for (var i = 0; i < num; i++) {
			comboRow.append("<div class='peg combo-peg' style='background-color: #bbbbbb'></div>");
		}
		return $(".combo-peg");
	}

	function createColourPicker (num)	{
		pickRow.html("");
		for (var i = 0; i < num; i++) {
			pickRow.append("<div class='peg pick-peg' style='background-color: " + pegColourRGBs[i] + "'></div>");
		}
		return $(".pick-peg");
	}

	function clearGuess ()	{
		$(".combo-peg").each(function () {
			$(this)[0].style.backgroundColor = "#bbbbbb";
		});
		livePeg = 0;
		currentCombo.fill(NaN);
		guessButton[0].style.visibility = "hidden";
	}

	function winGame ()	{
		closeBoard();
		// var width = $(".combo-peg").length;
		// var colours = $(".pick-peg").length;
		$("#win-width").text(thisGame.width.toString());
		$("#win-colours").text(thisGame.colours.toString());
		$("#win-combos").text(totalCombinations(thisGame.width, thisGame.colours));
		$("#win-guesses").text($(".prev-guess").length.toString());
		winModal.style.display = "block";
		$(".close-button").eq(1).on("click", function () {
			winModal.style.display = "none";
		});
	}

	function solveCode ()	{
		$("#solve-guesses").text($(".prev-guess").length.toString());
		$("#solve-checks").text(thisCode.combosChecked.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$("#solve-combos").text(totalCombinations(thisCode.width, thisCode.colours));
		solveModal.style.display = "block";
		$(".close-button").eq(2).on("click", function () {
			solveModal.style.display = "none";
		});
	}
});	// end of document ready section

function Game (width, colours)	{
	this.width = width;
	this.colours = colours;
	this.createNewCombo = createNewCombo;
	this.combination = this.createNewCombo (width, colours);
	this.checkGuess = checkGuess;

	function createNewCombo (width, colours)	{
		var combination = [];
		for (var i = 0; i < width; i++) {
			combination[i] = Math.floor(Math.random() * colours);
		}
console.log(combination);
		return combination;
	}

	function checkGuess (guess)	{
		var checked = [];
		var results = [0,0];

		// Count black pegs
		for (var i = 0; i < width; i++) {
			if (guess[i] === this.combination[i])	{
				results[0]++;
				checked[i] = true;
			}
		}
		
		// Count white pegs
		var guessRemaining = [];
		var answerRemaining = [];
		for (var i = 0; i < width; i++) {
			if (!checked[i])	{
				guessRemaining.push(guess[i]);
				answerRemaining.push(this.combination[i]);
			}	
		}
		for (var i = 0; i < guessRemaining.length; i++) {
			match = answerRemaining.indexOf(guessRemaining[i]);
			if (match >= 0)	{
				results[1]++;
				delete answerRemaining[match];
			}
		}
		return results;
	}
}

function Code (width, colours)	{
	// Variables
	this.width = width;
	this.colours = colours;
	this.guesses = [];
	this.newGuess = [];
	this.sendGuess = false;
	this.combination = [];
	this.results = [];
	this.combosChecked = 0;
	var startHere = [];
	startHere.length = width;
	startHere.fill(false);
	// Functions
	this.firstGuess = firstGuess;
	this.nextGuess = nextGuess;
	this.traversePossibilities = traversePossibilities;
	this.checkResult = checkResult;
	this.evaluate = evaluate;

	function firstGuess ()	{
		for (var i = 0; i < width; i++) {
			this.newGuess.push(i % colours);
		}
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		return this.newGuess;
	}

	function nextGuess (black, white)	{
		this.results.push(new Array(black, white));
		this.sendGuess = false;
		this.traversePossibilities(width-1);
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		startHere.fill(true);
		return this.newGuess;
	}

	function traversePossibilities (i)	{
		if (i < 0 || this.sendGuess) return;
		for (var j = 0; j < colours; j++) {
			if (startHere[i]) {
				j = this.newGuess[i];
				startHere[i] = false;
			}
			this.newGuess[i] = j;
			this.traversePossibilities(i-1);
			if (this.sendGuess) return;
			this.checkResult(this.results.length-1);
			this.combosChecked++;
			if (this.sendGuess) return;
		}
	}

	function checkResult (i) {
		if (i < 0) {
			this.sendGuess = true;
			return;
		}
		var testResult = this.evaluate(this.guesses[i], this.newGuess);
		if ((testResult[0] == this.results[i][0]) && (testResult[1] == this.results[i][1])) {
			this.checkResult(i-1);
			return;
		}
		return;
	}

	function evaluate (oldGuess, currentGuess)	{
		var checked = [];
		checked.fill(false);
		var tryResults = [0,0];

		for (var i = 0; i < width; i++) {
			if (oldGuess[i] === currentGuess[i])	{
				tryResults[0]++;
				checked[i] = true;
			}
		}
		
		var guessRemaining = [];
		var answerRemaining = [];
		for (var i = 0; i < width; i++) {
			if (!checked[i])	{
				guessRemaining.push(oldGuess[i]);
				answerRemaining.push(currentGuess[i]);
			}	
		}
		for (var i = 0; i < guessRemaining.length; i++) {
			match = answerRemaining.indexOf(guessRemaining[i]);
			if (match >= 0)	{
				tryResults[1]++;
				delete answerRemaining[match];
			}
		}
		return tryResults;
	}
}