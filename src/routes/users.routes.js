import express from 'express';
import usersController from '../controllers/users.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';
import { optionalSingleUpload } from '../middleware/upload.middleware.js';
const router = express.Router();

// Specific routes must come BEFORE parameterized routes
router.post('/Users/RecoverPassword',
    usersController.recoverPassword);

router.post('/Users/ResetPassword',
    usersController.resetPassword);

router.get('/Users/VerifyResetToken',
    usersController.verifyResetToken);

router.get('/Users/ConfirmEmail',
    usersController.confirmEmail);
    
router.get('/Users/Verify/:field/:value',
    usersController.verify);

router.get(
    '/Users/Search/:field/:value',
    usersController.searchUsersByField
);

/** Upload profile photo 
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
router.post('/Users/:UserID/ProfilePhoto',
    authenticate,
    optionalSingleUpload('file'),
    usersController.uploadProfilePhoto
);

// Generic parameterized routes come after specific routes
router.post('/Users',
    usersController.createUser);

router.get('/Users/:UserID', 
    usersController.getUserByID);

router.get('/Users/:UserID/Profile',
    usersController.getProfileData);

router.put('/Users/:UserID',
    authenticate,
    usersController.editUser);

router.patch('/Users/:UserID/:field',
    authenticate,
    usersController.changeUserField);
    
export default router;