import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { MinesweeperBoard } from './mineSweeperBoard.js';

const CONSOLE_ESCAPE = {
    HIDE_CURSOR: '\u001B[?25l',
    SHOW_CURSOR: '\u001B[?25h',
    CLEAR_SCREEN: '\u001b[2J',
    CLEAR_LINE: '\u001b[K',
    NEW_LINE: '\u000A',
    TEXT_CYAN: '\u001b[36m',
    RESET_COLOR: '\x1b[0m',
    CURRENT_BG: '\x1b[45m', // magenta
    CURSOR_POS: (row, col) => `\u001b[${row};${col}H`,
};

const ICONS = {
    MINE: '💣',
    FLAG: '🚩',
    REVEALED: '🔘',
    UNREVEALED: '⬜️',
    1: '1️⃣ ',
    2: '2️⃣ ',
    3: '3️⃣ ',
    4: '4️⃣ ',
    5: '5️⃣ ',
    6: '6️⃣ ',
    7: '7️⃣ ',
    8: '8️⃣ ',
};

export class MinesweeperTerminal {
    rows: number;
    cols: number;
    mines: number;
    currentRow = 1;
    currentCol = 1;
    board: MinesweeperBoard;

    constructor(rows = 8, cols = 8, mines = 10) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = new MinesweeperBoard(this.rows, this.cols, this.mines);

        output.write(CONSOLE_ESCAPE.HIDE_CURSOR);
        this.clearScreen();
        this.run();
    }

    run() {
        readline.emitKeypressEvents(input);
        if (input.isTTY) input.setRawMode(true);

        input.on('keypress', (str, key) => {
            if (key.ctrl) {
                switch (key.name) {
                    case 'c':
                        this.exitGame();
                    case 'n':
                        this.newGame();
                        break;
                    case 'r':
                        this.replayGame();
                        break;
                    default:
                        break;
                }
            } else if (this.board.stats.isPlaying) {
                switch (key.name) {
                    case 'w':
                    case 'up': {
                        this.currentRow = this.currentRow === 1 ? this.rows : this.currentRow - 1;
                        this.render();
                        break;
                    }
                    case 's':
                    case 'down': {
                        this.currentRow = this.currentRow === this.rows ? 1 : this.currentRow + 1;
                        this.render();
                        break;
                    }
                    case 'a':
                    case 'left': {
                        this.currentCol = this.currentCol === 1 ? this.cols : this.currentCol - 1;
                        this.render();
                        break;
                    }
                    case 'd':
                    case 'right': {
                        this.currentCol = this.currentCol === this.cols ? 1 : this.currentCol + 1;
                        this.render();
                        break;
                    }
                    case 'f':
                    case 'space': {
                        this.board.flagCell(this.board.grid[this.currentRow - 1][this.currentCol - 1]);
                        this.render();
                        break;
                    }
                    case 'r':
                    case 'return': {
                        this.board.revealCell(this.board.grid[this.currentRow - 1][this.currentCol - 1]);
                        this.render();
                        break;
                    }
                    default:
                        break;
                }
            }
        });

        this.render();
    }

    render() {
        this.moveCursor(1, 1);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board.grid[row][col];

                output.write(CONSOLE_ESCAPE.RESET_COLOR);

                if (row === this.currentRow - 1 && col === this.currentCol - 1) {
                    output.write(CONSOLE_ESCAPE.CURRENT_BG);
                }

                if (cell.isRevealed && cell.isMine) {
                    output.write(ICONS.MINE);
                } else if (cell.isRevealed) {
                    output.write(cell.value === 0 ? ICONS.REVEALED : ICONS[cell.value]);
                } else if (cell.isFlagged) {
                    output.write(ICONS.FLAG);
                } else {
                    output.write(ICONS.UNREVEALED);
                }
            }
            output.write(CONSOLE_ESCAPE.NEW_LINE);
        }

        const stats = this.board.stats;

        this.outputInfo(`Flagged: ${stats.flagged}`);
        this.outputInfo(`Revealed: ${stats.revealed}`);
        this.outputInfo(`Mines: ${this.mines}`);
        this.outputInfo(
            `Status: ${
                stats.isWin ? 'WIN' : stats.isLost ? 'LOST, New: CTRL-N, Replay: CTRL-R, Exit: CTRL-C' : 'PLAYING'
            }`
        );
    }

    outputInfo(str: string) {
        output.write(CONSOLE_ESCAPE.RESET_COLOR);
        output.write(CONSOLE_ESCAPE.CLEAR_LINE);
        output.write(`${CONSOLE_ESCAPE.TEXT_CYAN}${str}\n`);
    }

    clearScreen() {
        output.write(CONSOLE_ESCAPE.CLEAR_SCREEN);
    }

    moveCursor(row: number, col: number) {
        output.write(CONSOLE_ESCAPE.CURSOR_POS(row, col));
    }

    exitGame() {
        this.clearScreen();
        this.moveCursor(1, 1);
        output.write(CONSOLE_ESCAPE.SHOW_CURSOR);
        process.exit();
    }

    newGame() {
        this.currentRow = 1;
        this.currentCol = 1;
        this.board.setupBoard();
        this.render();
    }

    replayGame() {
        this.currentRow = 1;
        this.currentCol = 1;
        this.board.resetBoard();
        this.render();
    }
}
