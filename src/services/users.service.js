import usersRepository from "../repositories/users.repository.js";
import PasswordResetsRepository from "../repositories/password-resets.repository.js";
import ubicationService from './ubication.service.js';
import { userClient } from "../config/supabase.js";
import { matchUbicationNames } from "../mappers/ubication.mapper.js";
import { sendPasswordRecoveryEmail, sendPasswordResetLinkEmail, sendCreateAccountEmail, sendEmailConfirmationEmail } from '../config/email.config.js'
import tripsService from './trips.service.js';
import VotesRepository from "../repositories/votes.repository.js";
import { votesClient } from "../config/supabase.js";
import { hashPassword, comparePassword, generateTemporaryPassword, generateResetToken } from '../utils/password.js';
import { env } from '../config/env.js';
import exceptions from '../middleware/exceptions.middleware.js';
import sharp from 'sharp';

const usersRepositoryInstance = new usersRepository({ userClient });
const passwordResetsRepositoryInstance = new PasswordResetsRepository({ userClient });
const votesRepositoryInstance = new VotesRepository({ votesClient });

/**
 * Attaches ubication names (country, state, city) to a list of user rows.
 * @param {Object[]} rows - User rows containing countryid, stateid and cityid
 * @returns {Promise<Object[]>} Rows with Country, State and City objects
 */
const withUbicationNames = async (rows) => {
  const ubicationNames = await ubicationService.getUbicationNamesByIDs(rows);
  return matchUbicationNames({ data: rows }, { data: ubicationNames }).data;
};

const usersService = {
  async getUserById(userId, fields = "name, lastname, email, tag, countryid, stateid, cityid, profile_photo, profile_photo_tn") {
    const users = await usersRepositoryInstance.getUserById(userId, fields);
    return await withUbicationNames(users);
  },

  async getUserByIdWithTrips(userId, fields = "name, lastname, email, tag, countryid, stateid, cityid, profile_photo, profile_photo_tn") {
    // Get user info
    const users = await usersRepositoryInstance.getUserById(userId, fields);
    const userWithUbicationNames = await withUbicationNames(users);

    // Get last 3 trips created by this user
    const tripsResult = await tripsService.searchTrips({ ownerid: userId });
    const userTrips = (tripsResult?.data ?? [])
      .sort((a, b) => new Date(b.initialdate) - new Date(a.initialdate))
      .slice(0, 3);

    return {
      ...(userWithUbicationNames[0] ?? {}),
      recentTrips: userTrips
    };
  },
  async recoverPassword(email) {
    // Get user data
    const users = await usersRepositoryInstance.getUserByEmail(email);
    
    if (!users || users.length === 0) {
      throw exceptions.notFound("User not found");
    }

    const user = users[0];
    
    // Generate secure reset token
    const resetToken = generateResetToken();
    
    // Set token expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Delete any existing tokens for this user
    await passwordResetsRepositoryInstance.deleteUserResetTokens(user.id);
    
    // Save reset token to database
    const createdToken = await passwordResetsRepositoryInstance.createResetToken(
      user.id,
      email,
      resetToken,
      expiresAt.toISOString()
    );
    
    if (!createdToken) {
      console.error('Failed to create reset token');
      throw exceptions.internal("Failed to create reset token");
    }
    
    // Create reset link for frontend
    const resetLink = `${env.FRONT_URL}/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    try {
      await sendPasswordResetLinkEmail(email, resetLink, user.name);
    } catch (error) {
      throw exceptions.internal("Failed to send reset email");
    }
    return { message: "Password reset link sent to email" };
  },

  async resetPassword(token, newPassword) {
    // Find the reset token
    const resetRecord = await passwordResetsRepositoryInstance.findResetToken(token);
    
    if (!resetRecord) {
      throw exceptions.notFound("Invalid or expired reset token");
    }
    
    // Check if token has expired
    const now = new Date();
    const expiredAt = new Date(resetRecord.expired_at);
    
    if (now > expiredAt) {
      // Delete expired token
      await passwordResetsRepositoryInstance.deleteResetToken(token);
      throw exceptions.badRequest("Reset token has expired");
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    await usersRepositoryInstance.updateUser(
      resetRecord.userid,
      { password: hashedPassword }
    );
    
    // Delete the used token
    await passwordResetsRepositoryInstance.deleteResetToken(token);
    
    return { message: "Password successfully reset" };
  },

  async verifyResetToken(token) {
    // Find the reset token
    const resetRecord = await passwordResetsRepositoryInstance.findResetToken(token);
    
    if (!resetRecord) {
      throw exceptions.notFound("Invalid reset token");
    }
    
    // Check if token has expired
    const now = new Date();
    const expiredAt = new Date(resetRecord.expired_at);
    
    if (now > expiredAt) {
      // Delete expired token
      await passwordResetsRepositoryInstance.deleteResetToken(token);
      throw exceptions.badRequest("Reset token has expired");
    }
    
    return { valid: true, email: resetRecord.email };
  },
  async getUserByEmail(email) {
    return await usersRepositoryInstance.getUserByEmail(email);
  },

  async getUserByField(field, value, fieldsToReturn = "id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide") {
    const user = await usersRepositoryInstance.getUsersByField(field, value, fieldsToReturn);
    
    return user;

  },
  async getUserByTag(tagid) {
    return await usersRepositoryInstance.getUserByTag(tagid);
  },
  async checkAdminRole(userId) {
    return await usersRepositoryInstance.checkAdminRole(userId);
  },
  async searchByEmailAndPassword(email, password) {
    return await usersRepositoryInstance.searchByEmailAndPassword(email, password);
  },
  async searchByTagAndPassword(tag, password) {
    return await usersRepositoryInstance.searchByTagAndPassword(tag, password);
  },
  async createUser(CreateUserRq) {
    //check if email or tag already exists
    const existingByEmail = await usersRepositoryInstance.getUsersByField('email', CreateUserRq.email);
    if (existingByEmail.length > 0) {
      throw exceptions.conflict("Email already exists");
    }

    const existingByTag = await usersRepositoryInstance.getUsersByField('tag', CreateUserRq.tag);
    if (existingByTag.length > 0) {
      throw exceptions.conflict("Tag already exists");
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(CreateUserRq.password);
    const userDataToCreate = {
      ...CreateUserRq,
      password: hashedPassword
    };

    const users = await usersRepositoryInstance.createUser(userDataToCreate);

    // Create email confirmation record (valid for 24 hours)
    const userId = users[0].id;
    const userEmail = CreateUserRq.email;
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    let confirmation = null;
    try {
      confirmation = await usersRepositoryInstance.createEmailConfirmation(userId, userEmail, expiration);
    } catch (error) {
      console.error('Failed to create email confirmation:', error.message);
      // Continue even if confirmation creation fails
    }

    const userWithUbicationNames = await withUbicationNames(users);
    const infoToMail = userWithUbicationNames[0];
    
    // Send email confirmation with token
    if (confirmation && confirmation.token) {
      try {
        await sendEmailConfirmationEmail(
          infoToMail.email,
          infoToMail.name + " " + infoToMail.lastname,
          confirmation.token
        );
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Continue even if email fails
      }
    }
    
    return userWithUbicationNames;
  },
  async updateUser(userId, UpdateUserRq) { 
    const userExists = await usersRepositoryInstance.getUserById(userId);
    if (userExists.length === 0) {
      throw exceptions.notFound("User not found");
    }
    return await usersRepositoryInstance.updateUser(userId, UpdateUserRq);
  },

    async searchByText(text) {
        return await usersRepositoryInstance.searchByText(text);
    },
    async checkEmailExists(email) {
        return await usersRepositoryInstance.checkEmailExists(email);
    },
    async checkTagExists(tag) {
        return await usersRepositoryInstance.checkTagExists(tag);
    },
    async searchByEmail(email, password) {
        const user = await usersRepositoryInstance.searchByEmail(email);
        if (!user) {
            throw exceptions.notFound("User not found");
        }
        
        // Compare password with hashed password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw exceptions.unauthorized("Invalid credentials");
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    async searchByTag(tag, password) {
        const user = await usersRepositoryInstance.searchByTag(tag);
        if (!user) {
            throw exceptions.notFound("User not found");
        }
        
        // Compare password with hashed password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw exceptions.unauthorized("Invalid credentials");
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    async searchOwnerInfo( userid, fields = "id, name, tag, email") {
        return await usersRepositoryInstance.searchOwnerInfo(userid, fields);
    },
    async changeUserField( userid, field, value, extrafields = {}) {
      const userExists = await usersRepositoryInstance.getUserById(userid, `id, ${field}` );

      if (userExists.length === 0) {
        throw exceptions.conflict("User not found");
      }

      if (!(field in userExists[0])) {
        throw exceptions.badRequest(`Field ${field} does not exist on user`);
      }
      
      // Special handling for password field
      if (field === 'password') {
        // Verify current password matches
        const isCurrentPasswordValid = await comparePassword(
          extrafields.current, 
          userExists[0].password
        );
        
        if (!isCurrentPasswordValid) {
          throw exceptions.badRequest("Current password is incorrect");
        }
        
        // Hash new password before saving
        value = await hashPassword(value);
      }

      const updateData = { [field]: value };
      await usersRepositoryInstance.updateUser(userid, updateData);
    },

    async getProfileData(userId) {
      const normalizedUserId = Number(userId);
      if (!Number.isFinite(normalizedUserId) || normalizedUserId <= 0) {
        throw exceptions.badRequest("Invalid user id");
      }

      // Get user info with ubication and profile photos
      const user = await usersRepositoryInstance.getUserById(normalizedUserId, 
        "name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide, profile_photo, profile_photo_tn");
      
      // Get ubication names
      const userWithUbicationNames = await withUbicationNames(user);

      // Get trips created by user using owner-specific query path
      const tripsResult = await tripsService.getTripsByOwner(normalizedUserId, 1, 100);
      const createdTrips = (tripsResult?.data ?? [])
        .sort((a, b) => new Date(b.initialdate) - new Date(a.initialdate));

      // Get trips where user is member (from trips_members by userid)
      const memberTripsResult = await tripsService.searchTrips(
        { membertrips: true },
        normalizedUserId,
        1,
        100
      );
      const memberTrips = (memberTripsResult?.data ?? [])
        .sort((a, b) => new Date(b.initialdate) - new Date(a.initialdate));

      // Get vote counts
      const tripVotesCount = await votesRepositoryInstance.countVotesByUserId(normalizedUserId, 'trips');
      const placeVotesCount = await votesRepositoryInstance.countVotesByUserId(normalizedUserId, 'places');

      // Get last 3 voted trips
      const votedTrips = [];
      const votedTripsRows = await votesRepositoryInstance.getVotedTripsByUserId(normalizedUserId, 10);
      if (votedTripsRows.length > 0) {
        // Get trip details for each voted trip; trips that fail to load are skipped
        const tripIds = votedTripsRows.map(v => v.tripid);
        const votedTripsDetails = await Promise.all(
          tripIds.map(tripId => tripsService.getTripById(tripId, normalizedUserId, 
            ['id', 'name', 'description', 'initialdate', 'finaldate', 'ownerid', 'statics', 'itinerary'])
            .catch(() => null))
        );
        votedTrips.push(...votedTripsDetails.filter(Boolean));
      }

      return {
        user: userWithUbicationNames[0] || {},
        createdTrips: createdTrips,
        memberTrips: memberTrips,
        votedTrips: votedTrips,
        voteCounts: {
          trips: tripVotesCount ?? 0,
          places: placeVotesCount ?? 0
        }
      };
    },

    async confirmEmail(token) {
      // Verify token exists and get confirmation data
      const verification = await usersRepositoryInstance.verifyEmailConfirmationToken(token);
      if (!verification) {
        throw exceptions.notFound("Invalid confirmation token");
      }

      const { userid, expirationstamp, confirmed } = verification;

      // Check if already confirmed
      if (confirmed) {
        throw exceptions.badRequest("Email already confirmed");
      }

      // Check if token expired
      const now = new Date();
      const expirationDate = new Date(expirationstamp);
      if (now > expirationDate) {
        throw exceptions.badRequest("Confirmation token has expired");
      }

      // Mark as confirmed
      await usersRepositoryInstance.confirmEmail(token);

      return { message: "Email confirmed successfully", userid };
    },
    async uploadProfilePhoto(userId, imageData, mimetype, extension) {
      // Validate user exists
      const userExists = await usersRepositoryInstance.getUserById(userId, "id");
      if (userExists.length === 0) {
        throw exceptions.notFound("User not found");
      }

      // Process images: 400x400 avatar and 150x150 thumbnail, both as WebP
      const timestamp = Date.now();
      const avatarFileName = `users/avatar/${userId}_${timestamp}.webp`;
      const thumbnailFileName = `users/thumbnails/${userId}_${timestamp}.webp`;

      const avatarBuffer = await sharp(imageData)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 90 })
        .toBuffer();

      const thumbnailBuffer = await sharp(imageData)
        .resize(150, 150, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toBuffer();

      // Upload images to storage and get URLs
      const { avatarUrl, thumbnailUrl } = await usersRepositoryInstance.uploadProfilePhotoToStorage(
        avatarFileName,
        avatarBuffer,
        thumbnailFileName,
        thumbnailBuffer
      );

      // Update user record with photo URLs
      const updated = await usersRepositoryInstance.updateProfilePhotoUrls(userId, avatarUrl, thumbnailUrl);
      if (!updated) {
        throw exceptions.internal("Failed to update profile photo URLs in database");
      }

      return {
        message: "Profile photo uploaded successfully",
        profilePhoto: updated.profile_photo,
        profilePhotoThumbnail: updated.profile_photo_tn,
        userId: userId
      };
    },

    async sendFriendRequest(senderId, addressedId) {
      const sender = Number(senderId);
      const addressed = Number(addressedId);
      if (!Number.isInteger(addressed) || addressed <= 0) {
        throw exceptions.badRequest("Invalid addressed user id");
      }
      if (sender === addressed) {
        throw exceptions.badRequest("You cannot send a friend request to yourself");
      }

      const addressedUser = await usersRepositoryInstance.getUserById(addressed, "id");
      if (addressedUser.length === 0) {
        throw exceptions.notFound("Addressed user not found");
      }

      return await usersRepositoryInstance.saveFriendRequest(sender, addressed);
    },

    async changeFriendRequestStatus(userId, friendRequestId, status) {
      if (!['accepted', 'rejected'].includes(status)) {
        throw exceptions.badRequest("Status must be 'accepted' or 'rejected'");
      }

      const friendRequest = await usersRepositoryInstance.getFriendRequestById(friendRequestId);
      if (!friendRequest) {
        throw exceptions.notFound("Friend request not found");
      }
      if (Number(friendRequest.addressed_id) !== Number(userId)) {
        throw exceptions.forbidden("Only the addressed user can respond to this friend request");
      }
      if (friendRequest.status !== 'pending') {
        throw exceptions.conflict("Friend request has already been answered");
      }

      await usersRepositoryInstance.changeFriendRequestStatus(friendRequestId, status);
    },

    async sendInvitation(senderId, email) {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!normalizedEmail) throw exceptions.badRequest("Email is required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw exceptions.badRequest("Invalid email");
      }

      return await usersRepositoryInstance.saveInvitation(Number(senderId), normalizedEmail);
    },

    async changeInvitationStatus(userId, invitationId, status) {
      if (!['accepted', 'rejected'].includes(status)) {
        throw exceptions.badRequest("Status must be 'accepted' or 'rejected'");
      }

      const invitation = await usersRepositoryInstance.getInvitationById(invitationId);
      if (!invitation) {
        throw exceptions.notFound("Invitation not found");
      }
      if (Number(invitation.sender_id) !== Number(userId)) {
        throw exceptions.forbidden("Only the sender can update this invitation");
      }
      if (invitation.status !== 'pending') {
        throw exceptions.conflict("Invitation has already been answered");
      }

      await usersRepositoryInstance.changeInvitationStatus(invitationId, status);
    }
};

export default usersService;
/**
 * @swagger
 * components:
 *   schemas:
 *    LoginRq:
 *      type: object
 *     properties:
 * 
 *    id:
 *      type: string
 *    description: Email or Tag ID of the user
 *   password:
 *    type: string
 *   description: Password of the user
 * required:
 *     - id
 *    - password
 *   LoginRs:
 *    type: object
 *   properties:
 *   id:
 *    type: string
 *   description: Email or Tag ID of the user
 * password:
 *  type: string
 * description: Password of the user
 * required:
 *   - id
 *  - password
 */
