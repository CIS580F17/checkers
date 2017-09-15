// checkers.js

var currentBoard = null;

/** @function main
 * Entry point to the program.
 * Starts the checkers game.
 */
function main() {
  if (Utility.IsRunningInWebpage()) {
    //Run the HTMLBoard
    //currentBoard = new HTMLBoard();
    //currentBoard.createUI();
    //currentBoard.fullInterfaceRedraw();

    //Run the CanvasBoard
    currentBoard = new CanvasBoard();
    currentBoard.setupCanvas();
  } else {
    //Run the ConsoleBoard
    Utility.InitializeConsoleReader();
    currentBoard = new ConsoleBoard();
    currentBoard.startNextGameLoop();
  }
}

//Initializes either a web canvas or the console canvas
if (Utility.IsRunningInWebpage()) {
  window.onload = function () {
    main();
  };
} else {
  main();
}