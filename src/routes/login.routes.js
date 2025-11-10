import express from 'express';

import loginController from '../controllers/login.controller.js'

const router = express.Router();
/**
 * @swagger
 * /Login: 
 *  post: 
 *  summary: Log in in site Adondevamos.web
 * description: This request verify if email or tag id and password provided are registed in Adondevamos.io
 * 
 * 
 * responses:
 *   200:
 *     description: Log in sucess
 *    content:  
 *      application/json:
 *       schema:    
 *        type: object
 *       items:
 *        type: string
 *       example: Created
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
 * /Verify/Email:
 *  get:   
 * summary: Verify if email is registred in Adondevamos.io
 * description: This request verify if email provided is registed in Adondevamos.io
 * 
 * responses:
 *  200:
 *   description: Email is registred
 *  content:
 *   application/json:
 *    schema:
 *    type: object
 *   items:
 *   type: string
 *  example: Email verified
 * 409:
 *  description: Email not found
 * content:
 *  application/json:
 *   schema:
 *   type: object
 *  items:  
 *  type: string
 * 
 */
router.get('/Verify/Email', 
    loginController.verifyEmail);

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

export default router;