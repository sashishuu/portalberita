const mongoose = require('mongoose');

let isConnected = false;

async function connectTestDB(uri) {
  if (isConnected) return;
  await mongoose.connect(uri);
  isConnected = true;
}

async function disconnectTestDB() {
  if (!isConnected) return;
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  isConnected = false;
}

module.exports = {
  connectTestDB,
  disconnectTestDB
};
