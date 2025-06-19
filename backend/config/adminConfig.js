/**
 * Admin Configuration File
 * This file contains the default admin credentials.
 * In a production environment, these should be stored as environment variables.
 */

const adminConfig = {
  // Default admin credentials (should be overridden by environment variables in production)
  username: process.env.ADMIN_USERNAME || 'admin@ikc.com',
  password: process.env.ADMIN_PASSWORD || 'admin123456',
  
  // Function to update admin credentials (can be used by admin users to change credentials)
  updateCredentials: (newUsername, newPassword) => {
    // In a real implementation, this would update environment variables or a secure storage
    // For now, we'll just log that this was attempted
    console.log('Admin credentials update attempted. In a production environment, this would update secure storage.');
    console.log(`New username: ${newUsername}, New password: [REDACTED]`);
    
    // This is just a placeholder - in a real implementation, you would update the credentials
    // in a secure way, possibly by updating environment variables or a secure database
    return true;
  }
};

module.exports = adminConfig;