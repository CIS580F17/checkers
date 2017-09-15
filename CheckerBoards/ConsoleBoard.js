class ConsoleBoard {
  constructor() {
    this.gameDataLogic = new GameDataLogic();
  }


  /** @function printBoard
   * Prints the current state of the game board
   * to the console.
   */
  printBoard() {
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
  getJumpString(move) {
    var jumps = move.landings.map(function (landing) {
      return String.fromCharCode(97 + landing.x) + "," + landing.y;
    }).join(' to ');
    return "jump to " + jumps + " capturing " + move.captures.length + " piece" + ((move.captures.length > 1) ? 's' : '');
  }


  startNextGameLoop() {
    setTimeout(function () {
      consoleGameDecisionLoop();
    }, 0);
  }


  consoleGameDecisionLoop() {
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
}