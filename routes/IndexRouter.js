const router = require('express').Router();
const { verifyTokenUsers, verifyTokenStoremanager, verifyTokenAdmin } = require('../middlewares/AuthorizationMiddleware');
router.use('/auth', require('./Auth/AuthRouter'));
router.use('/user', verifyTokenUsers, require('./User/UserRouter'));
router.use('/store-manager', verifyTokenStoremanager, require('./StoreManager/StoreManagerRouter'));
router.use('/admin', verifyTokenAdmin, require('./Admin/AdminRouter'));
module.exports = router;
