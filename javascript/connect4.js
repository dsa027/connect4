// Thursday, 4 hours
// Friday,
(function() {
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = -1;
  const RED = 0;
  const YELLOW = 1;

  // http://soundbible.com/1540-Computer-Error-Alert.html
  const beep = new Audio('sounds/error.wav');

  const cWidth = 490, cHeight = 420; // screen dimesions
  const rowHeight = cHeight / ROWS;
  const colWidth = cWidth / COLS;
  let canvas = null;
  let context = null;
  let canvasRect = null; // dims where the canvas is on the page
  let stop = true;
  let gameOver = false;
  let turn = RED;
  let background;
  let grid;

  const discs = [];
  let fakeDisc;

  const Side = {'COMPUTER': 'COMPUTER', 'PLAYER': 'PLAYER', 'NONE': 'NONE'};
  const Win = {'ROW': 'Row', 'COL': 'Column', 'DIAG': 'Diagonal'}

  class Disc {
    constructor(x, y, color) {
      this.radius = rowHeight / 2;
      this.x = x;
      this.y = y;
      this.color = color;
    }

    render() {
      context.beginPath();
      context.arc(
          this.x*colWidth + this.radius,
          this.y*rowHeight + this.radius,
          rowHeight/2, 0, 2 * Math.PI, false);
      context.fillStyle = this.color;
      context.fill();
    }

    renderAbsolute() {
      if (fakeDisc.color) {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            rowHeight/2, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
      }
    }
  }

  class Grid {
    render() {
      context.fillStyle = 'white';
      for (let i = 1; i < COLS; i++) {
        context.fillRect(i * rowHeight, 0, 1, cHeight);
      }
      for (let i = 1; i < ROWS; i++) {
        context.fillRect(0, i * colWidth, cWidth, 1);
      }
    }
  }

  //////////////////
  class Background {
  //////////////////
    constructor() {
      var image = new Image(cWidth, cHeight);
      image.src = 'images/bg.png';
      this.sprite = new Sprite(image, cWidth, cHeight);
      this.justScored = Side.NONE;
      this.gameOverFlash = new Flash(30);
    }

    showGameOver() {
      //////////////////////
      // DON'T FLASH THIS //
      //////////////////////
      if (this.winLine) {
        const line = this.winLine;
        context.strokeStyle ='lightgreen';
        context.lineWidth = 10;
        const plus = rowHeight / 2;

        context.beginPath();
        context.moveTo(line.lx*colWidth+plus, line.ly*colWidth+plus);
        context.lineTo(line.rx*colWidth+plus, line.ry*colWidth+plus);
        context.stroke();
      }
      var elem = document.getElementById("you-won");
      elem.innerHTML = (turn === RED) ? "Yellow Wins!!!" : "Red Wins!!!";
      elem.style.display = "block";

      ////////////////
      // FLASH THIS //
      ////////////////
      // don't show elements unless flashing === true
      if (!this.gameOverFlash.check()) return;

      var fontSize = 76;
      context.font = `${fontSize}px sans-serif`;
      context.fillStyle = 'white';

      var gW = context.measureText("GAME").width;
      var oW = context.measureText("OVER").width;

      var ySpace = (cHeight - fontSize*2) / 3;
      ySpace *= .7;
      var xSpace = (cWidth - Math.max(gW, oW)) / 2;

      context.fillText("GAME", xSpace, ySpace+fontSize);
      context.fillText("OVER", xSpace, fontSize*2 + ySpace*2);

      var str = "Press any key to continue...";
      fontSize = 32;
      context.font = `${fontSize}px sans-serif`;
      context.fillText(str, (cWidth - context.measureText(str).width) / 2, cHeight-5);
    }

    showClickToStart() {
      context.fillStyle = 'palegreen';
      var str = "Click mouse or press spacebar to serve...";
      var fontSize = 22;
      context.font = `${fontSize}px sans-serif`;
      context.fillText(str, (cWidth - context.measureText(str).width) / 2, cHeight / 2 + fontSize*2);
    }

    saveWin(type, line) {
      this.winType = type;
      this.winLine = line;
    }

    render() {
      // background sprite
      context.drawImage(this.sprite.image, 0, 0, this.sprite.width, this.sprite.height);

      if (stop) {
        // this.showClickToStart();
      }
    }
  } // Background

  //////////////////
  class Flash {
  //////////////////
    constructor(interval) {
      this.flashInterval = interval;
      this.flashCount = 0;
      this.flashing = true;
    }

    check() {
      if (++this.flashCount >= this.flashInterval) {
        this.flashCount = 0;
        this.flashing = !this.flashing;
      }

      return this.flashing;
    }
  }

  //////////////////
  class Sprite {
  //////////////////
    constructor(image, width, height) {
      this.image = image;
      this.width = width;
      this.height = height;
    }
  } // Sprite


  //////////////////
  document.addEventListener("DOMContentLoaded", function(event) {
  //////////////////
    // animate
    function step() {
      // at start of game/end of game? don't animate
      if (!stop) {
        // ball.move();
        // cPaddle.update()
      }
      background.render();
      grid.render();
      for (let i = 0; i < discs.length; i++) {
        discs[i].render();
      }
      if (gameOver) {
        background.showGameOver();
      }
      else {
        if (fakeDisc.color) {
          fakeDisc.renderAbsolute();
        }
      }

      requestAnimationFrame(step);
    }

    function addListeners() {
      kbdListener();
      mouseClickListener();
      mouseMoveListener();
    }

    function buildCanvas() {
      // build canvas
      canvas = document.getElementById("canvas");
      canvas.width = cWidth;
      canvas.height = cHeight;
      context = canvas.getContext("2d");
    }

    function createGameElements() {
      background = new Background();
      grid = new Grid();
      fakeDisc = new Disc(0, 0, null);
    }

    function restartGame() {
      document.getElementById("you-won").style.display = "none";
      gameOver = false;
      stop = true;
      discs.splice(0, discs.length);
      turn = RED;
    }

    function kbdListener() {
      // move player's paddle on keydown
      window.addEventListener('keydown', function(event) {
        if (gameOver) {
          restartGame();
          return;
        }
      });
    }

    function mouseClickListener() {
      // start game on click, or click on canvas elements
      window.addEventListener('click', function(event) {
        if (gameOver) {
          restartGame();
          return;
        }
        if (fakeDisc.color) fakeDisc.color = null;

        canvasRect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left;

        const x = getX(mouseX);
        const y = getY(mouseX);

        if (y < 0) {
          beep.play();
        }
        else {
          const disc = new Disc(x, y, turn === RED ? 'red' : 'yellow');
          discs.push(disc);
          turn = turn === RED ? YELLOW : RED;
          checkForWin(disc);
        }
      });

      function getRow(disc) {
        return discs.filter(target => {return target.y === disc.y});
      }
      function getCol(disc) {
        return discs.filter(target => {return target.x === disc.x});
      }
      function checkForFour(arr, x) {
        let lx = 0, ly = 0, rx = 0, ry = 0;

        let last = 0, lastColor = '', count = 0;
        for (let i = 0; i < arr.length; i++) {
          const xy = x ? arr[i].x : arr[i].y;
          if (xy !== last+1 || arr[i].color != lastColor) {
            count = 1;
            lx = arr[i].x;
            ly = arr[i].y;
          }
          else {
            count += 1;
            rx = arr[i].x;
            ry = arr[i].y;
            if (count === 4) {
              gameOver = true;
              break;
            }
          }
          last = x ? arr[i].x : arr[i].y;
          lastColor = arr[i].color;
        }

        return {'lx':lx, 'ly':ly, 'rx':rx, 'ry':ry};
      }

      function checkRowForWin(disc) {
        let row = getRow(disc);
        row.sort((a, b) => a.x - b.x);
        return checkForFour(row, true);
      }

      function checkColForWin(disc) {
        let col = getCol(disc);
        col.sort((a, b) => a.y - b.y);
        return checkForFour(col, false);
      }

      function equal(d, disc, x, y) {
        const eq = d.color === disc.color && d.x === x && d.y === y;

        return eq;
      }

      function checkDiagForWin(disc) {
        // -slope: to left: -x/-y; to right: +x/+y
        let i = disc.x, j = disc.y;
        // get to leftmost disc
        for (
            var lx = i, ly = j;
            discs.find(d =>{return equal(d, disc, i, j)});
            lx = i, ly = j, i--, j--);
        // get to rightmost disc
        for (
            var rx = lx, x = lx, ry = ly, y = ly;
            discs.find(d => {return equal(d, disc, x, y)});
            rx = x, ry = y, x++, y++);

        if (rx - lx + 1 === 4) {
          gameOver = true;
          return {'lx':lx, 'ly':ly, 'rx':rx, 'ry':ry};
        }

        // +slope: to left: -x/+y; to right: +x/-y
        i = disc.x, j = disc.y;
        // get to leftmost disc
        for (
            lx = i, ly = j;
            discs.find(d => {return equal(d, disc, i, j)});
            lx = i, ly = j, i--, j++);
        // get to rightmost disc
        for (
            rx = lx, x = lx, ry = ly, y = ly;
            discs.find(d => {return equal(d, disc, x, y)});
            rx = x, ry = y, x++, y--);

        if (rx - lx + 1 === 4) {
          gameOver = true;
          return {'lx':lx, 'ly':ly, 'rx':rx, 'ry':ry};
        }

        return null;
      }

      function checkForWin(disc) {
        if (!gameOver) {
          const line = checkRowForWin(disc);
          if (gameOver) background.saveWin(Win.ROW, line);
        }
        if (!gameOver) {
          const line = checkColForWin(disc);
          if (gameOver) background.saveWin(Win.COL, line);
        }
        if (!gameOver) {
          const line = checkDiagForWin(disc);
          if (gameOver) background.saveWin(Win.DIAG, line);
        }
      }

      function getX(x) {
        return Math.floor((x+1) / colWidth);
      }

      function getY(x) {
        const idx = getX(x);
        let min = Number.MAX_VALUE;
        for (let i = 0; i < discs.length; i++) {
          if (discs[i].x === idx && discs[i].y < min) min = discs[i].y;
        }

        return min === Number.MAX_VALUE ? ROWS - 1 : min - 1;
      }
    }

    function mouseMoveListener() {
      window.addEventListener('mousemove', function(event) {
        if (gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x > cWidth || y > cHeight || x < 0 || y < 0) return;

        fakeDisc.x = x;
        fakeDisc.y = y;

        if (!fakeDisc.color) {
          fakeDisc.color = turn === RED ? 'red' : 'yellow';
        }
      });
    }

    function addListeners() {
      kbdListener();
      mouseClickListener();
      mouseMoveListener();
    }

    function clearWonLost() {
      document.getElementById("you-won").style.display = "none";
      document.getElementById("you-lost").style.display = "none";
    }

    ///////////////////////////////////
    // do the work
    ///////////////////////////////////
    buildCanvas();
    createGameElements();
    addListeners();
    clearWonLost();
    // run step() at every animation frame, god help us otherwise
    window.requestAnimationFrame(step) || function(step) {
      window.setTimeout(step, 1000/60);
    }

  });
})();
