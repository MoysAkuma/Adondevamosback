import express from 'express';

import loginController from '../controllers/login.controller.js'

const router = express.Router();


router.post('/Login', loginController.login);

router.get('/check-auth', loginController.checkAuth);

router.post('/Logout', loginController.logout);

export default router;