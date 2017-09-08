// checkers.js

readline = null;
rl = null;
if (isRunningInWebpage() === false) {
  readline = require('readline');

  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

//Check if running in the webpage or in the console
function isRunningInWebpage() {
  return !(typeof window === 'undefined');
}

/** The state of the game */
var state = {
  over: false,
  turn: 'b',
  board: [
    [null, 'w', null, 'w', null, 'w', null, 'w', null, 'w'],
    ['w', null, 'w', null, 'w', null, 'w', null, 'w', null],
    [null, 'w', null, 'w', null, 'w', null, 'w', null, 'w'],
    ['w', null, 'w', null, 'w', null, 'w', null, 'w', null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, 'b', null, 'b', null, 'b', null, 'b', null, 'b'],
    ['b', null, 'b', null, 'b', null, 'b', null, 'b', null],
    [null, 'b', null, 'b', null, 'b', null, 'b', null, 'b'],
    ['b', null, 'b', null, 'b', null, 'b', null, 'b', null]
  ]
};
/** Holds the board div interface element */
var boardDiv = null;
/** Arrays of interface elements for keeping track */
var cellDivs = []; //Matches the format of "board"
var checkerDivs = [];
/** The checker that is being dragged */
var draggingCheckerDiv = null;
var draggingCheckerX = -1;
var draggingCheckerY = -1;

/**
 * Initial page load - Use this to create the interface
 */
function createVisualUI() {
  //Create the board
  boardDiv = document.createElement('div');
  boardDiv.className = 'BoardDiv';
  document.body.appendChild(boardDiv);

  //Loop through all the horizontal rows
  for (var y = 0; y < state.board.length; y++) {
    var row = state.board[y];
    //Create a row div for each row
    var rowDiv = document.createElement('div');
    rowDiv.className = 'RowDiv';
    boardDiv.appendChild(rowDiv);
    cellDivs.push([]);
    checkerDivs.push([]);
    //Loop through all cells in each row
    for (var x = 0; x < row.length; x++) {
      (function (x, y) {
        //Creates the cell interface element for each cell
        var cellDiv = document.createElement('div');
        cellDiv.draggable = false;
        cellDiv.className = 'CellDiv';
        rowDiv.appendChild(cellDiv);

        var checkerDiv = document.createElement('div');
        checkerDiv.classList.add('Checker');
        cellDiv.appendChild(checkerDiv);


        checkerDiv.addEventListener('mousedown', function (event) {
          checkerMouseDown(event, x, y);
        });
        checkerDiv.addEventListener('mouseup', function (event) {
          checkerMouseUp(event, x, y);
        });

        //Add draggable ability
        checkerDiv.setAttribute('draggable', 'true');
        checkerDiv.addEventListener('dragstart', function (event) {
          checkerDragStart(event, x, y);
        });
        cellDiv.addEventListener('drop', function (event) {
          cellDropEvent(event, x, y);
        });
        cellDiv.addEventListener('dragover', function (event) {
          cellAllowDragEvent(event, x, y)
        });
        //Set the id to the x and y position of the cell so we can
        //modify the state board using this information
        //Add cell to cell array
        cellDivs[y].push(cellDiv);
        checkerDivs[y].push(checkerDiv);
      })(x, y);
    }
  }
}

/** @function clearHighlights
 * Clears all highligted squares
 */
function clearHighlights() {
  console.log('Clearing highlights');
  //Not a fan of using query selectors.
  var highlighted = document.querySelectorAll('.Highlight');
  highlighted.forEach(function (element) {
    element.classList.remove('Highlight');
  });
}

/**
 * Highlights the available moves of a piece.
 */
function highlightAvailableMoves(x, y) {
  console.log('Adding highlights');
  // Get legal moves
  var moves = getLegalMoves(state.board[y][x], x, y);
  // mark checker to move
  checkerDivs[y][x].classList.add('Highlight');
  // Mark squares available for moves
  moves.forEach(function (move) {
    if (move.type === 'slide') {
      cellDivs[move.y][move.x].classList.add('Highlight');
    }
  })
}

function doesPieceBelongToPlayer(x, y) {
  var piece = state.board[y][x];
  return (piece != null && piece.charAt(0) === state.turn);
}

/** @function cellDragStart
 * Handles cell start drag event.
 * @param event
 * @param x
 * @param y
 */
function checkerDragStart(event, x, y) {

  // Make sure the checker is the player's
  if (!doesPieceBelongToPlayer(x, y)) return;

  draggingCheckerDiv = event.target;
  draggingCheckerX = x;
  draggingCheckerY = y;

  clearHighlights();
  highlightAvailableMoves(x, y);
}

function checkerMouseDown(event, x, y) {
  // Make sure the checker is the player's
  if (!doesPieceBelongToPlayer(x, y)) return;
  clearHighlights();
  highlightAvailableMoves(x, y);
}

function checkerMouseUp(event, x, y) {
  clearHighlights();
}

/** @function cellDropEvent
 * Handles cell drop event.
 * @param event
 * @param xTarget
 * @param yTarget
 */
function cellDropEvent(event, xTarget, yTarget) {
  //Replace the states held in State object
  var dragX = draggingCheckerX;
  var dragY = draggingCheckerY;
  var dropX = xTarget;
  var dropY = yTarget;

  //var oldDragValue = state.board[dragY][dragX];
  //var oldDropValue = state.board[dropY][dropX];

  //Set the values
  //state.board[dragY][dragX] = oldDropValue;
  //state.board[dropY][dropX] = oldDragValue;

  //Only allow placement on a valid move
  //Get legal moves
  var moves = getLegalMoves(state.board[dragY][dragX], dragX, dragY);
  var canDrop = false;
  var chosenMove = null;
  moves.forEach(function (move, index) {
    if (move.type === 'slide') {
      if (dropX === move.x && dropY === move.y) {
        canDrop = true;
        chosenMove = move;
      }
    }
  });

  //Then initiate move
  if (canDrop) {
    applyMove(dragX, dragY, chosenMove);
    clearHighlights();
    nextTurn();
  }

  //Update the UI
  fullInterfaceRedraw();
}

/** @function cellAllowDragEvent
 * Allows the cell to allow drops.
 * @param event
 * @param x
 * @param y
 */
function cellAllowDragEvent(event, x, y) {
  //Only allow drop event if the space is free and valid.
  var overPiece = state.board[y][x];
  var holdingPiece = state.board[draggingCheckerY][draggingCheckerX];

  //Make sure the cell we're dragging over is empty
  if (overPiece != null) return;

  //Make sure the drag is a legal move
  var moves = getLegalMoves(holdingPiece, draggingCheckerX, draggingCheckerY);
  var canDrop = false;
  moves.forEach(function (move, index) {
    if (move.type === 'slide') {
      if (x === move.x && y === move.y) {
        canDrop = true;
      }
    }
  });

  if (canDrop == false) {
    return;
  }

  event.preventDefault();
}

/** @function fullInterfaceRedraw
 * Redraws the interface to match the board state.
 */
function fullInterfaceRedraw() {
  for (var y = 0; y < state.board.length; y++) {
    var row = state.board[y];
    //Loop through all cells in each row
    for (var x = 0; x < row.length; x++) {
      var value = row[x];
      if (value === null) {
        value = '';
      }
      //Clear checker
      checkerDivs[y][x].classList.remove('CheckerHidden');
      checkerDivs[y][x].classList.remove('RedChecker');
      checkerDivs[y][x].classList.remove('BlackChecker');
      if (value === '') {
        //Set the checker div to display none
        checkerDivs[y][x].classList.add('CheckerHidden');
      } else if (value === 'w') {
        checkerDivs[y][x].classList.add('RedChecker');
      } else if (value === 'b') {
        checkerDivs[y][x].classList.add('BlackChecker');
      }
    }
  }
}

/** @function getLegalMoves
 * returns a list of legal moves for the specified
 * piece to make.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings.
 * @param {integer} x - the x position of the piece on the board
 * @param {integer} y - the y position of the piece on the board
 * @returns {Array} the legal moves as an array of objects.
 */
function getLegalMoves(piece, x, y) {
  var moves = [];
  switch (piece) {
    case 'b': // black can only move down the board diagonally
      checkSlide(moves, x - 1, y - 1);
      checkSlide(moves, x + 1, y - 1);
      checkJump(moves, {captures: [], landings: []}, piece, x, y);
      break;
    case 'w':  // white can only move up the board diagonally
      checkSlide(moves, x - 1, y + 1);
      checkSlide(moves, x + 1, y + 1);
      checkJump(moves, {captures: [], landings: []}, piece, x, y);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkSlide(moves, x - 1, y + 1);
      checkSlide(moves, x + 1, y + 1);
      checkSlide(moves, x - 1, y - 1);
      checkSlide(moves, x + 1, y - 1);
      checkJump(moves, {captures: [], landings: []}, piece, x, y);
      break;
  }
  return moves;
}

/** @function checkSlide
 * A helper function to check if a slide move is legal.
 * If it is, it is added to the moves array.
 * @param {Array} moves - the list of legal moves
 * @param {integer} x - the x position of the movement
 * @param {integer} y - the y position of the movement
 */
function checkSlide(moves, x, y) {
  // Check square is on grid
  if (x < 0 || x > 9 || y < 0 || y > 9) return;
  // check square is unoccupied
  if (state.board[y][x]) return;
  // legal move!  Add it to the move list
  moves.push({type: 'slide', x: x, y: y});
}

/** @function copyJumps
 * A helper function to clone a jumps object
 * @param {Object} jumps - the jumps to clone
 * @returns The cloned jump object
 */
function copyJumps(jumps) {
  // Use Array.prototype.slice() to create a copy
  // of the landings and captures array.
  var newJumps = {
    landings: jumps.landings.slice(),
    captures: jumps.captures.slice()
  }
  return newJumps;
}

/** @function checkJump
 * A recursive helper function to determine legal jumps
 * and add them to the moves array
 * @param {Array} moves - the moves array
 * @param {Object} jumps - an object describing the
 *  prior jumps in this jump chain.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings
 * @param {integer} x - the current x position of the piece
 * @param {integer} y - the current y position of the peice
 */
function checkJump(moves, jumps, piece, x, y) {
  switch (piece) {
    case 'b': // black can only move down the board diagonally
      checkLanding(moves, copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
      checkLanding(moves, copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
      break;
    case 'w':  // white can only move up the board diagonally
      checkLanding(moves, copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
      checkLanding(moves, copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkLanding(moves, copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
      checkLanding(moves, copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
      checkLanding(moves, copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
      checkLanding(moves, copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
      break;
  }
}

/** @function checkLanding
 * A helper function to determine if a landing is legal,
 * if so, it adds the jump sequence to the moves list
 * and recursively seeks additional jump opportunities.
 * @param {Array} moves - the moves array
 * @param {Object} jumps - an object describing the
 *  prior jumps in this jump chain.
 * @param {String} piece - 'b' or 'w' for black or white pawns,
 *    'bk' or 'wk' for white or black kings
 * @param {integer} cx - the 'capture' x position the piece is jumping over
 * @param {integer} cy - the 'capture' y position of the peice is jumping over
 * @param {integer} lx - the 'landing' x position the piece is jumping onto
 * @param {integer} ly - the 'landing' y position of the peice is jumping onto
 */
function checkLanding(moves, jumps, piece, cx, cy, lx, ly) {
  // Check landing square is on grid
  if (lx < 0 || lx > 9 || ly < 0 || ly > 9) return;
  // Check landing square is unoccupied
  if (state.board[ly][lx]) return;
  // Check capture square is occuped by opponent
  if ((piece === 'b' || piece === 'bk') && !(state.board[cy][cx] === 'w' || state.board[cy][cx] === 'wk')) return;
  if ((piece === 'w' || piece === 'wk') && !(state.board[cy][cx] === 'b' || state.board[cy][cx] === 'bk')) return;
  // legal jump! add it to the moves list
  jumps.captures.push({x: cx, y: cy});
  jumps.landings.push({x: lx, y: ly});
  moves.push({
    type: 'jump',
    captures: jumps.captures.slice(),
    landings: jumps.landings.slice()
  });
  // check for further jump opportunities
  checkJump(moves, jumps, piece, lx, ly);
}

/** @function ApplyMove
 * A function to apply the selected move to the game
 * @param {object} move - the move to apply.
 */
function applyMove(x, y, move) {
  // TODO: Apply the move
  if (move.type === "slide") {
    state.board[move.y][move.x] = state.board[y][x];
    state.board[y][x] = null;
  } else {
    move.captures.forEach(function (square) {
      state.board[square.y][square.x] = null;
    });
    var index = move.landings.length - 1;
    state.board[move.landings[index].y][move.landings[index].x] = state.board[y][x];
    state.board[y][x] = null;
  }
}

/** @function checkForVictory
 * Checks to see if a victory has been actived
 * (All peices of one color have been captured)
 * @return {String} one of three values:
 * "White wins", "Black wins", or null, if neither
 * has yet won.
 */
function checkForVictory() {
  var wCount = 0;
  var bCount = 0;
  for (y = 0; y < 10; y++) {
    for (x = 0; x < 10; x++) {
      if (state.board[y][x] === "w" || state.board[y][x] === "wk") {
        wCount++;
      }
      if (state.board[y][x] === "b" || state.board[y][x] === "bk") {
        bCount++;
      }
    }
  }
  if (wCount == 0) {
    state.over = true;
    return 'black wins';
  }
  if (bCount == 0) {
    state.over = true;
    return 'white wins';
  }
  return null;
}

/** @function nextTurn()
 * Starts the next turn by changing the
 * turn property of state.
 */
function nextTurn() {
  if (state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

/** @function printBoard
 * Prints the current state of the game board
 * to the console.
 */
function printBoard() {
  console.log("   a b c d e f g h i j");
  state.board.forEach(function (row, index) {
    var ascii = row.map(function (square) {
      if (!square) return '_';
      else return square;
    }).join('|');
    console.log(index, ascii);
  });
  console.log('\n');
}

/** @function getJumpString
 * Helper function to get the results of a jump move
 * as a printable string.
 * @return {String} A string describing the jump sequence
 */
function getJumpString(move) {
  var jumps = move.landings.map(function (landing) {
    return String.fromCharCode(97 + landing.x) + "," + landing.y;
  }).join(' to ');
  return "jump to " + jumps + " capturing " + move.captures.length + " piece" + ((move.captures.length > 1) ? 's' : '');
}

function startNextGameLoop() {
  setTimeout(function () {
    consoleGameDecisionLoop();
  }, 0);
}

function consoleGameDecisionLoop() {
  // print the board
  printBoard();
  // offer instructions
  console.log(state.turn + "'s turn");
  rl.question("Pick a piece to move, (letter, number): ", function (answer) {
    // Figure out what piece the user asked to move
    var match = /([a-j]),?\s?([0-9])/.exec(answer);
    if (match && match.length > 1) {
      var x = match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
      var y = parseInt(match[2]);
      if (y < 0 || y > state.board.length - 1) {
        console.log('Invalid Piece');
        startNextGameLoop();
        return;
      }
      var piece = state.board[y][x];
      // Get available moves
      var moves = getLegalMoves(piece, x, y);
      if (moves.length === 0) {
        console.log("\nNo legal moves for ", piece, "at", x, ",", y);
        startNextGameLoop();
        return;
      } else {
        // Print available moves
        console.log("\nAvailable moves for ", match[1] + "," + match[2]);
        console.log("C. Cancel");
        moves.forEach(function (move, index) {
          if (move.type === 'slide') {
            console.log(index + ". You can slide to " + String.fromCharCode(97 + move.x) + "," + move.y);
          } else {
            console.log(index + ". You can " + getJumpString(move));
          }
        });
        //Prompt the user to pick a move
        rl.question("Pick your move from the list: ", function (answer) {
          if (answer.substring(0, 1).toLowerCase() === 'c') {
            startNextGameLoop();
            return;
          } else {
            var command = parseInt(answer);
            if (!isNaN(command) && command >= 0 && command < moves.length) {
              applyMove(x, y, moves[command]);
              var victory = checkForVictory();
              if (victory != null) {
                //Someone won
                console.log(victory);
              } else {
                nextTurn();

                startNextGameLoop();
                return;
              }
            } else {
              //Invalid move
              console.log('Invalid Input');

              startNextGameLoop();
              return;
            }
          }
        });
      }
    } else {
      //No match, restart game loop
      console.log('Invalid Piece');
      startNextGameLoop();
      return;
    }
  });
}

/** @function main
 * Entry point to the program.
 * Starts the checkers game.
 */
function main() {
  if (isRunningInWebpage()) {
    createVisualUI();
    fullInterfaceRedraw();
  } else {
    startNextGameLoop();
  }
}

if (isRunningInWebpage()) {
  window.onload = function () {
    main();
  };
} else {
  main();
}