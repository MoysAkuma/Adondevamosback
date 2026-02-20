import express from 'express';
import usersController from '../controllers/users.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/Users/:UserID', 
    usersController.getUserByID);

router.post('/Users/RecoverPassword',
    usersController.recoverPassword);
    
router.get('/Users/Verify/:field/:value',
    usersController.verify);
    
router.post('/Users',
    usersController.createUser);

router.get(
    '/Users/Search/:field/:value',
    usersController.searchUsersByField
);
router.put('/Users/:UserID',
    authenticate,
    usersController.editUser);

router.patch('/Users/:UserID/:field',
    authenticate,
    usersController.changeUserField);
    
export default router;