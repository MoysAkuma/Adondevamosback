import express from 'express';

import loginController from '../controllers/login.controller.js'

const router = express.Router();

/**
 * @swagger
 * /Login:
 *  post:
 *      summary: Log in in site Adondevamos.web
 *      description: Verify if email or tag id and password provided are registered in Adondevamos
 *      tags:
 *          - Login and Authentication
 *      requestBody:
 *          required: true
 *          content:
 *             application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      id:
 *                          type: string
 *                          description: Email or Tag ID of the user 
 */
router.post('/Login', loginController.login);

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check if user is authenticated
 *     tags:
 *          - Login and Authentication
 *     responses:
 *       '200':
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: true
 *       '401':
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   example: false
 */
router.get('/check-auth', loginController.checkAuth);

/**
 * @swagger
 * /Logout:
 *   post:
 *     summary: Log out from the site
 *     tags:
 *          - Login and Authentication
 *     responses:
 *       '200':
 *         description: Log out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       '500':
 *         description: Log out failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/Logout', loginController.logout);

export default router;