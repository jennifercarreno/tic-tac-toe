import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gamecontext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";


// frontend
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Arial";
  position: relative;
  padding:100px;
 
`;

const RowContainer = styled.div`
  width: 100%;
  display: flex;
  
`;

interface ICellProps {
  borderTop?: boolean;
  borderRight?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
}

const Cell = styled.div<ICellProps>`
  width: 13em;
  height: 9em;
  display: flex;
  align-items: center;
  justify-content: center;
  
  cursor: pointer;
  border-top: ${({ borderTop }) => borderTop && "3px solid #eb0790"};
  border-left: ${({ borderLeft }) => borderLeft && "3px solid #eb0790"};
  border-bottom: ${({ borderBottom }) => borderBottom && "3px solid #eb0790"};
  border-right: ${({ borderRight }) => borderRight && "3px solid #eb0790"};
  transition: all 270ms ease-in-out;
  &:hover {
    background-color: #F8C8DC;
  }
`;

const PlayStopper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 99;
  cursor: default;
`;

const X = styled.span`
  font-size: 100px;
  color: #eb0790;
  &::after {
    content: "X";
  }
`;

const O = styled.span`
  font-size: 100px;
  color: #eb0790;
  &::after {
    content: "O";
  }
`;

// game
export type IPlayMatrix = Array<Array<string | null>>;

export interface IStartGame {
    start: boolean;
    symbol: "x" | "o";
}

export function Game() {
    const [matrix, setMatrix] = useState<IPlayMatrix>([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);

    const {playerSymbol, setPlayerSymbol, isPlayerTurn, setPlayerTurn, isGameStarted, setGameStarted} = useContext(gameContext);

    const checkGameState = (matrix: IPlayMatrix) => {
      for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix[i].length; j++) {
          row.push(matrix[i][j]);
        }
  
        // checks for horizontal game win
        if (row.every((value) => value && value === playerSymbol)) {
          return [true, false];
        } else if (row.every((value) => value && value !== playerSymbol)) {
          return [false, true];
        }
      }
  
      for (let i = 0; i < matrix.length; i++) {
        let column = [];
        for (let j = 0; j < matrix[i].length; j++) {
          column.push(matrix[j][i]);
        }
  
        // checks for vertical game win
        if (column.every((value) => value && value === playerSymbol)) {
          return [true, false];
        } else if (column.every((value) => value && value !== playerSymbol)) {
          return [false, true];
        }
      }
  
      // diagonal game wins
      if (matrix[1][1]) {
        if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
          if (matrix[1][1] === playerSymbol) return [true, false];
          else return [false, true];
        }
  
        if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
          if (matrix[1][1] === playerSymbol) return [true, false];
          else return [false, true];
        }
      }
  
      //Check for a tie
      if (matrix.every((m) => m.every((v) => v !== null))) {
        return [true, true];
      }
  
      return [false, false];
    };

    const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
      const newMatrix = [...matrix];
  
      // places symbol on board
      if (newMatrix[row][column] === null || newMatrix[row][column] === "null") {
        newMatrix[row][column] = symbol;
        setMatrix(newMatrix);
      }
  
      if (socketService.socket) {
        gameService.updateGame(socketService.socket, newMatrix);
        const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix);
        if (currentPlayerWon && otherPlayerWon) {
          gameService.GameWin(socketService.socket, "The Game is a TIE!");
          alert("The Game is a TIE!");
        } else if (currentPlayerWon && !otherPlayerWon) {
          gameService.GameWin(socketService.socket, "You Lost!");
          alert("You Won!");
        }
  
        setPlayerTurn(false);
      }
    };

    const handleGameUpdate = () => {
      if (socketService.socket)
        gameService.onGameUpdate(socketService.socket, (newMatrix) => {
          setMatrix(newMatrix);
          setPlayerTurn(false);
          checkGameState(newMatrix);

        });
    };

    const handleGameWin = () => {
      if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message) => {
        console.log("Here", message);
        setPlayerTurn(false);
        alert(message);
      });
    }
  
    const handleGameStart = () => {

      if (socketService.socket){
        gameService.onStartGame(socketService.socket, (options) => {
          // game starts
          setGameStarted(true);
          // symbol is set
          setPlayerSymbol(options.symbol);
          // turns are assigned
          if (options.start) setPlayerTurn(false);
          else setPlayerTurn(true);
        });
      }
      
      
    };

    useEffect(() => {
        handleGameUpdate();
        handleGameStart();
        handleGameWin();
        
    });



    return <GameContainer>
        {!isGameStarted && (
        <h2>Waiting for Other Player...game has not started</h2>
      )}
      {(!isGameStarted || !isPlayerTurn) && <PlayStopper />}
        {matrix.map((row, rowIdx) => {
            return (<RowContainer>
                {row.map((column, columnIdx) => (
                  <Cell
                    borderRight={columnIdx < 2}
                    borderLeft={columnIdx > 0}
                    borderBottom={rowIdx < 2}
                    borderTop={rowIdx > 0}
                    onClick = {() => updateGameMatrix(columnIdx, rowIdx, playerSymbol)}
                    
                  >
                    {column && column !== "null" ? (
                      column === "x" ? (
                        <X />
                      ) : (
                        <O />
                      )
                    ) : null}
                  </Cell>
                ))}
              </RowContainer>)
        })}
    </GameContainer>
}