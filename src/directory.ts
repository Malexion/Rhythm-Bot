
import * as path from 'path';
import * as fs from 'fs';

export const directory = path.resolve(__dirname, '..');

export const requireFile = (...args: string[]) => {
    return require(path.resolve(directory, ...args));
};

export const readFile = (...args: string[]) => {
    return fs.readFileSync(path.resolve(directory, ...args), { encoding: 'utf8' }); 
};

export const readDir = (...args: string[]) => {
    return fs.readdirSync(path.resolve(directory, ...args)); 
};

export const writeFile = (data: any, ...args: string[]) => {
    return fs.writeFileSync(path.resolve(directory, ...args), data, { encoding: 'utf8' }); 
};

export const appendFile = (data: any, ...args: string[]) => {
    return fs.appendFileSync(path.resolve(directory, ...args), data, { encoding: 'utf8' });
};

export const deleteFile = (...args: string[]) => {
    return fs.unlinkSync(path.resolve(directory, ...args));
};
