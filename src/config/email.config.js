import { Resend } from 'resend';
import { env } from './env.js';
import { loadTemplate } from './template.loader.js';

const resend = new Resend(env.RESEND_API);

/**
 * Send password reset link email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 * @param {string} userName - User name
 */
export async function sendPasswordResetLinkEmail(to, resetLink, userName = 'User') {
  const htmlContent = loadTemplate('password-reset-link', { userName, resetLink });

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
  const htmlContent = loadTemplate('password-recovery', { userName, password });

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
 * @param {string} tag - User tag
 * @param {string} userName - User name
 * @param {string} Ubication - User location
 */
export async function sendCreateAccountEmail(to, tag, userName = 'User', Ubication = '') {
  const htmlContent = loadTemplate('create-account', { userName, tag, ubication: Ubication });

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
  const htmlContent = loadTemplate('added-to-trip', { userName, tripName, ownerName, ownerTag });

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
  const htmlContent = loadTemplate('removed-from-trip', { userName, tripName, ownerName, ownerTag });

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
  const htmlContent = loadTemplate('confirm-email', { userName, confirmationUrl });

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
