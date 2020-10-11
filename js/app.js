'use strict';

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/cuteMonster.gif"/>';
const BALL_IMG = '<img src="img/ball.png"/>';
const GLUE_IMG = '<img src="img/candy.png"/>';
const STUCK_IMG = '<img src="img/stuck.gif"/>';

var gGamerPos = {};
var gBoard = [];
var gBallCounter = 0;
var gGameInterval;
var gGlueInterval;
var gMove = true;

function init() {
	if (gGlueInterval) clearInterval(gGlueInterval);
	if (gGameInterval) clearInterval(gGameInterval);
	hideModal();
	gGamerPos = { i: 1, j: 1 };
	gBoard = buildBoard();
	gBallCounter = 0;
	renderBoard(gBoard);
	createBall(gBoard);
	gGameInterval = setInterval(function () { createBall(gBoard); }, 2000);
	gGlueInterval = setInterval(function () { createGlue(gBoard); }, 5000);
}

function buildBoard() {
	var board = [];
	for (var i = 0; i < 10; i++) {
		board[i] = [];
		for (var j = 0; j < 12; j++) {
			board[i][j] = {
				gameElement: null
			};
			if (i === 0 && j !== 6 || i === 9 && j !== 6 || j === 0 && i !== 5 || j === 11 && i !== 5) {
				board[i][j].type = WALL;
			} else {
				board[i][j].type = FLOOR;
			}
			//{type: FLOOR | WALL, gameElement:GAMER | NULL}
		}
	}

	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var elBoard = document.querySelector('.board');
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j });

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			// strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';
			strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i}, ${j})" >\n`;

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to ake sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	// console.log('iAbsDiff', iAbsDiff)
	var jAbsDiff = Math.abs(j - gGamerPos.j);
	// console.log('jAbsDiff', jAbsDiff)

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
		(iAbsDiff === 9 && jAbsDiff === 0) || (jAbsDiff === 11 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			gBallCounter++;
		}

		if (targetCell.gameElement === GLUE) {
			console.log('Stuck!');
			gMove = false;
			// renderCell({ i: i, j: j }, STUCK_IMG);
			setTimeout(function () { gMove = true; }, 5000);
		}

		// Update MODEL
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Update DOM
		renderCell(gGamerPos, '');

		// Update MODEL
		gGamerPos = { i: i, j: j };
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// Update DOM
		renderCell(gGamerPos, GAMER_IMG);


	} //else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location);
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(ev) {
	if (!gMove) return;
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (ev.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(i, 11);
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === 11) moveTo(i, 0);
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(9, j);
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === 9) moveTo(0, j);
			else moveTo(i + 1, j);
			break;

	}
	renderCounter();
	checkVictory();
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function createBall(board) {
	var emptyCells = getEmptyCells(board);
	if (!emptyCells[0]) return;
	var randNum = getRandomIntInclusive(0, emptyCells.length - 1);
	var randCell = emptyCells[randNum];
	board[randCell.i][randCell.j].gameElement = BALL;
	renderCell({ i: randCell.i, j: randCell.j }, BALL_IMG);

}

function createGlue(board) {
	var emptyCells = getEmptyCells(board);
	if (!emptyCells[0]) return;
	var randNum = getRandomIntInclusive(0, emptyCells.length - 1);
	var randCell = emptyCells[randNum];
	board[randCell.i][randCell.j].gameElement = GLUE;
	renderCell({ i: randCell.i, j: randCell.j }, GLUE_IMG);

}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function renderCounter() {
	var elCounter = document.querySelector('.Collector');
	elCounter.innerText = `Ball Counter: ${gBallCounter}`;
}

function getEmptyCells(board) {
	var emptyCells = [];
	for (var i = 0; i < board.length; i++) {
		var row = board[i];
		for (var j = 0; j < board[0].length; j++) {
			var currCell = row[j];
			var coord = { i, j };
			if (currCell.type === FLOOR && !currCell.gameElement) {
				emptyCells.push(coord);
			}
		}
	}
	return emptyCells;
}

function checkVictory() {
	for (var i = 0; i < gBoard.length; i++) {
		var row = gBoard[i];
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = row[j];
			if (cell.gameElement === BALL) return;
		}
	}

	var elModal = document.querySelector('.modal');
	elModal.classList.add('show');
	clearInterval(gGameInterval);
	clearInterval(gGlueInterval);
}

function hideModal() {
	var elModal = document.querySelector('.modal');
	elModal.classList.remove('show');
}
