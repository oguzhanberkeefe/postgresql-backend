const { Books, Inventory, BookStores } = require("../../models/IndexModel");
const CustomError = require('../../helpers/CustomErrorHelper');
const sequelize = require('../../helpers/DatabaseHelper');

class StoreManagerController {
    static updateBookQuantity = async (req, res, next) => {
        const t = await sequelize.transaction();
        try {
            const { bookId, bookstoreId, quantityChange } = req.body;

            if (!bookId || !bookstoreId) {
                throw new CustomError("Book ID and Bookstore ID are required", 400);
            }

            if (req.role === 'STOREMANAGER') {
                const tokenStoreId = req.decode.bookStoreId;
                if (!tokenStoreId) {
                    throw new CustomError('Token does not have a bookstoreId', 403);
                }
                if (tokenStoreId !== parseInt(bookstoreId)) {
                    throw new CustomError('You can only update your own store!', 403);
                }
            }

            const bookstore = await BookStores.findByPk(bookstoreId);
            if (!bookstore) {
                throw new CustomError("Bookstore not found", 404);
            }

            const book = await Books.findByPk(bookId);
            if (!book) {
                throw new CustomError("Book not found", 404);
            }

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
            return next(error);
        }
    }
}

module.exports = StoreManagerController;
