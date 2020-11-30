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
}
`;