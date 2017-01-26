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
		for (var i = 0; i <= comboPegs.length; i++) {
			$(".black-peg-menu").eq(0).append("<option>" + i + "</option>");
			$(".white-peg-menu").eq(0).append("<option>" + i + "</option>");
		}
		$(".submit-results").eq(0).on("click", submitResults);
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
		var results = [0,0];
		for (var i = 0; i < width; i++) {
			checked.push(false);
		}

		for (var i = 0; i < width; i++) {
			if (guess[i] === this.combination[i])	{
				results[0]++;
				checked[i] = true;
			}
		}
		// if (results[0] = width) gameWon();
		
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
	this.guess = [];
	// this.guess.length = width;
	this.combination = [];
	this.results = [];
	this.S = [];
	this.S.length = colours;
	this.S.fill(true);
	for (var i = 1; i < width; i++) {
		var anArray = [];
		anArray.length = colours;
		anArray.fill(this.S);
		this.S = anArray;
	}
console.log(this.S);

	this.firstGuess = function ()	{
console.log("answer is " + this.combination);
		for (var i = 0; i < width; i++) {
			this.guess.push(i % colours);
		}
console.log("first guess is " + this.guess);
		return this.guess;
	}

	this.nextGuess = function (black, white)	{
		this.results.push(new Array(black, white));
console.log("results are " + this.results[0][0] + " black and " + this.results[0][1] + " white");
		return this.guess;
	}
}