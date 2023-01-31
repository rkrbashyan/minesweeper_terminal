import { MinesweeperTerminal } from './mineSweeperTerminal.js';
import { env } from 'node:process';

switch (env.LEVEL) {
    case 'easy':
        new MinesweeperTerminal(8, 8, 10);
        break;
    case 'medium':
        new MinesweeperTerminal(16, 16, 40);
        break;
    case 'hard':
        new MinesweeperTerminal(16, 30, 99);
        break;
    default:
        new MinesweeperTerminal();
}
