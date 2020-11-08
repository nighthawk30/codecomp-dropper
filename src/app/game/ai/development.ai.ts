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
  const boardLayout = gameState.tileStates;
  const possibleMoves = [];
  turn++;

  return new Promise((resolve, reject) => {
    const callback = () => resolve(
      myTeam.reduce((moveSet, member) => {
        if (member.isDead) {
          moveSet.push('none');
        }
        else
        {
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
          if (boardLayout[row][col] > 1)
          {
            possibleMoves.push('none');
          }
          //SUBTRACT OFF COMPLETED MOVE FROM TILE STRENGTH SO THE NEXT MONSTER TAKES IT INTO ACCOUNT
          moveSet.push(possibleMoves[Math.floor(Math.random() * possibleMoves.length)]);
          
          possibleMoves.length = 0;
        }
        return moveSet;
      }, [])
    );

    // we are returning a timeout here to test limiting execution time on the sandbox side.
    return callback();
  })
}

`;//NO TOUCH THIS LINE