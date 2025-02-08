const { BookStores, Books, Authors } = require("../../models/IndexModel");

class UserController {
    static viewAllBookstores = async (req, res) => {
        try {
            const bookstores = await BookStores.findAll();
            if (!bookstores || bookstores.length === 0) {
                return res.status(404).json({ message: 'BookStores Not Found' });
            }
            return res.status(200).json(bookstores);
        } catch (err) {
            console.error('BookStores Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    static viewAllAuthors = async (req, res) => {
        try {
            const authors = await Authors.findAll();
            if (!authors || authors.length === 0) {
                return res.status(404).json({ message: 'Authors Not Found' });
            }
            return res.status(200).json(authors);
        } catch (err) {
            console.error('Authors Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    static viewAuthorDetails = async (req, res, next) => {
        try {
            const { authorId } = req.params;
            const author = await Authors.findOne({ where: { id: authorId } });

            if (!author) {
                return res.status(404).json({ message: 'Author Not Found' });
            }
            return res.status(200).json(author);
        } catch (err) {
            console.error('Author Detail Error:', err);
            return next(err);
        }
    }

    static viewBooksByAuthor = async (req, res) => {
        try {
            const { authorId } = req.params;
            const books = await Books.findAll({ where: { authorId } });

            if (!books || books.length === 0) {
                return res.status(404).json({ message: 'Books Not Found for this Author' });
            }
            return res.status(200).json(books);
        } catch (err) {
            console.error('Books by Author Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    static viewAllBooks = async (req, res) => {
        try {
            const books = await Books.findAll();
            if (!books || books.length === 0) {
                return res.status(404).json({ message: 'Books Not Found' });
            }
            return res.status(200).json(books);
        } catch (err) {
            console.error('Books Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    static viewBookstoreDetails = async (req, res) => {
        try {
            const { bookstoreId } = req.params;
            const bookstore = await BookStores.findOne({
                where: { id: bookstoreId },
                include: [
                    { model: Books }
                ]
            });
            if (!bookstore) {
                return res.status(404).json({ message: 'Bookstore Not Found' });
            }
            return res.status(200).json(bookstore);
        } catch (err) {
            console.error('Bookstore Details Error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    static viewBookDetails = async (req, res, next) => {
        try {
            const { bookId } = req.params;
            const book = await Books.findOne({
                where: { id: bookId },
                include: [
                    { model: Authors }
                ]
            });

            if (!book) {
                return res.status(404).json({ message: 'Book Not Found' });
            }
            return res.status(200).json(book);
        } catch (err) {
            return next(err);
        }
    }

    static bookAvailabilityInStores = async (req, res, next) => {
        try {
            const { bookId } = req.params;
            const book = await Books.findByPk(bookId);

            if (!book) throw new CustomError('Book not found', 404);

            const inventories = await Inventory.findAll({
                where: { bookId },
                include: [BookStores]
            });

            const availableStores = inventories.filter(inv => inv.quantity > 0);

            return res.status(200).json({
                book,
                stores: availableStores.map(inv => ({
                    bookstore: inv.BookStore,
                    quantity: inv.quantity
                }))
            });
        } catch (err) {
            return next(err);
        }
    }
}

module.exports = UserController;
