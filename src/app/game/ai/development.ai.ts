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
let objectives = 0;
let midRow = 0;

function main(gameState, side)
{
  //you can move somewhere if it is both on the board and the tilestate > 1
  const myTeam = gameState.teamStates[side];
  const [rowSize, colSize] = gameState.boardSize;
  const boardLayout = gameState.tileStates;//the strength of every tile on the board
  let tileValue = [];//hopefully it works with pass by reference
  midRow = Math.trunc(rowSize / 2);//Most valuable row - UPDATE: this won't be used to determine tile value in final version
  turn++;

  //initial stuff and turn based code
  if (turn === 0)
  {

  }
  //Build Tile Value board
  for(let i = 0; i < rowSize; i++)
  {
    tileValue.push([]);
    for(let j = 0; j < colSize; j++)
    {
      tileValue[i].push(-9);//-9 means it has not been updated
    }
  }
  let upperValue = tileValue;
  let lowerValue = tileValue;

  //objective based code
  if (objectives === 0)//destroy middle tiles
  {
    if (boardSegmented(boardLayout, midRow, colSize))
    {
      objectives++;
    }
    else//objective not met
    {
      //Build Tile Value board
      for(let i = 0; i < rowSize; i++)
      {
        //Find the tile value: 0 = High, 1+ = Lower, -1 = empty
        for (let j = 0; j < colSize; j++)
        {
          if (boardLayout[midRow][j] !== 0)
          {
            tileValue[midRow][j] = 0;//make center row most valuable
          }
        }
        //start at most valuable tiles, recusrion for value propagation
        for (let j = 0; j < colSize; j++)
        {
          valueRecursion(midRow, j, rowSize, colSize, boardLayout, tileValue);
        }
      }
    }
  }

  if (objectives === 1)//board center has been destroyed - multiple value functions
  {
    //UPPER SECTION
    for (let j = 0; j < colSize; j++)
    {
      if (boardLayout[midRow][j] !== 0)
      {
        upperValue[0][j] = 0;
      }
    }
    for (let j = 0; j < colSize; j++)
    {
      valueRecursion(0, j, rowSize, colSize, boardLayout, upperValue);
    }
    //LOWER SECTION
    for (let j = 0; j < colSize; j++)
    {
      if (boardLayout[midRow][j] !== 0)
      {
        lowerValue[rowSize - 1][j] = 0;
      }
    }
    for (let j = 0; j < colSize; j++)
    {
      valueRecursion(rowSize - 1, j, rowSize, colSize, boardLayout, lowerValue);
    }
  }

  let player = 0;//keeps track of which player is getting updated so different players can do different things
  return new Promise((resolve, reject) => {
    const callback = () => resolve(
      myTeam.reduce((moveSet, member) => {
        if (member.isDead)
        {
          moveSet.push('none');
        }
        else//Where should each monster move to
        {
          //where the monster is
          const [row, col] = member.coord;
          let n = -9; //north
          let s = -9; //south
          let w = -9; //west
          let e = -9; //east
          let x = -9; //here
          let minValue = -9;
          let direction = 'none';
          let move = [row, col];

          //Can you move in each direction and is that the best move
          if (locationExists(row + 1, col, rowSize, colSize, boardLayout)) 
          {
            s = objectiveValue(row + 1, col, player, tileValue, lowerValue, upperValue)//south
            if (minValue === -9 || (s !== -9 && s < minValue))
            {
              minValue = s;
              direction = 'south';
              move = [row + 1, col];
            }
          }
          if (locationExists(row - 1, col, rowSize, colSize, boardLayout)) 
          {
            n = objectiveValue(row - 1, col, player, tileValue, lowerValue, upperValue)//north
            if (minValue === -9 || (n !== -9 && n < minValue))
            {
              minValue = n;
              direction = 'north';
              move = [row - 1, col];
            }
          }
          if (locationExists(row, col - 1, rowSize, colSize, boardLayout)) 
          {
            w = objectiveValue(row, col - 1, player, tileValue, lowerValue, upperValue)//west
            if (minValue === -9 || (w !== -9 && w < minValue))
            {
              minValue = w;
              direction = 'west';
              move = [row, col - 1];
            }  
          }
          if (locationExists(row, col + 1, rowSize, colSize, boardLayout)) 
          {
            e = objectiveValue(row, col + 1, player, tileValue, lowerValue, upperValue)//east
            if (minValue === -9 || (e !== -9 && e < minValue))
            {
              minValue = e;
              direction = 'east';
              move = [row, col + 1];
            }
          }
          if (locationExists(row, col, rowSize, colSize, boardLayout))
          {
            x = objectiveValue(row, col, player, tileValue, lowerValue, upperValue)//here
            if (minValue === -9 || (x !== -9 && x < minValue))
            {
              minValue = x;
              direction = 'none';
              move = [row, col];
            }
          }

          //SUBTRACT OFF COMPLETED MOVE FROM TILE STRENGTH SO THE NEXT MONSTER TAKES IT INTO ACCOUNT
          moveSet.push(direction);
          tileValue[move[0]][move[1]]--;//update to subtract from whichever value it pulls from
          player++;
        }
        return moveSet;
      }, [])
    );

    return callback();
  })
}

//value of a tile for a monster with a given objective
function objectiveValue(row, col, player, tileValue, lowerValue, upperValue)
{
  if (objectives === 0)
  {
    return tileValue[row][col];
  }
  else if (objectives === 1)
  {
    if (player === 0)
    {
      return upperValue[row][col];
    }
    if (player === 1)
    {
      return upperValue[row][col];
    }
    if (player === 2)
    {
      return lowerValue[row][col];
    }
  }
}

//UPDATE: change it so that it checks if there is a valid path from 1 side of the board to another
//can be done by creating a value array and checking if there are spaces that weren't updated
function boardSegmented(boardLayout, midRow, colSize)
{
  for (let j = 0; j < colSize; j++)//checks if middle row is blocked out
  {
    if (boardLayout[midRow][j] > 1)
    {
      return false;//middle is not blocked out
    }
  }
  return true;
}

//recursively find the value of all tiles - start it at the most valuble tiles
function valueRecursion(rpos, cpos, rowSize, colSize, boardLayout, tileValue)
{
  //check if there are
  //for all surrounding tiles, if they are on the board
  if (locationExists(rpos + 1, cpos, rowSize, colSize, boardLayout))
  {
    if (tileValue[rpos + 1][cpos] === -9 || tileValue[rpos + 1][cpos] > tileValue[rpos][cpos] + 1)
    {
      tileValue[rpos + 1][cpos] = tileValue[rpos][cpos] + 1;
      valueRecursion(rpos + 1, cpos, rowSize, colSize, boardLayout, tileValue);
    }
  }
  if (locationExists(rpos - 1, cpos, rowSize, colSize, boardLayout))
  {
    if (tileValue[rpos - 1][cpos] === -9 || tileValue[rpos - 1][cpos] > tileValue[rpos][cpos] + 1)
    {
      tileValue[rpos - 1][cpos] = tileValue[rpos][cpos] + 1;
      valueRecursion(rpos - 1, cpos, rowSize, colSize, boardLayout, tileValue);
    }
  }
  if (locationExists(rpos, cpos + 1, rowSize, colSize, boardLayout))
  {
    if (tileValue[rpos][cpos + 1] === -9 || tileValue[rpos][cpos + 1] > tileValue[rpos][cpos] + 1)
    {
      tileValue[rpos][cpos + 1] = tileValue[rpos][cpos] + 1;
      valueRecursion(rpos, cpos + 1, rowSize, colSize, boardLayout, tileValue);
    }
  }
  if (locationExists(rpos, cpos - 1, rowSize, colSize, boardLayout))
  {
    if (tileValue[rpos][cpos - 1] === -9 || tileValue[rpos][cpos - 1] > tileValue[rpos][cpos] + 1)
    {
      tileValue[rpos][cpos - 1] = tileValue[rpos][cpos] + 1;
      valueRecursion(rpos, cpos - 1, rowSize, colSize, boardLayout, tileValue);
    } 
  }
}

function locationExists(rpos, cpos, rowSize, colSize, boardLayout)
{
  if (rpos >= 0 && rpos < rowSize && cpos >= 0 && cpos < colSize && boardLayout[rpos][cpos] > 1)
  {
    return true;
  }
  else
  {
    return false;
  }
}

`;//NO TOUCH