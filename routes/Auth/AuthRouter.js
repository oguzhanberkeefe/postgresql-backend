const router = require('express').Router();
const AuthController = require('../../controllers/Auth/AuthController')
const { body } = require('express-validator');
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
], AuthController.register);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty(),
], AuthController.login);

router.post('/logout', AuthController.logout);

module.exports = router;
