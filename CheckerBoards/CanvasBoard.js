/**
 * Handles all canvas drawing logic.
 */
class CanvasBoard {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.containerDiv = null;
    this.gameDataLogic = new GameDataLogic();

    window.addEventListener('resize', Utility.CreateFunction(this, this.windowResize));
  }

  /**
   * Set the canvas scaling based on the window size.
   */
  windowResize() {
    if (window.innerWidth > window.innerHeight) {
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
    this.containerDiv = document.createElement('div');
    this.containerDiv.className = 'ContainerDiv';
    this.canvas = document.createElement('canvas');
    this.canvas.addEventListener('mousemove', Utility.CreateFunction(this, this.hoverOverChecker));
    this.canvas.width = 1000;
    this.canvas.height = 1000;
    this.containerDiv.appendChild(this.canvas);
    document.body.appendChild(this.containerDiv);
    this.ctx = this.canvas.getContext('2d');
    this.renderBoard();

    this.windowResize();
  }

  /**
   * Event for hovering over the checker board.
   * @param event
   */
  hoverOverChecker(event) {
    this.renderBoard();
    let bounds = event.target.getBoundingClientRect();
    let mouseX = event.clientX - bounds.left;
    let mouseY = event.clientY - bounds.top;
    mouseX = mouseX * this.canvas.width / bounds.width;
    mouseY = mouseY * this.canvas.height / bounds.height;
    let x = Math.floor(mouseX / 100);
    let y = Math.floor(mouseY / 100);
    if (this.gameDataLogic.state.board[y][x] !== null &&
      this.gameDataLogic.state.board[y][x] !== '' &&
      this.gameDataLogic.state.board[y][x].charAt(0) === this.gameDataLogic.state.turn) {
      // Get legal moves
      let moves = this.gameDataLogic.getLegalMoves(this.gameDataLogic.state.board[y][x], x, y);
      // mark checker to move
      this.ctx.fillStyle = 'yellow';
      this.ctx.beginPath();
      this.ctx.arc(x*100 + 50, y * 100 + 50, 40, 40, 0, Math.PI * 2);
      this.ctx.fill();
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
          if (this.gameDataLogic.state.board[y][x]) {
            if (this.gameDataLogic.state.board[y][x] === "w" || this.gameDataLogic.state.board[y][x] === "wk") {
              this.ctx.fillStyle = 'white';
            } else if (this.gameDataLogic.state.board[y][x] === "b" || this.gameDataLogic.state.board[y][x] === "bk") {
              this.ctx.fillStyle = 'black';
            }
            this.ctx.beginPath();
            this.ctx.arc(x*100 + 50, y * 100 + 50, 40, 40, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }
    }
  }
}