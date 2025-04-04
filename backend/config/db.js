const mongoose = require('mongoose');
const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') return; // Skip connection if in test
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portalberita');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }
};
module.exports = connectDB;
