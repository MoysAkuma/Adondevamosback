import express from 'express';
import usersController from '../controllers/users.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';
const router = express.Router();

// Specific routes must come BEFORE parameterized routes
router.post('/Users/RecoverPassword',
    usersController.recoverPassword);

router.get('/Users/ConfirmEmail',
    usersController.confirmEmail);
    
router.get('/Users/Verify/:field/:value',
    usersController.verify);

router.get(
    '/Users/Search/:field/:value',
    usersController.searchUsersByField
);

// Generic parameterized routes come after specific routes
router.post('/Users',
    usersController.createUser);

router.get('/Users/:UserID', 
    usersController.getUserByID);

router.get('/Users/:UserID/Profile',
    usersController.getProfileData);

router.put('/Users/:UserID',
    authenticate,
    usersController.editUser);

router.patch('/Users/:UserID/:field',
    authenticate,
    usersController.changeUserField);
    
export default router;