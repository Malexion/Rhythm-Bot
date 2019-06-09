
import { CommandMap } from './command-map';

import * as readline from 'readline';
import * as minimist from 'minimist';

export class ConsoleReader {
    commands: CommandMap;

    constructor() {
        this.commands = new CommandMap();
    }
    
    listen() {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', input => {
            if(!input) return;
            let parts = input.split(' ');
            let result = minimist(parts);
            if(this.commands.has(result._[0])) {
                let cmds = this.commands[result._[0]];
                cmds.forEach(cmd => cmd(result));
            }
        });
    }

}
