class GameDataLogic {
  constructor() {
    /** The state of the game */
    this.state = {
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
  }

  getTurn() {
    return this.state.turn;
  }

  doesPieceBelongToPlayer(x, y) {
    var piece = this.getPiece(x, y);
    return (piece != null && piece.charAt(0) === this.state.turn);
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
  getLegalMoves(piece, x, y) {
    var moves = [];
    switch (piece) {
      case 'b': // black can only move down the board diagonally
        this.checkSlide(moves, x - 1, y - 1);
        this.checkSlide(moves, x + 1, y - 1);
        this.checkJump(moves, {captures: [], landings: []}, piece, x, y);
        break;
      case 'w':  // white can only move up the board diagonally
        this.checkSlide(moves, x - 1, y + 1);
        this.checkSlide(moves, x + 1, y + 1);
        this.checkJump(moves, {captures: [], landings: []}, piece, x, y);
        break;
      case 'bk': // kings can move diagonally any direction
      case 'wk': // kings can move diagonally any direction
        this.checkSlide(moves, x - 1, y + 1);
        this.checkSlide(moves, x + 1, y + 1);
        this.checkSlide(moves, x - 1, y - 1);
        this.checkSlide(moves, x + 1, y - 1);
        this.checkJump(moves, {captures: [], landings: []}, piece, x, y);
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
  checkSlide(moves, x, y) {
    // Check square is on grid
    if (x < 0 || x > 9 || y < 0 || y > 9) return;
    // check square is unoccupied
    if (this.getPiece(x, y)) return;
    // legal move!  Add it to the move list
    moves.push({type: 'slide', x: x, y: y});
  }

  /** @function copyJumps
   * A helper function to clone a jumps object
   * @param {Object} jumps - the jumps to clone
   * @returns The cloned jump object
   */
  copyJumps(jumps) {
    // Use Array.prototype.slice() to create a copy
    // of the landings and captures array.
    var newJumps = {
      landings: jumps.landings.slice(),
      captures: jumps.captures.slice()
    }
    return newJumps;
  }

  getPiece(x, y) {
    return this.state.board[y][x];
  }

  setPiece (x, y, value) {
    this.state.board[y][x] = value;
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
  checkJump(moves, jumps, piece, x, y) {
    switch (piece) {
      case 'b': // black can only move down the board diagonally
        this.checkLanding(moves, this.copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
        this.checkLanding(moves, this.copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
        break;
      case 'w':  // white can only move up the board diagonally
        this.checkLanding(moves, this.copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
        this.checkLanding(moves, this.copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
        break;
      case 'bk': // kings can move diagonally any direction
      case 'wk': // kings can move diagonally any direction
        console.log('Jumps: ' + JSON.stringify(jumps));
        this.checkLanding(moves, this.copyJumps(jumps), piece, x - 1, y + 1, x - 2, y + 2);
        this.checkLanding(moves, this.copyJumps(jumps), piece, x + 1, y + 1, x + 2, y + 2);
        this.checkLanding(moves, this.copyJumps(jumps), piece, x - 1, y - 1, x - 2, y - 2);
        this.checkLanding(moves, this.copyJumps(jumps), piece, x + 1, y - 1, x + 2, y - 2);
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
  checkLanding(moves, jumps, piece, cx, cy, lx, ly) {
    // Check landing square is on grid
    if (lx < 0 || lx > this.state.board.length - 1 || ly < 0 || ly > this.state.board.length - 1) return;
    // Check landing square is unoccupied
    if (this.getPiece(lx, ly)) return;
    // Check capture square is occuped by opponent
    if ((piece === 'b' || piece === 'bk') && !(this.getPiece(cx, cy) === 'w' || this.getPiece(cx, cy) === 'wk')) return;
    if ((piece === 'w' || piece === 'wk') && !(this.getPiece(cx, cy) === 'b' || this.getPiece(cx, cy) === 'bk')) return;
    // legal jump! add it to the moves list
    //But only add it if it doesn't already exist
    let containsDuplicateLanding = false;
    jumps.landings.forEach(function (landing){
      if (landing.x == lx && landing.y == ly) {
        containsDuplicateLanding = true;
      }
    });
    if (!containsDuplicateLanding) {
      jumps.captures.push({x: cx, y: cy});
      jumps.landings.push({x: lx, y: ly});

      moves.push({
        type: 'jump',
        captures: jumps.captures.slice(),
        landings: jumps.landings.slice()
      });
      // check for further jump opportunities
      this.checkJump(moves, jumps, piece, lx, ly);
    }
  }

  /**
   * Checks a piece if it is a king and applies it.
   */
  checkAndApplyKing(x, y) {
    let piece = this.getPiece(x, y);
    if (y == 0 && piece == 'b') {
      this.setPiece(x, y, 'bk')
    }
    if (y == this.state.board.length - 1 && piece == 'w') {
      this.setPiece(x, y, 'wk')
    }
  }

  /** @function ApplyMove
   * A function to apply the selected move to the game
   * @param {object} move - the move to apply.
   */
  applyMove(x, y, move) {
    if (move.type === "slide") {
      this.setPiece(move.x, move.y, this.getPiece(x, y));
      this.setPiece(x, y, null);
      this.checkAndApplyKing(move.x, move.y);
    } else {
      move.captures.forEach(Utility.CreateFunction(this, function (square) {
        this.setPiece(square.x, square.y, null);
      }));
      var index = move.landings.length - 1;
      this.setPiece(move.landings[index].x, move.landings[index].y, this.getPiece(x, y));
      this.setPiece(x, y, null);
      this.checkAndApplyKing(move.landings[index].x, move.landings[index].y);
    }
  }



  /** @function checkForVictory
   * Checks to see if a victory has been actived
   * (All peices of one color have been captured)
   * @return {String} one of three values:
   * "White wins", "Black wins", or null, if neither
   * has yet won.
   */
  checkForVictory() {
    var wCount = 0;
    var bCount = 0;
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (this.getPiece(x, y) === "w" || this.getPiece(x, y) === "wk") {
          wCount++;
        }
        if (this.getPiece(x, y) === "b" || this.getPiece(x, y) === "bk") {
          bCount++;
        }
      }
    }
    if (wCount == 0) {
      this.state.over = true;
      return 'black wins';
    }
    if (bCount == 0) {
      this.state.over = true;
      return 'white wins';
    }
    return null;
  }


  /** @function nextTurn()
   * Starts the next turn by changing the
   * turn property of state.
   */
  nextTurn() {
    if (this.state.turn === 'b') this.state.turn = 'w';
    else this.state.turn = 'b';
  }
}