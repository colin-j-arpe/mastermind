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
	var widthMenu = $("#width-menu");
	var colourMenu = $("#colour-menu");
	var instModal = $("#instruc-modal")[0];
	var instButton = $("#open-instructions");
	var newButton = $("#new-game-button");
	var codeButton = $("#enter-code-button");
	var pageBody = $("#previous-guesses");
	var footer = $("#page-footer")[0];
	var comboRow = $("#current-combo");
	var pickRow = $("#available-colours");
	var guessButton = $("#submit-guess");
	var enterButton = $("#submit-code");
	// var resultsButton = $("#submit-results");
	var winModal = $("#win-game-modal")[0];

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
		resetPage ();
	}

// Begin new code break
	function newCode ()	{
		game = false;
		thisCode = new Code (widthMenu.val(), colourMenu.val());
		resetPage ();
	}

	function resetPage ()	{
		pageBody.html("");
		comboPegs = createBlankGuess(widthMenu.val());
		pickPegs = createColourPicker(colourMenu.val());
		$("#submit-guess")[0].style.visibility = "hidden";
		$("#submit-code")[0].style.visibility = "hidden";
		$("#submit-guess").removeAttr("disabled");
		$("#submit-code").removeAttr("disabled");
		footer.style.display = "block";
		currentCombo.length = widthMenu.val();
		currentCombo.fill(NaN);
		livePeg = 0;
		pickListener();
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
		$("#submit-guess").attr("disabled", true);
		$("#submit-code").attr("disabled", true);
	}

// Live functionality in footer
	function pickListener ()	{
		if (stopBlinking) clearInterval(stopBlinking);
		stopBlinking = setInterval(blinker, 400);
		pickPegs.each(function (index) {
			$(this).on("click", function() {
				recolourPeg(index);
				updateCombo(index);
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

	function updateCombo (colour)	{
		currentCombo[livePeg] = colour;
		livePeg = (livePeg + 1) % comboPegs.length;
		if (!currentCombo.some(isNaN)) {
			if (game) {
				$("#submit-guess")[0].style.visibility = "visible";
			}	else	{
				$("#submit-code")[0].style.visibility = "visible";
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

	function submitCode ()	{
		closeBoard();
		thisCode.combination = currentCombo;
		currentCombo = thisCode.firstGuess();
		resultRow();
	}

	function submitResults ()	{
		$(".submit-results").eq(0).attr("disabled", true);
		currentCombo = thisCode.nextGuess($(".black-peg-menu").eq(0).val(), $(".white-peg-menu").eq(0).val());
		resultRow();
	}

	function resultRow ()	{
		newGuessRow();
		$(".guess-results").eq(0).append("Black pegs (exact matches): <select class='black-peg-menu'></select>  White pegs (right colour, wrong place): <select class='white-peg-menu'></select> <button class='submit-results'>Submit Results</button>");
		defaultResults = thisCode.evaluate(currentCombo, thisCode.combination);
		for (var i = 0; i <= comboPegs.length; i++) {
			$(".black-peg-menu").eq(0).append("<option" + blackDefault(i) + ">" + i + "</option>");
			$(".white-peg-menu").eq(0).append("<option" + whiteDefault(i) + ">" + i + "</option>");
		}
		$(".submit-results").eq(0).on("click", submitResults);

		function blackDefault (num)	{
			if (defaultResults[0] === num) return (" selected");
		}
		function whiteDefault (num)	{
			if (defaultResults[1] === num) return (" selected");
		}
	}

	function newGuessRow ()	{
		pageBody.prepend("<div class='prev-guess'></div>")
		$(".prev-guess").eq(0).append("<div class='guess-number'><h3>" + $(".prev-guess").length + "</h3></div>")
		for (var i = 0; i < currentCombo.length; i++) {
			$(".prev-guess").eq(0).append("<div class='peg' style='background-color: " + pegColourRGBs[currentCombo[i]] + "'></div>");
		}
		$(".prev-guess").eq(0).append("<div class='guess-results'></div>");
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
		$("#submit-guess")[0].style.visibility = "hidden";
	}

	function winGame ()	{
		closeBoard();
		var width = $(".combo-peg").length;
		var colours = $(".pick-peg").length;
		$("#win-width").text(width.toString());
		$("#win-colours").text(colours.toString());
		$("#win-combos").text(totalCombinations(width, colours));
		$("#win-guesses").text($(".prev-guess").length.toString());
		winModal.style.display = "block";
		$(".close-button").eq(1).on("click", function () {
			winModal.style.display = "none";
		});


	}
});	// end of document ready section

function Game (width, colours)	{
	this.createNewCombo = function (width, colours)	{
		var combination = [];
		for (var i = 0; i < width; i++) {
			combination[i] = Math.floor(Math.random() * colours);
		}
console.log(combination);
		return combination;
	}
	this.combination = this.createNewCombo (width, colours);

	this.checkGuess = function (guess)	{
		var checked = [];
		checked.fill(false);
		var results = [0,0];
		// for (var i = 0; i < width; i++) {
		// 	checked.push(false);
		// }

		for (var i = 0; i < width; i++) {
			if (guess[i] === this.combination[i])	{
				results[0]++;
				checked[i] = true;
			}
		}
		
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
console.log(width + ", " +	 colours);
	this.guesses = [];
	this.newGuess = [];
	this.sendGuess = false;
	// this.guess.length = width;
	this.combination = [];
	this.results = [];
	this.S = [];
	// this.S.length = colours;
	// this.S.fill(true);
	// for (var i = 1; i < width; i++) {
	// 	var anArray = [];
	// 	anArray.length = colours;
	// 	anArray.fill(this.S);
	// 	this.S = anArray;
	// }
	var startHere = [];
	startHere.length = width;
	startHere.fill(false);

	this.firstGuess = function ()	{
console.log("answer is " + this.combination);
		for (var i = 0; i < width; i++) {
			this.newGuess.push(i % colours);
		}
console.log("first guess is " + this.newGuess);
		// this.guesses.push(this.newGuess);
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		return this.newGuess;
	}

	this.nextGuess = function (black, white)	{
console.log("thisguess is " + this.guesses[this.guesses.length-1] + ", newguess is " + this.newGuess);
		this.results.push(new Array(black, white));
		this.sendGuess = false;
		this.traversePossibilities(width-1);
		this.guesses.push(new Array);
		for (var i = 0; i < width; i++) {
			this.guesses[this.guesses.length-1][i] = this.newGuess[i]
		}
		startHere.fill(true);
console.log("now returning guess of " + this.newGuess);
		return this.newGuess;
	}

	this.traversePossibilities = function (i)	{
if (this.sendGuess) console.log("returning from level " + i);
		if (i < 0 || this.sendGuess) return;
		for (var j = 0; j < colours; j++) {
			if (startHere[i]) {
				j = this.newGuess[i];
				startHere[i] = false;
			}
			this.newGuess[i] = j;
console.log("newguess is now " + this.newGuess);
			this.traversePossibilities(i-1);
if (this.sendGuess) console.log("returning from level " + i);
			if (this.sendGuess) return;
			// testResult = this.evaluate();
			this.checkResult(this.results.length-1);
			if (this.sendGuess) return;
// console.log("sendguess is " + this.sendGuess);
			// for (var k = 0; k < this.results.length; k++) {
			// 	if (testResult[0] == this.results[k][0] && testResult[1] == this.results[k][1]) {
			// 		this.sendGuess = true;
			// 		return;
			// 	}
			// }
		}
	}

	this.checkResult = function (i) {
console.log("check level " + i);
		if (i < 0) {
			this.sendGuess = true;
// console.log("nailed it");
			return;
		}
		var testResult = this.evaluate(this.guesses[i], this.newGuess);
console.log("testing " + testResult + " against " + this.results[i]);
// if (test[0] == past[i][0]) {console.log("true")} else {console.log("false")};
// if (test[1] == past[i][1]) {console.log("true")} else {console.log("false")};
		if ((testResult[0] == this.results[i][0]) && (testResult[1] == this.results[i][1])) {
// console.log("yup");
			this.checkResult(i-1);
			return;
		}
		return;
	}

	this.evaluate = function (oldGuess, currentGuess)	{
console.log("evaluating " + oldGuess + " against " + currentGuess);
		var checked = [];
		checked.fill(false);
		var tryResults = [0,0];
		// for (var i = 0; i < width; i++) {
		// 	checked.push(false);
		// }

		for (var i = 0; i < width; i++) {
			if (oldGuess[i] === currentGuess[i])	{
				tryResults[0]++;
				checked[i] = true;
			}
		}
		
// console.log(tryResults[0] + " black pegs");
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
// console.log(tryResults[1] + " white pegs");
		return tryResults;
	}
}