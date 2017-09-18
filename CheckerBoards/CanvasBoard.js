/**
 * Handles all canvas drawing logic.
 */
class CanvasBoard {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.containerDiv = null;
    this.messageDiv = null;
    this.gameDataLogic = new GameDataLogic();

    this.highlightCheckerX = null;
    this.highlightCheckerY = null;

    this.dragCheckerX = null;
    this.dragCheckerY = null;

    this.mouseX = null;
    this.mouseY = null;

    window.addEventListener('resize', Utility.CreateFunction(this, this.windowResize));
  }

  /**
   * Set the canvas scaling based on the window size.
   */
  windowResize() {
    if (window.innerWidth > window.innerHeight - 30) {
      //Set the canvas to scale by height
      if (!this.canvas.classList.contains('CanvasGreaterWidth')) {
        this.canvas.classList.remove('CanvasGreaterHeight');
        this.canvas.classList.add('CanvasGreaterWidth');
      }
    } else {
      //Set the canvas to scale by width
      if (!this.canvas.classList.contains('CanvasGreaterHeight')) {
        this.canvas.classList.remove('CanvasGreaterWidth');
        this.canvas.classList.add('CanvasGreaterHeight');
      }
    }
  }

  /**
   * Sets up the HTML5 canvas.
   */
  setupCanvas() {
    this.messageDiv = document.createElement('div');
    this.messageDiv.className = 'MessageDiv';
    this.containerDiv = document.createElement('div');
    this.containerDiv.className = 'ContainerDiv';
    this.canvas = document.createElement('canvas');
    this.canvas.addEventListener('mousemove', Utility.CreateFunction(this, this.hoverOverChecker));
    this.canvas.addEventListener('mousedown', Utility.CreateFunction(this, this.mouseDown));
    this.canvas.addEventListener('mouseup', Utility.CreateFunction(this, this.mouseUp));
    this.canvas.width = 1000;
    this.canvas.height = 1000;
    this.containerDiv.appendChild(this.canvas);
    document.body.appendChild(this.messageDiv);
    document.body.appendChild(this.containerDiv);
    this.ctx = this.canvas.getContext('2d');
    this.renderBoard();

    this.windowResize();

    this.updateGameStatusMessage();
  }

  mouseDown(event) {
    //Get mouse position
    let x = this.getCanvasMouseX(event);
    let y = this.getCanvasMouseY(event);

    this.dragCheckerX = null;
    this.dragCheckerY = null;

    if (this.gameDataLogic.state.board[y][x] !== null &&
      this.gameDataLogic.state.board[y][x] !== '' &&
      this.gameDataLogic.state.board[y][x].charAt(0) === this.gameDataLogic.state.turn) {

      this.dragCheckerX = x;
      this.dragCheckerY = y;
    }

    //Redraw
    this.renderBoard();
  }

  mouseUp(event) {
    //Get mouse position
    let dropX = this.getCanvasMouseX(event);
    let dropY = this.getCanvasMouseY(event);

    //Move the dragged piece
    if (this.dragCheckerX != null) {
      let moves = this.gameDataLogic.getLegalMoves(
        this.gameDataLogic.getPiece(this.dragCheckerX,this.dragCheckerY),
        this.dragCheckerX,
        this.dragCheckerY);
      let canDrop = false;
      let chosenMove = null;
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
        this.gameDataLogic.applyMove(this.dragCheckerX, this.dragCheckerY, chosenMove);
        this.gameDataLogic.nextTurn();
      }
      this.updateGameStatusMessage();
    }

    this.dragCheckerX = null;
    this.dragCheckerY = null;
    this.highlightCheckerY = null;
    this.highlightCheckerX = null;

    //Redraw
    this.renderBoard();
  }

  /**
   * Sets the message of the message div.
   * @param text
   */
  setMessage(text) {
    this.messageDiv.innerText = text;
  }

  updateGameStatusMessage() {
    let victory = this.gameDataLogic.checkForVictory();
    if (victory == null) {
      if (this.gameDataLogic.getTurn() == 'b') {
        this.setMessage('Black\'s Turn');
      } else {
        this.setMessage('White\'s Turn');
      }
    } else {
      if (victory == 'black wins') {
        this.setMessage('Black has Won!');
      } else {
        this.setMessage('White has Won!');
      }
    }
  }

  /**
   * Event for hovering over the checker board.
   * @param event
   */
  hoverOverChecker(event) {
    //Get mouse position
    let x = this.getCanvasMouseX(event);
    let y = this.getCanvasMouseY(event);

    this.highlightCheckerX = null;
    this.highlightCheckerY = null;

    //Highlight checkers
    if (this.gameDataLogic.state.board[y][x] !== null &&
      this.gameDataLogic.state.board[y][x] !== '' &&
      this.gameDataLogic.state.board[y][x].charAt(0) === this.gameDataLogic.state.turn) {

      this.highlightCheckerX = x;
      this.highlightCheckerY = y;
    }

    //Redraw
    this.renderBoard();
  }

  /**
   * Returns the mouse X position on the canvas.
   * @param event
   */
  getCanvasMouseX(event) {
    //Get mouse position
    let bounds = event.target.getBoundingClientRect();
    let mouseX = event.clientX - bounds.left;
    mouseX = mouseX * this.canvas.width / bounds.width;
    this.mouseX = mouseX;
    return Math.floor(mouseX / 100);
  }

  /**
   * Returns the mouse Y position on the canvas.
   * @param event
   */
  getCanvasMouseY(event) {
    //Get mouse position
    let bounds = event.target.getBoundingClientRect();
    let mouseY = event.clientY - bounds.top;
    mouseY = mouseY * this.canvas.height / bounds.height;
    this.mouseY = mouseY;
    return Math.floor(mouseY / 100);
  }

  /**
   * Redraws the entire checker board.
   */
  renderBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < 10; y+=1) {
      for (let x = 0; x < 10; x+=1) {
        if ((x+y) % 2 !== 0) {
          this.ctx.fillStyle = 'gray';
          this.ctx.fillRect(x * 100, y * 100, 100, 100);
          let piece = this.gameDataLogic.getPiece(x, y);
          if (piece &&
            !(this.dragCheckerX === x && this.dragCheckerY === y)) {
            if (piece === "w" || piece === "wk") {
              this.ctx.fillStyle = 'white';
            } else if (piece === "b" || piece === "bk") {
              this.ctx.fillStyle = 'black';
            }
            this.ctx.beginPath();
            this.ctx.arc(x*100 + 50, y * 100 + 50, 40, 40, 0, Math.PI * 2);
            this.ctx.fill();
            //Draw kings
            if (piece.indexOf('k') != -1) {
              this.ctx.fillStyle = 'red';
              this.ctx.textAlign = 'center';
              this.ctx.font="20px Arial";
              this.ctx.fillText('King', x * 100 + 50, y * 100 + 50);
            }
          }
        }
      }
    }
    //Draw the highlighted checker
    if (this.dragCheckerX != null) {
      this.highlightCheckerX = this.dragCheckerX;
      this.highlightCheckerY = this.dragCheckerY;
    }
    if (this.highlightCheckerX != null) {
      let x = this.highlightCheckerX;
      let y = this.highlightCheckerY
      // Get legal moves
      let moves = this.gameDataLogic.getLegalMoves(this.gameDataLogic.state.board[y][x], x, y);
      // mark checker to move
      this.ctx.fillStyle = 'yellow';
      if (this.dragCheckerY != this.highlightCheckerY ||
          this.dragCheckerX != this.highlightCheckerX) {
        this.ctx.beginPath();
        this.ctx.arc(x*100 + 50, y * 100 + 50, 40, 40, 0, Math.PI * 2);
        this.ctx.fill();
        let piece = this.gameDataLogic.getPiece(this.highlightCheckerX, this.highlightCheckerY);
        //Draw kings
        if (piece.indexOf('k') != -1) {
          this.ctx.fillStyle = 'red';
          this.ctx.textAlign = 'center';
          this.ctx.font="20px Arial";
          this.ctx.fillText('King', x * 100 + 50, y * 100 + 50);
        }
      }
      // Mark squares available for moves
      moves.forEach(Utility.CreateFunction(this, function (move) {
        if (move.type === 'slide') {
          this.ctx.fillStyle = 'yellow';
          this.ctx.fillRect(move.x * 100, move.y * 100, 100, 100);
        } else if (move.type === 'jump') {
          let landings = move['landings'];
          let lastLandingX = landings[landings.length - 1].x;
          let lastLandingY = landings[landings.length - 1].y;
          this.ctx.fillStyle = 'yellow';
          this.ctx.fillRect(lastLandingX * 100, lastLandingY * 100, 100, 100);
        }
      }));
    }
    //Draw the dragged checker
    if (this.dragCheckerX != null) {
      let piece = this.gameDataLogic.getPiece(this.dragCheckerX, this.dragCheckerY);
      if (piece === "w" || piece === "wk") {
        this.ctx.fillStyle = 'white';
      } else if (piece === "b" || piece === "bk") {
        this.ctx.fillStyle = 'black';
      }
      this.ctx.strokeStyle = 'yellow';
      this.ctx.beginPath();
      this.ctx.arc(this.mouseX, this.mouseY, 40, 40, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      //Draw kings
      if (piece.indexOf('k') != -1) {
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'center';
        this.ctx.fontSize = '20px';
        this.ctx.font="20px Arial";
        this.ctx.fillText('King', this.mouseX, this.mouseY);
      }
    }
  }
}