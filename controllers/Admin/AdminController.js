const bcrypt = require('bcryptjs');
const { BookStores, Books, Inventory, User, Authors } = require("../../models/IndexModel");
const CustomError = require('../../helpers/CustomErrorHelper');
const sequelize = require('../../helpers/DatabaseHelper');

class AdminController {
    static createBookstore = async (req, res, next) => {
        try {
            const { name, address, phoneNumber, email } = req.body;
            const newBookstore = await BookStores.create({ name, address, phoneNumber, email });
            return res.status(201).json(newBookstore);
        } catch (error) {
            console.error("Create Bookstore Error:", error);
            return next(error);
        }
    }

    static createAuthor = async (req, res, next) => {
        try {
            const { firstName, lastName } = req.body;
            if (!firstName || !lastName) {
                throw new CustomError("firstName and lastName are required.", 400);
            }
            const newAuthor = await Authors.create({ firstName, lastName });
            return res.status(201).json(newAuthor);
        } catch (error) {
            console.error("Create Author Error:", error);
            return next(error);
        }
    }

    static updateAuthor = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { firstName, lastName } = req.body;

            const author = await Authors.findByPk(id);
            if (!author) {
                return res.status(404).json({ message: 'Author not found' });
            }

            author.firstName = firstName ?? author.firstName;
            author.lastName = lastName ?? author.lastName;

            await author.save();
            return res.status(200).json(author);
        } catch (error) {
            return next(error);
        }
    }

    static deleteAuthor = async (req, res, next) => {
        try {
            const { id } = req.params;
            const author = await Authors.findByPk(id);
            if (!author) {
                return res.status(404).json({ message: 'Author not found' });
            }
            await author.destroy();
            return res.status(200).json({ message: 'Author deleted' });
        } catch (error) {
            return next(error);
        }
    }

    static createBook = async (req, res, next) => {
        try {
            const { name, desc, authorId, price, quantity, bookStoreId } = req.body;

            if (!name || !desc || !authorId || !price || !quantity || !bookStoreId) {
                return res.status(400).json({
                    status: "error",
                    message: "All fields are required: name, desc, authorId, price, quantity, bookStoreId"
                });
            }

            const formattedPrice = parseFloat(price).toFixed(2);

            const newBook = await Books.create({
                name,
                desc,
                authorId,
                price: formattedPrice,
                quantity,
                bookStoreId
            });

            return res.status(201).json({
                id: newBook.id,
                name: newBook.name,
                desc: newBook.desc,
                authorId: newBook.authorId,
                price: parseFloat(newBook.price).toFixed(2),
                quantity: newBook.quantity,
                bookStoreId: newBook.bookStoreId,
                createdAt: newBook.createdAt,
                updatedAt: newBook.updatedAt
            });

        } catch (error) {
            console.error("Create Book Error:", error);
            return next(error);
        }
    };


    static createUser = async (req, res, next) => {
        try {
            const { email, password, firstName, lastName, phoneNumber, role, bookStoreId } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                role,
                bookStoreId
            });
            return res.status(201).json(newUser);
        } catch (error) {
            console.error("Create User Error:", error);
            return next(error);
        }
    }

    static updateInventory = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { bookId, bookstoreId, quantityChange } = req.body;

            let inventory = await Inventory.findOne({ where: { bookId, bookstoreId } });
            if (!inventory) {
                inventory = await Inventory.create({ bookId, bookstoreId, quantity: 0 }, { transaction: t });
            }

            inventory.quantity += quantityChange;
            if (inventory.quantity < 0) inventory.quantity = 0;

            await inventory.save({ transaction: t });
            await t.commit();
            return res.status(200).json(inventory);
        } catch (error) {
            await t.rollback();
            console.error("Update Inventory Error:", error);
            return next(error);
        }
    }

    static updateBookstore = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, address, phoneNumber, email } = req.body;

            const bookstore = await BookStores.findByPk(id);
            if (!bookstore) {
                return res.status(404).json({ message: 'Bookstore not found' });
            }

            bookstore.name = name ?? bookstore.name;
            bookstore.address = address ?? bookstore.address;
            bookstore.phoneNumber = phoneNumber ?? bookstore.phoneNumber;
            bookstore.email = email ?? bookstore.email;

            await bookstore.save();
            return res.status(200).json(bookstore);
        } catch (error) {
            return next(error);
        }
    }

    static updateBook = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, desc, authorId, price, quantity, bookStoreId } = req.body;

            const book = await Books.findByPk(id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }

            book.name = name ?? book.name;
            book.desc = desc ?? book.desc;
            book.authorId = authorId ?? book.authorId;
            book.price = price ?? book.price;
            book.quantity = quantity ?? book.quantity;
            book.bookStoreId = bookStoreId ?? book.bookStoreId;

            await book.save();
            return res.status(200).json(book);
        } catch (error) {
            return next(error);
        }
    }

    static updateUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { email, password, firstName, lastName, phoneNumber, role, bookStoreId } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.email = email ?? user.email;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            user.firstName = firstName ?? user.firstName;
            user.lastName = lastName ?? user.lastName;
            user.phoneNumber = phoneNumber ?? user.phoneNumber;
            user.role = role ?? user.role;
            user.bookStoreId = bookStoreId ?? user.bookStoreId;

            await user.save();
            return res.status(200).json(user);
        } catch (error) {
            return next(error);
        }
    }

    static deleteBookstore = async (req, res, next) => {
        try {
            const { id } = req.params;
            const bookstore = await BookStores.findByPk(id);
            if (!bookstore) {
                return res.status(404).json({ message: 'Bookstore not found' });
            }
            await bookstore.destroy();
            return res.status(200).json({ message: 'Bookstore deleted' });
        } catch (error) {
            return next(error);
        }
    }

    static deleteBook = async (req, res, next) => {
        try {
            const { id } = req.params;
            const book = await Books.findByPk(id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            await book.destroy();
            return res.status(200).json({ message: 'Book deleted' });
        } catch (error) {
            return next(error);
        }
    }

    static deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await user.destroy();
            return res.status(200).json({ message: 'User deleted' });
        } catch (error) {
            return next(error);
        }
    }

    static deleteInventory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findByPk(id);
            if (!inventory) {
                return res.status(404).json({ message: 'Inventory not found' });
            }
            await inventory.destroy();
            return res.status(200).json({ message: 'Inventory deleted' });
        } catch (error) {
            console.error("Delete Inventory Error:", error);
            return next(error);
        }
    }

}

module.exports = AdminController;
