import { Resend } from 'resend';
import { env } from './env.js';

const resend = new Resend(env.RESEND_API);

/**
 * Send password reset link email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 * @param {string} userName - User name
 */
export async function sendPasswordResetLinkEmail(to, resetLink, userName = 'User') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
          .button-container { text-align: center; margin: 30px 0; }
          .reset-button { 
            background-color: #4CAF50; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            font-weight: bold;
          }
          .reset-button:hover { background-color: #45a049; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { color: #ff9800; font-weight: bold; }
          .expiry-note { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password for your AdondeVamos account.</p>
            <p>Click the button below to reset your password:</p>
            <div class="button-container">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <div class="expiry-note">
              <strong>⏰ Note:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p class="warning">⚠️ If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
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
      subject: 'Password Reset - AdondeVamos',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send reset email');
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    throw new Error('Failed to send reset email');
  }
}

/**
 * Send password recovery email (deprecated - use sendPasswordResetLinkEmail)
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

    
    return { success: true, messageId: data.id };
  } catch (error) {
    
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

/**
 * Send email when user is added to a trip
 * @param {string} to - Recipient email
 * @param {string} userName - User name
 * @param {string} tripName - Trip name
 * @param {string} ownerName - Owner name
 * @param {string} ownerTag - Owner tag
 */
export async function sendAddedToTripEmail(to, userName, tripName, ownerName, ownerTag) {
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've Been Added to a Trip!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You have been added as a member to the following trip:</p>
            <div class="info">
              <strong>Trip:</strong> ${tripName}<br/>
              <strong>Added by:</strong> ${ownerName} (@${ownerTag})
            </div>
            <p>Add your plans, photos and memories too! 🌍✈️</p>
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
      subject: `You've been added to trip "${tripName}" - AdondeVamos`,
      html: htmlContent
    });

    if (error) {
      console.error('Error sending added to trip email:', error);
      return { success: false, error };
    }

    console.log('Added to trip email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending added to trip email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when user is removed from a trip
 * @param {string} to - Recipient email
 * @param {string} userName - User name
 * @param {string} tripName - Trip name
 * @param {string} ownerName - Owner name
 * @param {string} ownerTag - Owner tag
 */
export async function sendRemovedFromTripEmail(to, userName, tripName, ownerName, ownerTag) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
          .info { background-color: #fff; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've Been Removed from a Trip</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You have been removed as a member from the following trip:</p>
            <div class="info">
              <strong>Trip:</strong> ${tripName}<br/>
              <strong>Removed by:</strong> ${ownerName} (@${ownerTag})
            </div>
            <p>If you have any questions, please contact the trip organizer.</p>
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
      subject: `You've been removed from trip "${tripName}" - AdondeVamos`,
      html: htmlContent
    });

    if (error) {
      console.error('Error sending removed from trip email:', error);
      return { success: false, error };
    }

    console.log('Removed from trip email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending removed from trip email:', error);
    return { success: false, error };
  }
}

/**
 * Send email confirmation link
 * @param {string} to - Recipient email
 * @param {string} userName - User name
 * @param {string} confirmationToken - Confirmation token (UUID)
 */
export async function sendEmailConfirmationEmail(to, userName, confirmationToken) {
  const confirmationUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email?token=${confirmationToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4c79adff; color: white; padding: 20px; text-align: center; }
          .content { background-color: #e8ebc3ff; padding: 20px; border-radius: 5px; margin-top: 20px; }
          .button { background-color: #52B788; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #3D8B66; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { color: #ff9800; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirm Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for creating an account with AdondeVamos! To complete your registration, please confirm your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">${confirmationUrl}</p>
            <p class="warning">⚠️ This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
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
      subject: 'Confirm Your Email Address - AdondeVamos',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending email confirmation:', error);
      return { success: false, error };
    }

    console.log('Email confirmation sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending email confirmation:', error);
    return { success: false, error };
  }
}

export default resend;