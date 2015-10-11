import { combineReducers } from 'redux';


export default combineReducers({
  addServer: require('./add-server'),
  connection: require('./connection'),
  query: require('./query'),
  updateServer: require('./update-server'),
  status: require('./status'),
  servers: require('./servers'),
  shortcuts: require('./shortcuts'),
  tables: require('./tables'),
});
