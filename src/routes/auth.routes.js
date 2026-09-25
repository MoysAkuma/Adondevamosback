import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/Login', authController.login);
router.get('/check-auth', 
    authenticate, 
    authController.checkAuth);
router.post('/Logout', 
    authenticate, 
    authController.logout);

export default router;
