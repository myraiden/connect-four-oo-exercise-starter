let gameDOM=document.getElementById("game");

//add a DIV before id='board' with id='buttons' when DOM loads
document.addEventListener("DOMContentLoaded",function(){
  addNewElements();
  document.getElementById('startButton').addEventListener('click',function(startEvent){document.getElementById('board').innerHTML='';new Game(6, 7);})
})

//one button starts the game, one resets the game
function addNewElements(){
  const startButton=document.createElement("button")
  const buttonDiv=document.createElement("div")

  const p1Color=document.createElement("input")
  const p1Label=document.createElement("label")
  const p2Color=document.createElement("input")
  const p2Label=document.createElement("label")
  const p1Div=document.createElement("div")
  const p2Div=document.createElement("div")
  const playerDiv=document.createElement("div")
  
  buttonDiv.id='buttons'
  Object.assign(startButton,{
    innerHTML:'NEW Game',
    id:'startButton'})

  //add player Color Selectors
  playerDiv.id='playerColors'
  p1Div.id='p1Div'
  p2Div.id='p2Div'

  Object.assign(p1Color,{
    type:'color',
    defaultValue:'#ff0000',
    id:'pickColor',
    name:'p1Color'
  })
  Object.assign(p2Color,{
    type:'color',
    defaultValue:'#0000ff',
    id:'pickColor',
    name:'p2Color'
  })
  Object.assign(p1Label,{
    for:'p1Color',
    innerHTML: 'Player 1 Color:'
  })
  Object.assign(p2Label,{
    for: 'p2Color',
    innerHTML: 'Player 2 Color:'
  })

  //append all these butons and add them to the game display
  buttonDiv.append(startButton)
  p1Div.append(p1Label,p1Color)
  p2Div.append(p2Label,p2Color)
  playerDiv.append(p1Div, p2Div)
  gameDOM.prepend(buttonDiv,playerDiv)
}

//part Three, make Player a CLASS
/*It should have a constructor that takes a string color name (eg, “orange” or “#ff3366”) and store that on the player instance.
  The ***Game*** should keep track of the current player *object*, not the current player number.
  Update the code so that the player pieces are the right color for them, rather than being hardcoded in CSS as red or blue.
  Add a small form to the HTML that lets you enter the colors for the players, so that when you start a new game, it uses these player colors.
*/
class Player{
  constructor(colorSet='#000000',playerID=1){
    this.colorSet=colorSet;
    this.playerID=playerID;
  }
}

class Game{
  /** Connect Four
   *
   * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
   * column until a player gets four-in-a-row (horiz, vert, or diag) or until
   * board fills (tie)
   */
  constructor (WIDTH=7, HEIGHT=6,currPlayer=1,board=[]){
    this.WIDTH = WIDTH;
    this.HEIGHT = HEIGHT;
    this.currPlayer=currPlayer;
    this.board=board;
    this.makeBoard();
    this.makeHtmlBoard();
    
    //setup player colors
    const allPlayerColors=document.querySelectorAll("#pickColor");
    this.p1New=new Player(allPlayerColors[0].value,1);
    this.p2New=new Player(allPlayerColors[1].value,2);
  }

  //let currPlayer = 1; // active player: 1 or 2
  //let board = []; // array of rows, each row is array of cells  (board[y][x])

  /** makeBoard: create in-JS board structure:
   *   board = array of rows, each row is array of cells  (board[y][x])
   */

  makeBoard() {
    for (let y = 0; y < this.HEIGHT; y++) {
      this.board.push(Array.from({ length: this.WIDTH }));
    }
  }

  /** makeHtmlBoard: make HTML table and row of column tops. */

  makeHtmlBoard() {
    const board = document.getElementById('board');

    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', (event)=> this.handleClick(event));

    for (let x = 0; x < this.WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }

    board.append(top);

    // make main part of board
    for (let y = 0; y < this.HEIGHT; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < this.WIDTH; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }

      board.append(row);
    }
  }

  /* findSpotForCol: given column x, return top empty y (null if filled) */

  findSpotForCol(x) {
    for (let y = this.HEIGHT - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        return y;
      }
    }
    return null;
  }

  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.classList.add(`p${this.currPlayer}`);
    piece.style.top = -50 * (y + 2);

    if(this.currPlayer==1){
      piece.style.backgroundColor=this.p1New.colorSet
    }else if(this.currPlayer==2){
      piece.style.backgroundColor=this.p2New.colorSet
    }
    
    //piece.style.backgroundColor="red"
    let changeColor=(`p${this.currPlayer}New`).colorSet;
    piece.style.backgroundColor=changeColor;

    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  /** endGame: announce game end */
  /* AND change the class of the column to prevent users from adding more pieces */

  endGame(msg) {
    document.getElementById('column-top').setAttribute('class','gameEnded');
    alert(msg);
  }

  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer} won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === 1 ? 2 : 1;
  }

  /** checkForWin: check board cell-by-cell for "does a win start here?" */
  _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < this.HEIGHT &&
        x >= 0 &&
        x < this.WIDTH &&
        this.board[y][x] === this.currPlayer
    );
  }

  checkForWin() {
    
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

        // find winner (only checking each win-possibility as needed)
        if (this._win(horiz) || this._win(vert) || this._win(diagDR) || this._win(diagDL)) {
          return true;
        }
      }
    }
  }

  //this.makeBoard();
  //this.makeHtmlBoard();
}
//end GAME class

//let newGame=new Game(6, 7);