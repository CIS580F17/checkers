class HTMLBoard {
  constructor() {
    /** Holds the board div interface element */
    this.boardDiv = null;

    /** Arrays of interface elements for keeping track */
    this.cellDivs = []; //Matches the format of "board"
    this.checkerDivs = [];

    /** The checker that is being dragged */
    this.draggingCheckerDiv = null;
    this.draggingCheckerX = -1;
    this.draggingCheckerY = -1;

    this.gameDataLogic = new GameDataLogic();
  }

  /**
   * Initial page load - Use this to create the interface
   */
  createUI() {
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
  clearHighlights() {
    //Not a fan of using query selectors.
    var highlighted = document.querySelectorAll('.Highlight');
    highlighted.forEach(function (element) {
      element.classList.remove('Highlight');
    });
  }


  /**
   * Highlights the available moves of a piece.
   */
  highlightAvailableMoves(x, y) {
    // Get legal moves
    var moves = getLegalMoves(state.board[y][x], x, y);
    // mark checker to move
    checkerDivs[y][x].classList.add('Highlight');
    // Mark squares available for moves
    moves.forEach(function (move) {
      if (move.type === 'slide') {
        cellDivs[move.y][move.x].classList.add('Highlight');
      } else if (move.type === 'jump') {
        var landings = move['landings'];
        var lastLandingX = landings[landings.length - 1].x;
        var lastLandingY = landings[landings.length - 1].y;
        cellDivs[lastLandingY][lastLandingX].classList.add('Highlight');
      }
    })
  }


  /** @function cellDragStart
   * Handles cell start drag event.
   * @param event
   * @param x
   * @param y
   */
  checkerDragStart(event, x, y) {

    // Make sure the checker is the player's
    if (!doesPieceBelongToPlayer(x, y)) return;

    draggingCheckerDiv = event.target;
    draggingCheckerX = x;
    draggingCheckerY = y;

    clearHighlights();
    highlightAvailableMoves(x, y);
  }

  checkerMouseDown(event, x, y) {
    // Make sure the checker is the player's
    if (!doesPieceBelongToPlayer(x, y)) return;
    clearHighlights();
    highlightAvailableMoves(x, y);
  }

  checkerMouseUp(event, x, y) {
    clearHighlights();
  }


  /** @function cellDropEvent
   * Handles cell drop event.
   * @param event
   * @param xTarget
   * @param yTarget
   */
  cellDropEvent(event, xTarget, yTarget) {
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
      } else if (move.type === 'jump') {
        var landings = move['landings'];
        var lastLandingX = landings[landings.length - 1].x;
        var lastLandingY = landings[landings.length - 1].y;
        if (dropX === lastLandingX && dropY === lastLandingY) {
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
  cellAllowDragEvent(event, x, y) {
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
      } else if (move.type === 'jump') {
        var landings = move['landings'];
        var lastLandingX = landings[landings.length - 1].x;
        var lastLandingY = landings[landings.length - 1].y;
        if (x === lastLandingX && y === lastLandingY) {
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
  fullInterfaceRedraw() {
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
}