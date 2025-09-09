import express from 'express';
import siteController from '../controllers/site.controller.js'

const router = express.Router();

/**
 * @swagger
 * /Login:a
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
router.post('/Login', 
    siteController.login);

router.post('/RecoverPassword', 
    siteController.recoverPassword);

router.get('/Verify/Email', 
    siteController.verifyEmail);

