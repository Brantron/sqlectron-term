import fs from 'fs';
import path from 'path';
import validator from 'is-my-json-valid';

import { homedir } from '../utils';

const serversValidate = validator(require('./servers.schema.json'));


export async function loadServerListFromFile () {
  const filename = path.join(homedir(), '.sqlectron.json');
  if (!await fileExists(filename)) {
    await createFile(filename, { servers: [] });
  }
  const result = await readFile(filename);
  if (!serversValidate(result)) {
    throw new Error('Invalid ~/.sqlectron.json file format');
  }
  return result;
}


function fileExists (filename) {
  return new Promise(resolve => {
    fs.stat(filename, (err, stats) => {
      if (err) return resolve(false);
      resolve(stats.isFile());
    });
  });
}


function createFile (filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);
      resolve();
    });
  });
}


function readFile (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
}
