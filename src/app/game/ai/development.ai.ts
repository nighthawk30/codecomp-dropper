/*
NOTE: This is for development purposes only, final submission should be done through the submission tab

Fill in the contents of main with your strategy
The contents of gameState and side can be found by viewing interfaces.ts IGameState and Side interfaces (also included in this comment)
gameState represents the current state of the game (all tiles, all teams)
side will tell you which team is yours
main should return an array of MoveDirection's (also found in interfaces.ts) with size = # of monsters on one team to start

Take a look at other example scripts to get some ideas on how to leverage this data

export interface IGameState {
  boardSize: [number, number];
  tileStates: TileState[][];
  teamStates: TeamStates;
}

export enum TileState {
  Good = 3,
  Warning = 2,
  Danger = 1,
  Broken = 0,
}

export enum Side {
  Home = 'home',
  Away = 'away',
}

export enum MoveDirection {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
  None = 'none',
}

export type TeamStates = Record<Side, ITeamMemberState[]>;

export interface ITeamMemberState {
  coord: Coord;
  isDead: boolean;
}

export type Coord = [number, number];


*/

// do not include "export const developmentScript = " with your submission
export const developmentScript = `
//global variables
let turn = -1;

function main(gameState, side)
{
  //you can move somewhere if it is both on the board and the tilestate > 1
  const myTeam = gameState.teamStates[side];
  const [rowSize, colSize] = gameState.boardSize;
  const boardLayout[][] = gameState.tileStates;
  const possibleMoves = [];
  turn++;

  return new Promise((resolve, reject) => {
    const callback = () => resolve(
      myTeam.reduce((moveSet, member, i) => {
        if (member.isDead) {
          moveSet.push('none');
        }
        else
        {
          possibleMoves.push('none');
          //where the monster is
          const [row, col] = member.coord;
          if (row > 1 && boardLayout[row - 1][col] > 1) 
          {
            possibleMoves.push('north');
          }
          if (row < rowSize - 1 && boardLayout[row + 1][col] > 1) 
          {
            possibleMoves.push('south');
          }
          if (col > 1 && boardLayout[row][col - 1] > 1) 
          {
            possibleMoves.push('west');
          }
          if (col < colSize - 1 && boardLayout[row][col + 1] > 1) 
          {
            possibleMoves.push('east');
          }
          moveSet.push(possibleMoves[Math.floor(Math.random() * possibleMoves.length)]);
          possibleMoves.length = 0;
        }
        return moveSet;
      }, [])
    );


    return callback();    
    })
}


`;//NO TOUCH THIS LINE


/*`
//global variables
let board = [];
let turn = -1;
let prevOtherMoves = [];
let otherMoves = [];//current location of each monster on opp team
let curMoves = [];//current location of each monster on our team
function main(gameState, side)
{
  turn++;
  const [rowSize, colSize] = gameState.boardSize;//build the board
  const myTeam = gameState.teamStates[side];
  const otherSide = side === 'home' ? 'away' : 'home';
  const otherTeam = gameState.teamStates[otherSide];
  const possibleMoves = [];

  if (turn === 0)
  {
    for(let i = 0; i < rowSize; i++)
    {
      board.push([]);
      for(let j = 0; j < colSize; j++)
      {
        board[i].push(3);
      }
    }
    //location of our monsters
    for(let i = 0; i < myTeam.length; i++)
    {
      curMoves.push(myTeam[i].coord);
    }
  }
  
  // console.log('turn', turn);
  return new Promise((resolve, reject) => {
    prevOtherMoves = otherMoves;    
    otherMoves = otherTeam.map(member => {
      return member.coord;
    });
    
    if (turn === 0)
    {
      prevOtherMoves = otherMoves;
    }

    otherMoves.forEach((m, i) => {
      const [curRow, curCol] = m;
      const [prevRow, prevCol] =  prevOtherMoves[i];

      if(curRow !== prevRow || curCol !== prevCol) {
        // console.log('other moved', curRow, curCol);
        board[curRow][curCol]--;
      }
    });
    
    const callback = () => resolve(
      myTeam.reduce((moveSet, member, i) => {
        if (member.isDead) {
          moveSet.push('none');
        } else {
          const [row, col] = curMoves[i];
          // console.log('premove', row, col);
          
          const canNorth = row > 0;
          const canSouth = row < rowSize - 1;
          const canWest = col > 0;
          const canEast = col < colSize - 1;
          const northExist = board[row - 1 >= 0 ? row - 1 : 0][col] > 1;
          const southExist = board[row + 1 <= 4 ? row + 1 : 4][col] > 1;
          const westExist  = board[row][col - 1 >= 0 ? col - 1 : 0] > 1;
          const eastExist  = board[row][col + 1 <= 4 ? col + 1 : 4] > 1;
          const idleExist  = board[row][col] > 1;
          // console.log('N', canNorth, 'S', canSouth, 'W', canWest, 'E', canEast);
          // console.log(
          //   'N', board[row - 1 >= 0 ? row - 1 : 0][col], 
          //   'S', board[row + 1 <= 4 ? row + 1 : 4][col], 
          //   'W', board[row][col - 1 >= 0 ? col - 1 : 0], 
          //   'E', board[row][col + 1 <= 4 ? col + 1 : 4],
          // );

          if (canNorth && northExist) possibleMoves.push('north');
          if (canSouth && southExist)  possibleMoves.push('south');
          if (canWest && westExist) possibleMoves.push('west');
          if (canEast && eastExist)  possibleMoves.push('east');
          if (idleExist) possibleMoves.push('none');

          if(possibleMoves.length == 0) possibleMoves.push('none');

          const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          
          let newRow = row, newCol = col;
          switch(move) {
            case 'north': {
              newRow = row - 1 >= 0 ? row - 1 : 0;
              break;
            }
            case 'south': {
              newRow = row + 1 <= 4 ? row + 1 : 4;
              break;
            }
            case 'west': {
              newCol = col - 1 >= 0 ? col - 1 : 0;
              break;
            }
            case 'east': {
              newCol = col + 1 <= 4 ? col + 1 : 4;
              break;
            }
            default: {
              break;
            }
          }
          if (move !== 'none') {
            // console.log('moved', move, row + '->' + newRow, col + '->' + newCol, board[newRow][newCol]);
            board[newRow][newCol]--;
            curMoves[i] = [newRow, newCol];
          }
          moveSet.push(move);
          console.log('row 0', board[0]);
          console.log('row 1', board[1]);
          console.log('row 2', board[2]);
          console.log('row 3', board[3]);
          console.log('row 4', board[4]);
          possibleMoves.length = 0;
        }
        return moveSet;
      }, [])
    );

    return callback();    
    })
}
`;
*/