import express from 'express';
import usersController from '../controllers/users.controller.js'

const router = express.Router();

router.get('/Users/:UserID', 
    usersController.getUserByID);

router.post('/Users/RecoverPassword',
    usersController.recoverPassword);
    
router.get('/Users/Verify/:field/:value',
    usersController.verify);
    
router.post('/Users',
    usersController.createUser);

export default router;