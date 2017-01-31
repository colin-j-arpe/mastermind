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
	// var modalClose = $(".close-button");
	var newButton = $("#new-game-button");
	var pageBody = $("#previous-guesses");
	var footer = $("#page-footer")[0];
	var guessRow = $("#pending-guess");
	var pickRow = $("#available-colours");
	var guessButton = $("#submit-guess");
	var winModal = $("#win-game-modal")[0];
	var thisGame = new Game (0,0);

// Fill menus
	for (var i = 2; i <= 12; i++) {
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
	guessButton.on("click", submitGuess);

// Start game
	function newGame ()	{
		var guessPegs = createBlankGuess(widthMenu.val());
		var pickPegs = createColourPicker(colourMenu.val());
		$("#submit-guess")[0].style.visibility = "hidden";
		footer.style.display = "block";
		pageBody.html("");
		thisGame = new Game (guessPegs.length, pickPegs.length);

		if (stopBlinking) clearInterval(stopBlinking);
		stopBlinking = setInterval(blinker, 400);
		guessListener(pickPegs, guessPegs, stopBlinking);
		
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
			pageBody.prepend("<div class='prev-guess'></div>")
			$(".prev-guess").eq(0).append("<div class='guess-number'><h3>" + $(".prev-guess").length + "</h3></div>")
			for (var i = 0; i < thisGame.guess.length; i++) {
				$(".prev-guess").eq(0).append("<div class='peg' style='background-color: " + pegColourRGBs[thisGame.guess[i]] + "'></div>");
			}
			$(".prev-guess").eq(0).append("<div class='guess-results'></div>");
			$(".guess-results").eq(0).append("<div class='black-peg-row'></div><div class='white-peg-row'></div>");

			results = thisGame.checkGuess();
			for (var i = 0; i < results[0]; i++) {
				$(".black-peg-row").eq(0).append("<div class='result-peg black-peg'></div>");
			}
			for (var i = 0; i < results[1]; i++) {
				$(".white-peg-row").eq(0).append("<div class='result-peg white-peg'></div>");
			}

			if (results[0] === thisGame.combination.length) winGame();
			clearGuess();
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
	function guessListener (colours, guesses, stop)	{
		colours.each(function (index) {
			$(this).on("click", function() {
				recolourGuess(index);
				updateGuess(index, guesses);
			});
		});
		guesses.each(function (index) {
			$(this).on("click", function() {
				if (isNaN(thisGame.guess[thisGame.livePeg])) {
					$(".guess-peg").eq(thisGame.livePeg)[0].style.backgroundColor = "#bbbbbb";
				}	else	{
					$(".guess-peg").eq(thisGame.livePeg)[0].style.backgroundColor = pegColourRGBs[thisGame.guess[thisGame.livePeg]];
				}
				thisGame.livePeg = index;
			});
		});
	}

	function recolourGuess (colour, guessPeg)	{
		$(".guess-peg")[thisGame.livePeg].style.backgroundColor = pegColourRGBs[colour];
	}

	function updateGuess (i, guesses)	{
		thisGame.guess[thisGame.livePeg] = i;
		thisGame.livePeg = (thisGame.livePeg + 1) % guesses.length;
		if (!thisGame.guess.some(isNaN)) {
			$("#submit-guess")[0].style.visibility = "visible";
		}
	}

	function clearGuess ()	{
		$(".guess-peg").each(function () {
			$(this)[0].style.backgroundColor = "#bbbbbb";
		});
		thisGame.livePeg = 0;
		thisGame.guess.fill(NaN);
		$("#submit-guess")[0].style.visibility = "hidden";
	}

	function winGame ()	{
		closeBoard();
		var width = $(".guess-peg").length;
		var colours = $(".pick-peg").length;
		$("#win-width").append(width.toString());
		$("#win-colours").append(colours.toString());
		$("#win-combos").append(combinations(width, colours));
		$("#win-guesses").append($(".prev-guess").length.toString());
		winModal.style.display = "block";
		$(".close-button").eq(1).on("click", function () {
			winModal.style.display = "none";
		});


		function combinations (width, colours)	{
			var total = colours;
			for (var i = 0; i < width-1; i++) {
				total *= colours;
			}
			return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		function closeBoard ()	{
			clearInterval(stopBlinking);
			$(".guess-peg").each(function() {
				$(this).off("click");
			});
			$(".pick-peg").each(function() {
				$(this).off("click");
			});	
		}
	}
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

	this.checkGuess = function ()	{
		var checked = [];
		var results = [0,0];
		for (var i = 0; i < width; i++) {
			checked.push(false);
		}

		for (var i = 0; i < width; i++) {
			if (this.guess[i] === this.combination[i])	{
				results[0]++;
				checked[i] = true;
			}
		}
		
		var guessRemaining = [];
		var answerRemaining = [];
		for (var i = 0; i < width; i++) {
			if (!checked[i])	{
				guessRemaining.push(this.guess[i]);
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