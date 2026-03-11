import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /Login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/tag and password, returns JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *                 description: User email or tag
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: myPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/Login', authController.login);

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check authentication status
 *     description: Verify if the current JWT token is valid and return authentication status
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: [ ]
 *     responses:
 *       200:
 *         description: Authentication status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         isAuthenticated:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: Not authenticated or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/check-auth', 
    authenticate, 
    authController.checkAuth);

/**
 * @swagger
 * /Logout:
 *   post:
 *     summary: User logout
 *     description: Logout the current user and destroy session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Successfully logged out
 *               data: {}
 *       401:
 *         description: Not authenticated or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error during logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/Logout', 
    authenticate, 
    authController.logout);

export default router;
