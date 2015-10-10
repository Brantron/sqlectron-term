let connecting = false;
let connection = null;


export async function connect (serverInfo, databaseName) {
  if (connecting) throw new Error('connecting to server');

  try {
    connecting = true;

    if (connection) connection.disconnect();

    const driver = require(`./clients/${serverInfo.client}`).default;

    connection = await driver(serverInfo, databaseName);
  } catch (err) {
    throw err;
  } finally {
    connecting = false;
  }
}


export async function listTables () {
  if (connecting || !connection) throw new Error('connecting to server');
  return await connection.listTables();
}
