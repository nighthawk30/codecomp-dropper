`
function main(gameState, side)
{
  const myTeam = gameState.teamStates[side];
  const possibleMoves = [];
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
          const [row, col] = member.coord;
          if (row > 0 && boardLayout[row - 1][col] > 1)
          {
            possibleMoves.push('north');
          }
          if (row < rowSize - 1 && boardLayout[row + 1][col] > 1)
          {
            possibleMoves.push('south');
          }
          if (col > 0 && boardLayout[row][col - 1] > 1)
          {
            possibleMoves.push('west');
          }
          if (col < colSize - 1 && boardLayout[row][col + 1] > 1)
          {
            possibleMoves.push('east');
          }
          if (boardLayout[row][col] > 1)
          {
            possibleMoves.push('none');
          }

          let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          //remove strength from chosen tile - so collisions dont occur
          switch(move)
          {
            case 'north':
              boardLayout[row - 1][col]--;
              break;
            case 'south':
              boardLayout[row + 1][col]--;
              break;
            case 'west':
              boardLayout[row][col - 1]--;
              break;
            case 'east':
              boardLayout[row][col + 1]--;
              break;
            case 'none':
              boardLayout[row][col]--;
              break;
          }
          moveSet.push(move);
          possibleMoves.length = 0;
        }
        return moveSet;
      }, [])
    );

    callback();
  })
}`;