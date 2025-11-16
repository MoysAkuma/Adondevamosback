import express from 'express';

import loginController from '../controllers/login.controller.js'

const router = express.Router();
/**
 * @swagger
 * /Login: 
 *  post: 
 *      summary: Log in in site Adondevamos.web
 *      description: This request verify if email or tag id and password provided are registed in Adondevamos
 *      tags: [Site]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *              schema:
 *                  $ref: '#/components/schemas/LoginRq'
 *   
 * responses:
 *   200:
 *     description: Log in sucess
 *    content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginRs'
 *  409:
 *   description: Log in failed
 *  content:
 *   application/json:
 *  
 *    schema:
 *     type: object
 *    items:
 *    type: string
 *  
 *      
 */

router.post('/Login', 
    loginController.login);

/**
 * @swagger
 * /CheckAuth:
 *  get:
 *  summary: Check if user is authenticated
 * description: This request checks if the user has an active session
 * responses:
 *  200:
 *  description: User is authenticated
 * content:
 *  application/json:
 *   schema:
 *   type: object
 *  items:
 *  type: string
 * example: Authenticated
 * 409:
 * description: User is not authenticated
 * content:
 * application/json:
 *  schema:
 * type: object
 * items:
 * type: string
 * example: Not authenticated
 */
router.get('/check-auth', 
    loginController.checkAuth);
/**
 * @swagger
 * /Logout:
 *  get:
 *  summary: Log out from the site
 * description: This request logs the user out and ends the session
 * responses:
 * 200:
 * description: Log out successful
 * content:
 * application/json:
 * schema:
 * type: object
 * items:
 * type: string
 * example: Logged out successfully
 * 409:
 * description: Log out failed
 * content:
 * application/json:
 * schema:
 * type: object
 * items:
 * type: string
 * example: Log out failed
 */
router.get('/logout', 
    loginController.logout);

export default router;