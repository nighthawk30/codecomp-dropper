//global variables
let turn = -1;
let midRow = Math.trunc(rowSize / 2);//Most valuable row - UPDATE: this won't be used to determine tile value in final version

function main(gameState, side)
{
  //you can move somewhere if it is both on the board and the tilestate > 1
  const myTeam = gameState.teamStates[side];
  const [rowSize, colSize] = gameState.boardSize;
  const boardLayout = gameState.tileStates;//the strength of every tile on the board
  let tileValue = [];//hopefully it works with pass by reference
  const possibleMoves = [];
  turn++;

  //initial stuff
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

  
  
  if (boardSegmented(boardLayout, midRow) && midRow > 0)//If the middle row has been destroyed, destroy the next row up, or something - UPDATE
  {
    midRow--;
  }
  //Find the tile value: 0 = High, 1+ = Lower, -1 = empty
  for (let j = 0; j < colSize; j++)
  {
    if (boardLayout[midRow][j] !== 0)
    {
      tileValue[midRow][j] = 0;//make center row most valuable
    }
  }

  //start at middle, recusrion for value propagation
  for (let j = 0; j < colSize; j++)
  {
    valueRecursion(midRow, j, rowSize, colSize, boardLayout, tileValue);
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
            s = tileValue[row + 1][col]; //south
            if (minValue === -9 || (n !== -9 && n < minValue))
            {
              minValue = s;
              direction = 'south';
              move = [row + 1, col];
            }
          }
          if (locationExists(row - 1, col, rowSize, colSize, boardLayout)) 
          {
            n = tileValue[row - 1][col];
            if (minValue === -9 || (s !== -9 && s < minValue))
            {
              minValue = n;
              direction = 'north';
              move = [row - 1, col];
            }
          }
          if (locationExists(row, col - 1, rowSize, colSize, boardLayout)) 
          {
            w = tileValue[row][col - 1];
            if (minValue === -9 || (w !== -9 && w < minValue))
            {
              minValue = w;
              direction = 'west';
              move = [row, col - 1];
            }  
          }
          if (locationExists(row, col + 1, rowSize, colSize, boardLayout)) 
          {
            e = tileValue[row][col + 1];
            if (minValue === -9 || (e !== -9 && e < minValue))
            {
              minValue = e;
              direction = 'east';
              move = [row, col + 1];
            }
          }
          if (locationExists(row, col, rowSize, colSize, boardLayout))
          {
            x = tileValue[row][col];
            if (minValue === -9 || (x !== -9 && x < minValue))
            {
              minValue = x;
              direction = 'none';
              move = [row, col];
            }
          }

          //SUBTRACT OFF COMPLETED MOVE FROM TILE STRENGTH SO THE NEXT MONSTER TAKES IT INTO ACCOUNT
          moveSet.push(direction);
          tileValue[move[0]][move[1]]--;
          player++;
        }
        return moveSet;
      }, [])
    );

    // we are returning a timeout here to test limiting execution time on the sandbox side.
    return callback();
  })
}

//UPDATE: change it so that it checks if there is a valid path from 1 side of the board to another
//can be done by creating a value array and checking if there are spaces that weren't updated
function boardSegmented(boardLayout, midRow)
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

//UPDATE: please do this dynamically
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