const mongoose = require('mongoose');

// Test database connection
const connectTestDb = async () => {
  try {
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/portalberita_test';
    
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Test database connection error:', error);
    process.exit(1);
  }
};

// Clean test database
const cleanTestDb = async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('Test database cleaned');
  } catch (error) {
    console.error('Error cleaning test database:', error);
  }
};

// Disconnect test database
const disconnectTestDb = async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Error disconnecting test database:', error);
  }
};

// Drop test database
const dropTestDb = async () => {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('Test database dropped');
  } catch (error) {
    console.error('Error dropping test database:', error);
  }
};

// Setup test environment
const setupTestEnv = async () => {
  await connectTestDb();
  await cleanTestDb();
};

// Teardown test environment
const teardownTestEnv = async () => {
  await cleanTestDb();
  await disconnectTestDb();
};

module.exports = {
  connectTestDb,
  cleanTestDb,
  disconnectTestDb,
  dropTestDb,
  setupTestEnv,
  teardownTestEnv
};