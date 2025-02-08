const router = require('express').Router();
const { verifyTokenAdmin } = require('../../middlewares/AuthorizationMiddleware');
const AdminController = require('../../controllers/Admin/AdminController');
const { body, param } = require('express-validator');

router.use(verifyTokenAdmin);

router.post('/bookstores/create', [
    body('name').notEmpty(),
    body('address').notEmpty(),
    body('phoneNumber').notEmpty(),
    body('email').isEmail(),
], AdminController.createBookstore);

router.post('/books/create', [
    body('name').notEmpty(),
    body('desc').notEmpty(),
    body('authorId').isInt(),
    body('price').isNumeric(),
    body('quantity').isInt(),
    body('bookStoreId').isInt(),
], AdminController.createBook);

router.put('/books/update/:id', [
    param('id').isInt()
], AdminController.updateBook);

router.delete('/books/delete/:id', [
    param('id').isInt()
], AdminController.deleteBook);

router.post('/user/create', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
], AdminController.createUser);

router.put('/users/update/:id', [
    param('id').isInt()
], AdminController.updateUser);

router.delete('/users/delete/:id', [
    param('id').isInt()
], AdminController.deleteUser);

router.put('/inventory/update', [
    body('bookId').isInt(),
    body('bookstoreId').isInt(),
    body('quantityChange').isInt(),
], AdminController.updateInventory);

router.delete('/inventory/:id', [
    param('id').isInt()
], AdminController.deleteInventory);

router.put('/bookstores/update/:id', [
    param('id').isInt()
], AdminController.updateBookstore);

router.delete('/bookstores/delete/:id', [
    param('id').isInt()
], AdminController.deleteBookstore);

router.post('/authors/create', [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
], AdminController.createAuthor);

router.put('/authors/update/:id', [
    param('id').isInt()
], AdminController.updateAuthor);

router.delete('/authors/delete/:id', [
    param('id').isInt()
], AdminController.deleteAuthor);

module.exports = router;
