var gameWidth = 4;
var gameColours = 6;
var pegColourNames = ["Yellow", "Red", "Green", "Blue", "Black", "White", "Orange", "Purple", "Cyan", "Magenta","Brown", "Pink"];
var pegColourRGBs = ["#ffff00", "#ff0000", "#00ff00", "#0000ff", "#000000", "#ffffff", "#ff8800", "#cc00cc", "#00ffff", "#ff00ff", "#994400", "#ffaaaa"];

$(document).ready(function () {
// Fill menus
	var widthMenu = $("#width-menu");
	var colourMenu = $("#colour-menu");
	var instButton = $("#open-instructions");
	
	for (var i = 2; i <= 16; i++) {
		widthMenu.append("<option value='" + i + "'" + widthDefault(i) + ">" + i + "</option>");
	}

	for (var i = 2; i <= 12; i++) {
		colourMenu.append("<option value='" + i + "'" + colourDefault(i) + ">" + i + "</option>");
	}

	instButton.on("click", showInst);

	var combination = createNewCombo (gameWidth, gameColours);
	var nextGuess = [];
	for (var i = 0; i < gameWidth; i++) {
		nextGuess[i] = (-1);
	}

	for (var i = 0; i < gameWidth; i++) {
		$("#combination-row").append("<div class='combo-peg'></div>")
	}

	for (var i = 0; i < gameWidth; i++) {
		$("#current-guess").prepend("<div class='guess-div'><div class='combo-peg guess-peg'></div>" + guessMenu(gameColours) + "</div>");
	}

	for (let i = 0; i < gameWidth; i++) {
		$(".guess-menu").eq(i).on("change", function ()	{
			var colour = $(".guess-menu").eq(i).val();
			$(".guess-peg").eq(i).attr("background-color", pegColourRGBs[colour]);
			nextGuess[i] = colour;
		});
	}
});

function widthDefault (width)	{
	if (width === gameWidth) return (" selected");
	return;
}
function colourDefault (colour)	{
	if (colour === gameColours) return (" selected");
	return;
}

function showInst () {
	
}

function createNewCombo	(width, colours)	{
	var combination = [];
	for (var i = 0; i < width; i++) {
		combination[i] = Math.floor(Math.random() * colours);
	}
	return combination;
}

function guessMenu (colours)	{
	var string = "<select class='guess-menu'><option disabled>Select colour...</option>";
	for (var i = 0; i < colours; i++) {
		string += "<option value='" + i + "'>" + pegColourNames[i] + "</option>"
	}
	string += "</select>"
	return string
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
	showResult (guess, black, white);
}

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
