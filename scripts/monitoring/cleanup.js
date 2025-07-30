const fs = require('fs');
const path = require('path');
const { cleanupOldFiles } = require('../utils/uploadHandler');

// Cleanup script for old uploaded files
const runCleanup = async () => {
  console.log('Starting cleanup process...');
  
  try {
    // Clean up temporary files older than 1 hour
    const tempCleanup = await cleanupOldFiles('uploads/temp', 60 * 60 * 1000);
    console.log(`Cleaned ${tempCleanup} temporary files`);
    
    // Clean up old log files (optional)
    if (fs.existsSync('logs')) {
      const logCleanup = await cleanupOldFiles('logs', 7 * 24 * 60 * 60 * 1000); // 7 days
      console.log(`Cleaned ${logCleanup} old log files`);
    }
    
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

// Run cleanup if called directly
if (require.main === module) {
  runCleanup();
}

module.exports = runCleanup;