import express from 'express';
import usersController from '../controllers/users.controller.js'

const router = express.Router();

/**
 * @swagger
 * /Login:
 *   post:
 *     summary: Log in in site Adondevamos.web
 *     description: This request verify if email or tag id and password provided are registed in Adondevamos.io
 *     responses:
 *       200:
 *         description: Log in sucess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: string
 *                 example: Created 
 *       409:
 *         description: Log in failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: string
 *            
 */
    router.post('/Users', 
        siteController.createUser);

    router.get('/Users/:UserID', 
        siteController.getUserByID);

    router.put('/Users/:UserID', 
        siteController.updateUser);

    router.delete('/Users/:UserID', 
        siteController.deleteUser);

    router.get('/Users', 
        siteController.getAll);
    
    router.get('/Users/Verify/Tag/:tag', 
        siteController.verifyTag);
    
    router.get('/Users/Verify/Email/:email', 
        siteController.verifyEmail);

    router.patch('/Users/:UserID/Password', 
        siteController.changePassword);

    router.patch('/Users/:UserID/Show', 
        siteController.toggleVisibility);

    router.get('/Users/tag=:searchText', 
        siteController.searchUserByIDs);