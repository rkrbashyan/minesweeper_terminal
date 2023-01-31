export class Cell {
    row: number;
    col: number;
    value: number;
    isRevealed: boolean;
    isFlagged: boolean;

    constructor(row: number, col: number, value = 0, isRevealed = false, isFlagged = false) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.isRevealed = isRevealed;
        this.isFlagged = isFlagged;
    }

    get isMine() {
        return this.value === -1;
    }

    set isMine(_) {
        this.value = -1;
    }
}

export class MinesweeperBoard {
    rows: number;
    cols: number;
    mines: number;
    grid: Cell[][] = [];

    constructor(rows: number, cols: number, mines: number) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;

        this.setupBoard();
    }

    setupBoard() {
        this.grid = [];

        for (let row = 0; row < this.rows; row++) {
            this.grid.push([]);
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = new Cell(row, col);
            }
        }

        this.#setMines();
        this.#updateCellsValues();
    }

    resetBoard() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].isRevealed = false;
                this.grid[row][col].isFlagged = false;
            }
        }
    }

    #setMines() {
        const indices = Array.from({ length: this.rows * this.cols }, (_, i) => i);
        let mines = 0;

        while (mines < this.mines) {
            const index = Math.floor(Math.random() * indices.length);
            const row = Math.floor(indices[index] / this.cols);
            const col = indices[index] - row * this.cols;

            this.grid[row][col].isMine = true;
            indices.splice(index, 1);
            mines++;
        }
    }

    #updateCellsValues() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (!cell.isMine) {
                    cell.value = this.#getAdjustedCells(cell).reduce((count, cell) => count + (cell.isMine ? 1 : 0), 0);
                }
            }
        }
    }

    #getAdjustedCells(cell: Cell): Cell[] {
        const adjustedCells: Cell[] = [];
        const { row, col } = cell;

        for (let i of [-1, 0, 1]) {
            for (let j of [-1, 0, 1]) {
                if (
                    (i === 0 && j === 0) ||
                    row + i < 0 ||
                    row + i > this.rows - 1 ||
                    col + j < 0 ||
                    col + j > this.cols - 1
                )
                    continue;

                adjustedCells.push(this.grid[row + i][col + j]);
            }
        }

        return adjustedCells;
    }

    revealCell(cell: Cell) {
        if (!cell.isRevealed && !cell.isFlagged) {
            cell.isRevealed = true;

            if (cell.isMine) {
                // lost - end game
                return;
            }

            if (cell.value === 0) {
                // reveal adjusted cells
                this.#getAdjustedCells(cell).forEach((cell) => this.revealCell(cell));
            }
        }
    }

    flagCell(cell: Cell) {
        if (!cell.isRevealed) {
            cell.isFlagged = !cell.isFlagged;
        }
    }

    get stats() {
        let revealed = 0;
        let flagged = 0;
        let isLost = false;
        let isWin = false;
        let isPlaying = true;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].isRevealed) revealed++;
                if (this.grid[row][col].isFlagged) flagged++;

                // game over - revealed mine
                if (this.grid[row][col].isRevealed && this.grid[row][col].isMine) isLost = true;
            }
        }

        // game over - win
        isWin = flagged === this.mines && revealed + flagged === this.rows * this.cols;

        // playing
        isPlaying = !isWin && !isLost;

        return {
            revealed,
            flagged,
            isLost,
            isWin,
            isPlaying,
        };
    }
}
