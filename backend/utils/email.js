const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"Portal Berita" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Portal Berita',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Portal Berita</h1>
            <p style="color: #666; font-size: 16px;">Verify Your Email Address</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Portal Berita!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Portal Berita. To complete your registration and start reading the latest news, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't create an account with Portal Berita, please ignore this email.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Portal Berita" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Portal Berita',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Portal Berita</h1>
            <p style="color: #666; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your Portal Berita account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Portal Berita" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Portal Berita!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Portal Berita</h1>
            <p style="color: #666; font-size: 16px;">Welcome to Our Community!</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Portal Berita! Your email has been successfully verified and your account is now active.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can now:
            </p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 20px;">
              <li>Read the latest news and articles</li>
              <li>Comment on articles and engage with the community</li>
              <li>Create and publish your own articles</li>
              <li>Customize your reading preferences</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Start Reading
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>Thank you for joining Portal Berita!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't throw error for welcome email as it's not critical
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};