const router = require('express').Router();
const UsersController = require('../../controllers/User/UserController');

router.get('/bookstores', UsersController.viewAllBookstores);
router.get('/books', UsersController.viewAllBooks);
router.get('/book/detail/:bookId', UsersController.viewBookDetails);
router.get('/book/availability/:bookId', UsersController.bookAvailabilityInStores);
router.get('/bookstores/detail/:bookstoreId', UsersController.viewBookstoreDetails);
router.get('/authors', UsersController.viewAllAuthors);
router.get('/authors/:authorId', UsersController.viewAuthorDetails);
router.get('/authors/books/:authorId', UsersController.viewBooksByAuthor);



module.exports = router;
