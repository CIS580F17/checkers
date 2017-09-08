// checkers.js

/* Require statements */
const readline = require('readline');

// initialize readline as a global variable
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/** The state of the game */
var state = {
  over: false,
  turn: 'b',
  board: [
    [null,'w',null, 'w', null, 'w',  null, 'w',  null, 'w'],
    ['w',null,'w',null,'w',null,'w',null,'w',null],
    [null,'w',null,'w',null,'w',null,'w',null,'w'],
    ['w',null,'w',null,'w',null,'w',null,'w',null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null,'b',null,'b',null,'b',null,'b',null,'b'],
    ['b',null,'b',null,'b',null,'b',null,'b',null],
    [null,'b',null,'b',null,'b',null,'b',null,'b'],
    ['b',null,'b',null,'b',null,'b',null,'b',null]
  ],
  captures: {w: 0, b: 0}
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
  switch(piece) {
    case 'b': // black can only move down the board diagonally
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
      break;
    case 'w':  // white can only move up the board diagonally
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[], x:x, y:y}, piece, x, y);
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
  if(x < 0 || x > 9 || y < 0 || y > 9) return;
  // check square is unoccupied
  if(state.board[y][x]) return;
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
    x: jumps.x,
    y: jumps.y,
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
  switch(piece) {
    case 'b': // black can only move down the board diagonally
      checkLanding(moves, copyJumps(jumps), piece, x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y-1, x+2, y-2);
      break;
    case 'w':  // white can only move up the board diagonally
      checkLanding(moves, copyJumps(jumps), piece, x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y+1, x+2, y+2);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkLanding(moves, copyJumps(jumps), piece, x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y+1, x+2, y+2);
      checkLanding(moves, copyJumps(jumps), piece, x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), piece, x+1, y-1, x+2, y-2);
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
  // Check that we're not jumping back to our starting position
  if(lx == jumps.x && ly == jumps.y) return;
  // Check landing square is on grid
  if(lx < 0 || lx > 9 || ly < 0 || ly > 9) return;
  // Check landing square is unoccupied
  if(state.board[ly][lx]) return;
  // Check capture square is occupied by opponent
  if(state.turn === 'b' && !(state.board[cy][cx] === 'w' || state.board[cy][cx] === 'wk')) return;
  if(state.turn === 'w' && !(state.board[cy][cx] === 'b' || state.board[cy][cx] === 'bk')) return;
  // Check that we haven't landed on this square previously
  if(0 < jumps.landings.indexOf(function(landing){return landing.x == lx && landing.y == ly;})) return;
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
  if(move.type === "slide") {
    state.board[move.y][move.x] = state.board[y][x];
    state.board[y][x] = null;
  } else {
    move.captures.forEach(function(square){
      var piece = state.board[square.y][square.x];
      state.captures[piece.substring(0,1)]++;
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
  if(state.captures.w == 20) {
    state.over = true;
    return 'black wins';
  }
  if(state.captures.b == 20) {
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
  if(state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

/** @function checkForVictory
  * Checks to see if a victory has been actived
  * (All peices of one color have been captured)
  * @return {String} one of three values:
  * "White wins", "Black wins", or null, if neither
  * has yet won.
  */
function checkForVictory() {
  if(state.captures.w == 20) {
    state.over = true;
    return 'black wins';
  }
  if(state.captures.b == 20) {
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
  if(state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

/** @function printBoard
  * Prints the current state of the game board
  * to the console.
  */
function printBoard() {
  console.log()
  console.log("   a b c d e f g h i j");
  state.board.forEach(function(row, index){
    var ascii = row.map(function(square){
      if(!square) return '_';
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
  var jumps = move.landings.map(function(landing) {
    return String.fromCharCode(97 + landing.x) + "," + landing.y;
  }).join(' to ');
  return "jump to " + jumps + " capturing " + move.captures.length + " piece" + ((move.captures.length > 1)?'s':'');
}

/** @function processTurn
  * Process a single player's turn, prompting them
  * to make a move, check for victory conditions,
  * and change turns.
  */
function processTurn() {
  // print the board
  printBoard();
  // offer instructions
  console.log(state.turn + "'s turn");
  rl.question("Pick a piece to move, (letter, number): ", function(answer) {
    // Figure out what piece the user asked to move
    var match = /([a-j]),?\s?([0-9])/.exec(answer);
    if(match) {
      var x = match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
      var y = parseInt(match[2]);
      var piece = state.board[y][x];
      // Get available moves
      var moves = getLegalMoves(piece, x, y);
      if(moves.length === 0) {
        console.log("\nNo legal moves for ", piece, "at", x, ",", y);
        return processTurn();
      }
      // Print available moves
      console.log("\nAvailable moves for ", match[1] + "," + match[2]);
      console.log("C. Cancel")
      moves.forEach(function(move, index) {
        if(move.type === 'slide') {
          console.log(index + ". You can slide to " + String.fromCharCode(97 + move.x) + "," + move.y);
        } else {
          console.log(index + ". You can " + getJumpString(move));
        }
      })
      // Prompt the user to pick a move
      rl.question("Pick your move from the list:", function(answer) {
        if(answer.substring(0,1) === 'c') return processTurn();
        var command = parseInt(answer);
        if(isNaN(command) || command >= moves.length) return processTurn();
        applyMove(x,y,moves[command]);
        // Check for game end conditions
        var result = checkForVictory();
        if(result) {
          console.log(result);
          return;
        }
        // Trigger next turn
        nextTurn();
        return processTurn();
      });
    }
  });
}

/** @function main
  * Entry point to the program.
  * Starts the checkers game.
  */
function main() {
  // Start the game with the first player's turn.
  processTurn();
}

main();
