import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /v1/Login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User email or tag
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/Login', authController.login);

/**
 * @swagger
 * /v1/check-auth:
 *   get:
 *     summary: Check authentication status
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication status
 *       401:
 *         description: Not authenticated
 */
router.get('/check-auth', authController.checkAuth);

/**
 * @swagger
 * /v1/Logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Error during logout
 */
router.post('/Logout', authController.logout);

export default router;
