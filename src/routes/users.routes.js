import express from 'express';
import usersController from '../controllers/users.controller.js'

const router = express.Router();

router.get('/Users/:UserID', 
    usersController.getUserByID);

router.post('/Users/RecoverPassword',
    usersController.recoverPassword);

export default router;