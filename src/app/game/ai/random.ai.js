function main(gameState, side)
{
  const myTeam = gameState.teamStates[side];
  const [rowSize, colSize] = gameState.boardSize;
  let boardLayout = gameState.tileStates;//the strength of every tile on the board

  return new Promise((resolve, reject) => {
    const callback = () => resolve(
      myTeam.reduce((moveSet, member) => {
        if (member.isDead)
        {
          moveSet.push('none');
        }
        else 
        {
          const [rpos, cpos] = member.coord;
          let direction = 'none';
          let bestMove = 0;
          let n = 0;
          let s = 0;
          let e = 0;
          let w = 0;
          let x = 0;

          if (locationExists(rpos, cpos - 1, rowSize, colSize, boardLayout))
          {
            n = countSpaces(rpos, cpos - 1, rowSize, colSize, boardLayout);
            if (n >= bestMove)
            {
              direction = 'north';
              bestMove = n;
            }
          }
          if (locationExists(rpos, cpos + 1, rowSize, colSize, boardLayout))
          {
            s = countSpaces(rpos, cpos + 1, rowSize, colSize, boardLayout);
            if (s >= bestMove)
            {
              direction = 'south';
              bestMove = s;
            }
          }
          if (locationExists(rpos - 1, cpos, rowSize, colSize, boardLayout))
          {
            e = countSpaces(rpos - 1, cpos, rowSize, colSize, boardLayout);
            if (e >= bestMove)
            {
              direction = 'east';
              bestMove = e;
            }
          }
          if (locationExists(rpos + 1, cpos, rowSize, colSize, boardLayout))
          {
            w = countSpaces(rpos + 1, cpos, rowSize, colSize, boardLayout);
            if (w >= bestMove)
            {
              direction = 'west';
              bestMove = w;
            }
          }
          if (locationExists(rpos, cpos, rowSize, colSize, boardLayout))
          {
            x = countSpaces(rpos, cpos, rowSize, colSize, boardLayout);
            if (x >= bestMove)
            {
              direction = 'none';
              bestMove = x;
            }
          }
          let move = direction;
          //remove strength from chosen tile - so collisions dont occur
          switch(move)
          {
            case 'north':
              boardLayout[rpos - 1][cpos]--;
              break;
            case 'south':
              boardLayout[rpos + 1][cpos]--;
              break;
            case 'west':
              boardLayout[rpos][cpos - 1]--;
              break;
            case 'east':
              boardLayout[rpos][cpos + 1]--;
              break;
            case 'none':
              boardLayout[rpos][cpos]--;
              break;
          }
          moveSet.push(move);
        }
        return moveSet;
      }, [])
    );

    callback();
  })
}

//recursively find the value of all tiles - start it at the most valuble tiles
function valueRecursion(rpos, cpos, rowSize, colSize, boardLayout, tileValue)
{
  if (locationExists(rpos, cpos, rowSize, colSize, boardLayout))
  {
    //check if there are
    //for all surrounding tiles, if they are on the board
    if (locationExists(rpos + 1, cpos, rowSize, colSize, boardLayout))
    {
      if (tileValue[rpos + 1][cpos] === 0)
      {
        tileValue[rpos + 1][cpos] = 1;
        valueRecursion(rpos + 1, cpos, rowSize, colSize, boardLayout, tileValue);
      }
    }
    if (locationExists(rpos - 1, cpos, rowSize, colSize, boardLayout))
    {
      if (tileValue[rpos - 1][cpos] === 0)
      {
        tileValue[rpos - 1][cpos] = 1;
        valueRecursion(rpos - 1, cpos, rowSize, colSize, boardLayout, tileValue);
      }
    }
    if (locationExists(rpos, cpos + 1, rowSize, colSize, boardLayout))
    {
      if (tileValue[rpos][cpos + 1] === 0)
      {
        tileValue[rpos][cpos + 1] = 1;
        valueRecursion(rpos, cpos + 1, rowSize, colSize, boardLayout, tileValue);
      }
    }
    if (locationExists(rpos, cpos - 1, rowSize, colSize, boardLayout))
    {
      if (tileValue[rpos][cpos - 1] === 0)
      {
        tileValue[rpos][cpos - 1] = 1;
        valueRecursion(rpos, cpos - 1, rowSize, colSize, boardLayout, tileValue);
      } 
    }
  }
}

function countSpaces(rpos, cpos, rowSize, colSize, boardLayout)
{
  let tileValue = [];
  let spaceCount = 0;
  //Build Tile Value board
  for(let i = 0; i < rowSize; i++)
  {
    tileValue.push([]);
    for(let j = 0; j < colSize; j++)
    {
      tileValue[i].push(0);//0 means it has not been visited
    }
  }
  valueRecursion(rpos, cpos, rowSize, colSize, boardLayout, tileValue)
  //Count tiles with 1
  for (let i = 0; i < rowSize; i++)
  {
    for(let j = 0; j < colSize; j++)
    {
      if (tileValue[i][j] === 1)
      {
        spaceCount++;
      }
    }
  }
  return spaceCount;
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