import nodemailer from 'nodemailer';
import { env } from './env.js';


const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE === 'true',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

/**
 * Send password recovery email
 * @param {string} to - Recipient email
 * @param {string} password - User password
 * @param {string} userName - User name
 */
export async function sendPasswordRecoveryEmail(to, password, userName = 'User') {
  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
    to,
    subject: 'Password Recovery - AdondeVamos',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .password { background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { color: #ff9800; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Recovery</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>We received a request to recover your password. Here are your account credentials:</p>
              <div class="password">
                <strong>Password:</strong> ${password}
              </div>
              <p class="warning">⚠️ For security reasons, please change your password after logging in.</p>
              <p>If you did not request this, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AdondeVamos. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password recovery email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password recovery email:', error);
    throw new Error('Failed to send recovery email');
  }
}

/**
 * Send Create Account email
 * @param {string} to - Recipient email
 * @param {string} userName - User name
 * @param {string} tag - User tag
 */
export async function sendCreateAccountEmail(to, 
  tag, 
  userName = 'User', 
  Ubication = '') {
  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
    to,
    subject: 'Account Created - AdondeVamos',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4c79adff; color: white; padding: 20px; text-align: center; }
            .content { background-color: #e8ebc3ff; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .info { background-color: #b9f5e6ff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { color: #ff9800; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AdondeVamos</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Your account has been successfully created. Here are your account details:</p>
              <div class="info">
                <strong>Tag:</strong> ${tag}<br/>
                <strong>Ubication:</strong> ${Ubication}
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AdondeVamos. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Create New User Account email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending Create New User Account email:', error);
    throw new Error('Failed to send Create New User Account email');
  }
}

export default transporter;