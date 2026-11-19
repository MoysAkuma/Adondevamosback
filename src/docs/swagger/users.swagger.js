/**
 * @swagger
 * /Users/{UserID}/ProfilePhoto:
 *   post:
 *     summary: Upload user profile photo
 *     description: Upload a new profile photo for the user. Supports both file upload (multipart/form-data) and JSON with base64 data. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB)
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: Base64 encoded image data or data URL
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *               mimetype:
 *                 type: string
 *                 description: MIME type of the image
 *                 default: image/jpeg
 *                 example: image/jpeg
 *               extension:
 *                 type: string
 *                 description: File extension
 *                 default: jpg
 *                 example: jpg
 *           example:
 *             data: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *             mimetype: "image/jpeg"
 *             extension: "jpg"
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile photo uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID of the user
 *                     profilePhoto:
 *                       type: string
 *                       description: Public URL of the full-size profile photo (400x400 webp)
 *                       example: "https://...storage.../users/avatar/123_1234567890.webp"
 *                     profilePhotoThumbnail:
 *                       type: string
 *                       description: Public URL of the thumbnail profile photo (150x150 webp)
 *                       example: "https://...storage.../users/thumbnails/123_1234567890.webp"
 *       400:
 *         description: Bad request - missing or invalid image data
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - cannot modify other user's profile
 */

/**
 * @swagger
 * /Users/{UserID}/FriendRequests:
 *   post:
 *     summary: Send a friend request
 *     description: Creates a pending friend request from the authenticated user (UserID) to addressedId. UserID must match the token owner.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the sender (must match the authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressedId
 *             properties:
 *               addressedId:
 *                 type: integer
 *                 description: ID of the user receiving the request
 *                 example: 2
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Invalid addressed user id, or attempt to befriend yourself
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - UserID does not match the authenticated user
 *       404:
 *         description: Addressed user not found
 *
 * /Users/{UserID}/FriendRequests/{FriendRequestID}:
 *   patch:
 *     summary: Accept or reject a friend request
 *     description: Allows the addressed user to answer a pending friend request.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the addressed user (must match the authenticated user)
 *       - in: path
 *         name: FriendRequestID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the friend request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Friend request updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - only the addressed user can respond
 *       404:
 *         description: Friend request not found
 *       409:
 *         description: Friend request has already been answered
 *
 * /Users/{UserID}/Invitations:
 *   post:
 *     summary: Send an invitation by email
 *     description: Creates a pending invitation from the authenticated user (UserID) to the given email address.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the sender (must match the authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: friend@example.com
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       400:
 *         description: Email missing or invalid
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - UserID does not match the authenticated user
 *
 * /Users/{UserID}/Invitations/{InvitationID}:
 *   patch:
 *     summary: Update the status of an invitation
 *     description: Allows the sender of an invitation to mark it as accepted or rejected.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the sender (must match the authenticated user)
 *       - in: path
 *         name: InvitationID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the invitation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Invitation updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - only the sender can update the invitation
 *       404:
 *         description: Invitation not found
 *       409:
 *         description: Invitation has already been answered
 */

export default {};