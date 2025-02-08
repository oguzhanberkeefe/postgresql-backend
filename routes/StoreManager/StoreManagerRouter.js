const router = require('express').Router();
const { body } = require('express-validator');
const StoreManagerController = require('../../controllers/StoreManager/StoreManagerController');

router.put('/book/update-quantity', [
    body('bookId').isInt(),
    body('bookstoreId').isInt(),
    body('quantityChange').isInt()
], StoreManagerController.updateBookQuantity);

module.exports = router;
