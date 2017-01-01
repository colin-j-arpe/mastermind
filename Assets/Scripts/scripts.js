var gameWidth = 4;
var gameColours = 6;
var pegColours = ["#ffff00", "#ff0000", "#00ff00", "#0000ff", "#000000", "#ffffff", "#ff8800", "#cc00cc", "#994400", "#ffaaaa"];

$(document).ready(function () {
	var combination = createNewCombo (gameWidth, gameColours);

	for (var i = 0; i < gameWidth; i++) {
		$("#combination-row")
	}


	for (var i = 0; i < gameWidth; i++) {
		$("#current-guess").append("<div class='guess-peg'><div class='combo-peg'></div><select>" + guessMenu(gameColours) + "</select></div>");
	}
});

function createNewCombo	(width, colours)	{
	var combination = [];
	for (var i = 0; i < width; i++) {
		combination[i] = Math.floor(Math.random() * colours);
	}
	return combination;
}

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
}