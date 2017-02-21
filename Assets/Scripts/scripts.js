// Use these defaults to adjust app
var defaultWidth = 4;
var defaultColours = 6;
var maxWidth = 16;
var pegColourNames = ["Yellow", "Red", 		"Green", 	"Blue",	 "Black", 	"White", 	"Orange", "Purple", 	"Cyan", "Magenta",	"Brown", 	"Pink"];
var pegColourRGBs = ["#ffff00", "#dd0000", "#00ff00", "#0000ff", "#000000", "#ffffff", "#ff9911", "#660066", "#00ffff", "#ee11ee", "#994400", "#ffaaaa"];
var consoleLogCombo = true;

// Global variables
var thisGame;
var thisCode;
var game = true;
var comboPegs = [];
var pickPegs = [];
var livePeg = 0;
var stopBlinking;
var currentCombo = [];

function widthDefault (width)	{
	if (width === defaultWidth) return (" selected");
	return;
}
function colourDefault (colour)	{
	if (colour === defaultColours) return (" selected");
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
	var introModal =	$("#site-use-modal")[0];
	var introButton =	$("#show-instructions");
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
	for (var i = 2; i <= maxWidth; i++) {
		widthMenu.append("<option value='" + i + "'" + widthDefault(i) + ">" + i + "</option>");	// Line 19
	}
	for (var i = 2; i <= pegColourRGBs.length; i++) {
		colourMenu.append("<option value='" + i + "'" + colourDefault(i) + ">" + i + "</option>");	// Line 23
	}

// Buttons
	introButton.on("click", function () {
		instModal.style.display = "block";
	});
	$(".close-button").eq(0).on("click", function () {
		introModal.style.display = "none";
	});
	instButton.on("click", function () {
		instModal.style.display = "block";
	});
	$(".close-button").eq(1).on("click", function () {
		instModal.style.display = "none";
	});

	newButton.on("click", newGame);			// Line 84
	codeButton.on("click", newCode);		// Line 91
	guessButton.on("click", submitGuess);	// Line 201
	enterButton.on("click", submitCode);	// Line 262

// Begin new game or code break
	function newGame ()	{
		game = true;
		thisGame = new Game (widthMenu.val(), colourMenu.val());	// Line 302
		thisGame.createNewCombo();									// Line 311
		resetPage (thisGame.width, thisGame.colours);				// Line 98
	}

	function newCode ()	{
		game = false;
		thisCode = new Code (widthMenu.val(), colourMenu.val());	// Line 348
		resetPage (thisCode.width, thisCode.colours);				// Line 98
	}

// Clear page and reset controls and DOM listeners
	function resetPage (width, colours)	{
		introModal.style.display = "none";
		instModal.style.display = "none";
		winModal.style.display = "none";
		solveModal.style.display = "none";
		pageBody.html("");
		comboMessage.text(totalCombinations(width, colours) + " possible combinations");	// Line 28
		comboPegs = createBlankGuess(width);												// Line 118
		pickPegs = createColourPicker(colours);												// Line 126
		guessButton[0].style.visibility = "hidden";
		enterButton[0].style.visibility = "hidden";
		guessButton.removeAttr("disabled");
		enterButton.removeAttr("disabled");
		footer.style.display = "block";
		currentCombo.length = width;
		currentCombo.fill(NaN);
		livePeg = 0;
		pickListener(width);																// Line 135
	}

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

// Live functionality in footer
	function pickListener (width)	{
		if (stopBlinking) clearInterval(stopBlinking);
		stopBlinking = setInterval(blinker, 400);		// Line 159
		pickPegs.each(function (index) {
			$(this).on("click", function() {
				recolourPeg(index);						// Line 172
				updateCombo(width, index);				// Line 184
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
			$(this).on("dblclick", function()	{
				uncolourPeg (index);					// Line 176
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

	function uncolourPeg (clickedPeg)	{
		livePeg = clickedPeg;
		$(".combo-peg").eq(livePeg)[0].style.backgroundColor = "#bbbbbb";
		currentCombo[livePeg] = NaN;
		guessButton[0].style.visibility = "hidden";
		enterButton[0].style.visibility = "hidden";
	}

	function updateCombo (width, colour)	{
		currentCombo[livePeg] = colour;
		if (!currentCombo.some(isNaN)) {
			if (game) {
				guessButton[0].style.visibility = "visible";
			}	else	{
				enterButton[0].style.visibility = "visible";
			}
			livePeg = (livePeg + 1) % width;
		}	else	{
			while (!isNaN(currentCombo[livePeg]))	{
				livePeg = (livePeg + 1) % width;
			}
		}
	}

// Submit guess, show result
	function submitGuess () {
		newGuessRow();												// Line 217
		$(".guess-results").eq(0).append("<div class='black-peg-row'></div><div class='white-peg-row'></div>");

		results = thisGame.checkGuess(currentCombo);				// Line 318
		for (var i = 0; i < results[0]; i++) {
			$(".black-peg-row").eq(0).append("<div class='result-peg black-peg'></div>");
		}
		for (var i = 0; i < results[1]; i++) {
			$(".white-peg-row").eq(0).append("<div class='result-peg white-peg'></div>");
		}

		if (results[0] === thisGame.combination.length) winGame();	// Line 235
		clearGuess();												// Line 226
	}

	function newGuessRow ()	{
		pageBody.prepend("<div class='prev-guess'></div>")
		$(".prev-guess").eq(0).append("<div class='guess-number'><h3>" + $(".prev-guess").length + "</h3></div>")
		for (var i = 0; i < currentCombo.length; i++) {
			$(".prev-guess").eq(0).append("<div class='peg' style='background-color: " + pegColourRGBs[currentCombo[i]] + "'></div>");
		}
		$(".prev-guess").eq(0).append("<div class='guess-results'></div>");
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
		closeBoard();																	// Line 248
		$("#win-width").text(thisGame.width.toString());
		$("#win-colours").text(thisGame.colours.toString());
		$("#win-combos").text(totalCombinations(thisGame.width, thisGame.colours));		// Line 28
		$("#win-guesses").text($(".prev-guess").length.toString());
		winModal.style.display = "block";
		$(".close-button").eq(2).on("click", function () {
			winModal.style.display = "none";
		});
	}

// Shut down inputs at end of game or start of code break
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

// Submit code for algorithm to guess, then repeat until solved
	function submitCode ()	{
		closeBoard();							// Line 248
		thisCode.combination = currentCombo;
		currentCombo = thisCode.firstGuess();	// Line 375
		results = [];
		showNextResult();						// Line 270
	}

	function showNextResult()	{
		newGuessRow();														// Line 217
		$(".guess-results").eq(0).append("<div class='black-peg-row'></div><div class='white-peg-row'></div>");
		results = thisCode.evaluate(currentCombo, thisCode.combination);	// Line 464

		for (var i = 0; i < results[0]; i++) {
			$(".black-peg-row").eq(0).append("<div class='result-peg black-peg'></div>");
		}
		for (var i = 0; i < results[1]; i++) {
			$(".white-peg-row").eq(0).append("<div class='result-peg white-peg'></div>");
		}
		if (results[0] == thisCode.width)	{
			solveCode();													// Line 290
			return;
		}	else	{
			currentCombo = thisCode.nextGuess(results[0], results[1]);		// Line 389
			showNextResult();												// Line 270 (recursive)
		}
	}

	function solveCode ()	{
		$("#solve-guesses").text($(".prev-guess").length.toString());
		$("#solve-checks").text(thisCode.combosChecked.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$("#solve-combos").text(totalCombinations(thisCode.width, thisCode.colours));					// Line 28
		solveModal.style.display = "block";
		$(".close-button").eq(3).on("click", function () {
			solveModal.style.display = "none";
		});
	}

});	// end of document ready section

function Game (width, colours)	{
// Variables
	this.width = width;
	this.colours = colours;
	this.combination = [];
// Functions
	this.createNewCombo = createNewCombo;	// Line 311
	this.checkGuess = checkGuess;			// Line 318

	function createNewCombo ()	{
		for (var i = 0; i < width; i++) {
			this.combination[i] = Math.floor(Math.random() * colours);
		}
		if (consoleLogCombo) console.log(this.combination);
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
	var skipColour = [];
	for (var i = 0; i < width; i++) {
		skipColour[i] = [];
		for (var j = 0; j < colours; j++) {
			skipColour[i][j] = false
		}
	}
// Functions
	this.firstGuess = firstGuess;							// Line 375
	this.nextGuess = nextGuess;								// Line 389
	this.traversePossibilities = traversePossibilities;		// Line 430
	this.checkResult = checkResult;							// Line 448
	this.evaluate = evaluate;								// Line 464

	function firstGuess ()	{
		for (var i = 0; i < width; i = i + 2) {
			this.newGuess.push((colours - 1) - ((i / 2) % colours));
			if (i + 1 < width) {
				this.newGuess.push((colours - 1) - ((i / 2) % colours));
			}
		}
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		return this.newGuess;
	}

	function nextGuess (black, white)	{
	// Fill skipColour array to save future guess checks
		self = this;
		if (black == 0 && white == 0) noPegs();				// Line 406
		if (black == 0 && white > 0) whitePegsOnly();		// Line 413
		if (black + white == width)	fullWidth();			// Line 418
		
		this.results.push(new Array(black, white));
		this.sendGuess = false
		this.traversePossibilities(width-1);				// Line 430
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		startHere.fill(true);
		return this.newGuess;

		function noPegs	()	{
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < width; j++) {
					skipColour[j][self.newGuess[i]] = true;
				}
			}
		}
		function whitePegsOnly ()	{
			for (var i = 0; i < width; i++) {
				skipColour[i][self.newGuess[i]] = true;
			}
		}
		function fullWidth ()	{
			for (var i = 0; i < colours; i++) {
				if (self.newGuess.indexOf(i) < 0) {
					for (var j = 0; j < width; j++) {
						skipColour[j][i] = true;
					}
				}
			}
		}
	}

// Recursively traverse dynamically multidimensional array to check every possible combination
	function traversePossibilities (i)	{
		if (i < 0 || this.sendGuess) return;
		for (var j = 0; j < colours; j++) {
			if (startHere[i]) {
				j = this.newGuess[i];
				startHere[i] = false;
				this.traversePossibilities(i-1);		// Line 430 (recursive)
			}
			if (skipColour[i][j]) continue;
			this.newGuess[i] = j;
			this.traversePossibilities(i-1);			// Line 430 (recursive)
			if (this.sendGuess) return;
			this.checkResult(this.results.length-1);	// Line 448
			if (this.sendGuess) return;
		}
	}

// Check current possibility against each past result
	function checkResult (i) {
		if (i < 0) {
// console.log(this.newGuess + " looks good");
			this.sendGuess = true;
			return;
		}
		var testResult = this.evaluate(this.guesses[i], this.newGuess);						// Line 464
		this.combosChecked++;
		if ((testResult[0] == this.results[i][0]) && (testResult[1] == this.results[i][1])) {
			this.checkResult(i-1);															// Line 448 (recursive)
			return;
		}
		return;
	}

// Compare current possibility with a previous guess result
	function evaluate (oldGuess, currentGuess)	{
		var checked = [];
		var tryResults = [0,0];
	// Count black pegs
		for (var i = 0; i < width; i++) {
			if (oldGuess[i] === currentGuess[i])	{
				tryResults[0]++;
				checked[i] = true;
			}
		}
	// Count white pegs
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
// console.log("returning " + tryResults + " for " + currentGuess);
		return tryResults;
	}
}