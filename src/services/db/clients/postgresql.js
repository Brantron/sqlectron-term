import { Client } from 'pg';
import connectTunnel from '../tunnel';


export default function (serverInfo, databaseName) {
  return new Promise(async (resolve, reject) => {
    let connecting = true;

    let tunnel = null;
    if (serverInfo.ssh) {
      // create tunnel and connect to it
      try {
        tunnel = await connectTunnel(serverInfo);
      } catch (error) {
        connecting = false;
        return reject(error);
      }
    }

    // create database connection and connect to it

    const localPort = tunnel
      ? tunnel.address().port
      : 0;

    const client = new Client(
      _configDatabase(serverInfo, databaseName, localPort)
    );

    if (tunnel) {
      tunnel.on('error', error => {
        if (connecting) {
          connecting = false;
          return reject(error);
        }
      });
    }

    client.connect(err => {
      connecting = false;
      if (err) {
        client.end();
        return reject(err);
      }

      resolve({
        disconnect: () => disconnect(client),
        listTables: () => listTables(client),
        executeQuery: (query) => executeQuery(client, query),
        listDatabases: () => listDatabases(client),
      });
    });
  });
}


export function disconnect (client) {
  client.end();
}


export function listTables (client) {
  return new Promise((resolve, reject) => {
    const sql = `select table_name from information_schema.tables where table_schema = $1 order by table_name`;
    const params = [
      'public',
    ];
    client.query(sql, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows.map(row => row.table_name));
    });
  });
}


export function executeQuery (client, query) {
  return new Promise((resolve, reject) => {
    client.query(query, (err, data) => {
      if (err) return reject(err);
      resolve({
        command: data.command,
        rowCount: data.rowCount,
        rows: data.rows,
        fields: data.fields,
      });
    });
  });
}


export function listDatabases (client) {
  return new Promise((resolve, reject) => {
    const sql = `select datname from pg_database where datistemplate = $1 order by datname`;
    const params = [ false ];
    client.query(sql, params, (err, data) => {
      if (err) return reject(err);
      resolve(data.rows.map(row => row.datname));
    });
  });
}


function _configDatabase (serverInfo, databaseName, localPort) {
  const host = localPort
    ? '127.0.0.1'
    : serverInfo.host || serverInfo.socketPath;
  const port = localPort || serverInfo.port;

  const config = {
    host,
    port,
    user: serverInfo.user,
    password: serverInfo.password,
    database: databaseName,
  };

  return config;
}
