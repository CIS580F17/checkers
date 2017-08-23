// checkers.js

/** The state of the game */
var state = {
  over: false,
  turn: 'b',
  board: [
    [null,'w',null,'w',null,'w',null,'w',null,'w'],
    ['w',null,'w',null,'w',null,'w',null,'w',null],
    [null,'w',null,'w',null,'w',null,'w',null,'w'],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    ['b',null,'b',null,'b',null,'b',null,'b',null],
    [null,'b',null,'b',null,'b',null,'b',null,'b'],
    ['b',null,'b',null,'b',null,'b',null,'b',null]
  ]
};
/** Holds the board div interface element */
var boardDiv = null;
/** Arrays of interface elements for keeping track */
var cellDivs = [];
var rowDivs = [];
/** The cell that is being dragged */
var draggingCellDiv = null;

/**
 * Initial page load - Use this to create the interface
 */
window.onload = function () {
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
    rowDivs.push(rowDiv);
    //Loop through all cells in each row
    for (var x = 0; x < row.length; x++) {
      var value = row[x];
      //Creates the cell interface element for each cell
      var cellDiv = document.createElement('div');
      cellDiv.className = 'CellDiv';
      rowDiv.appendChild(cellDiv);
      //Set the value of the cell div
      if (value != null) {
        cellDiv.innerText = value;
      }
      //Add draggable ability
      cellDiv.setAttribute('draggable', true);
      cellDiv.addEventListener('dragstart', cellDragStart);
      cellDiv.addEventListener('drop', cellDropEvent);
      cellDiv.addEventListener('dragover', cellAllowDragEvent);
      //Set the id to the x and y position of the cell so we can
      //modify the state board using this information
      cellDiv.id = x+','+y;
      //Add cell to cell array
      cellDivs[y].push(cellDiv);
    }
  }
};

/** @function cellDragStart
 * Handles cell start drag event.
 * @param event
 */
function cellDragStart(event) {
  draggingCellDiv = event.target;
}

/** @function cellDropEvent
 * Handles cell drop event.
 * @param event
 */
function cellDropEvent(event) {
  var droppedOnCell = event.target;

  //Swap the UI values for the cells for updating the interface
  var cellDragOldValue = draggingCellDiv.innerText;
  var cellDropOldValue = droppedOnCell.innerText;

  draggingCellDiv.innerText = cellDropOldValue;
  droppedOnCell.innerText = cellDragOldValue;

  //Replace the states held in State object
  var dragX = parseInt(draggingCellDiv.id.substr(0, draggingCellDiv.id.indexOf(',')));
  var dragY = parseInt(draggingCellDiv.id.substr(draggingCellDiv.id.indexOf(',')+1));
  var dropX = parseInt(droppedOnCell.id.substr(0, droppedOnCell.id.indexOf(',')));
  var dropY = parseInt(droppedOnCell.id.substr(droppedOnCell.id.indexOf(',')+1));

  var oldDragValue = state.board[dragY][dragX];
  var oldDropValue = state.board[dropY][dropX];

  //Set the values
  state.board[dragY][dragX] = oldDropValue;
  state.board[dropY][dropX] = oldDragValue;
}

/** @function cellAllowDragEvent
 * Allows the cell to allow drops.
 * @param event
 */
function cellAllowDragEvent(event) {
  event.preventDefault();
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
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkJump(moves, {captures:[],landings:[]}, piece, x, y);
      break;
    case 'w':  // white can only move up the board diagonally
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[]}, piece, x, y);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkSlide(moves, x-1, y+1);
      checkSlide(moves, x+1, y+1);
      checkSlide(moves, x-1, y-1);
      checkSlide(moves, x+1, y-1);
      checkJump(moves, {captures:[],landings:[]}, piece, x, y);
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
      checkLanding(moves, copyJumps(jumps), x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), x+1, y+1, x+2, y+2);
      break;
    case 'w':  // white can only move up the board diagonally
      checkLanding(moves, copyJumps(jumps), x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), x+1, y-1, x+2, y-2);
      break;
    case 'bk': // kings can move diagonally any direction
    case 'wk': // kings can move diagonally any direction
      checkLanding(moves, copyJumps(jumps), x-1, y+1, x-2, y+2);
      checkLanding(moves, copyJumps(jumps), x+1, y+1, x+2, y+2);
      checkLanding(moves, copyJumps(jumps), x-1, y-1, x-2, y-2);
      checkLanding(moves, copyJumps(jumps), x+1, y-1, x+2, y-2);
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
  if(lx < 0 || lx > 9 || ly < 0 || ly > 9) return;
  // Check landing square is unoccupied
  if(state.board[ly][lx]) return;
  // Check capture square is occuped by opponent
  if(piece == 'b' || 'bk' && state.board[cy][cx] != 'w' || state.board[cy][cx] != 'wk') return;
  if(piece == 'w' || 'wk' && state.board[cy][cx] != 'b' || state.board[cy][cx] != 'bk') return;
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
function applyMove(move) {
  // TODO: Apply the move
  // TODO: Check for victory
  // TODO: Start the next turn
}
