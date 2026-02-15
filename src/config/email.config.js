import { Resend } from 'resend';
import { env } from './env.js';

const resend = new Resend(env.RESEND_API);

/**
 * Send password recovery email
 * @param {string} to - Recipient email
 * @param {string} password - User password
 * @param {string} userName - User name
 */
export async function sendPasswordRecoveryEmail(to, password, userName = 'User') {
  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      to: [to],
      subject: 'Password Recovery - AdondeVamos',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending password recovery email:', error);
      throw new Error('Failed to send recovery email');
    }

    console.log('Password recovery email sent:', data.id);
    return { success: true, messageId: data.id };
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
  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      to: [to],
      subject: 'Account Created - AdondeVamos',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending Create New User Account email:', error);
      throw new Error('Failed to send Create New User Account email');
    }

    console.log('Create New User Account email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending Create New User Account email:', error);
    throw new Error('Failed to send Create New User Account email');
  }
}

export default resend;