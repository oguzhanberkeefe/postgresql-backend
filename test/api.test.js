const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { expect } = chai;
chai.use(chaiHttp);

let adminToken = '';
let userToken = '';
let storeManagerToken = '';

let createdBookstoreId = null;
let createdAuthorId = null;
let createdBookId = null;
let createdInventoryId = null;

describe('AUTH & BOOKSTORE SETUP', () => {
    it('Admin register', (done) => {
        chai.request(app)
            .post('/api/v1/auth/register')
            .send({
                email: "admin@example.com",
                password: "admin123",
                role: "ADMIN",
                firstName: "Admin",
                lastName: "User",
                phoneNumber: "1234567890"
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                adminToken = res.body.data.token;
                done();
            });
    });

    it('User register', (done) => {
        chai.request(app)
            .post('/api/v1/auth/register')
            .send({
                email: "user@example.com",
                password: "user123",
                role: "USER",
                firstName: "John",
                lastName: "Doe",
                phoneNumber: "9876543210"
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                userToken = res.body.data.token;
                done();
            });
    });

    it('Create Bookstore', (done) => {
        chai.request(app)
            .post('/api/v1/admin/bookstores/create')
            .set('x-access-token', adminToken)
            .send({
                name: "Test Bookstore",
                address: "123 Street",
                phoneNumber: "555-5555",
                email: "test@bookstore.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                createdBookstoreId = res.body.id;
                done();
            });
    });

    it('StoreManager register (bound to Bookstore)', (done) => {
        chai.request(app)
            .post('/api/v1/auth/register')
            .send({
                email: "storemanager@example.com",
                password: "store123",
                role: "STOREMANAGER",
                firstName: "Store",
                lastName: "Manager",
                phoneNumber: "5551234567",
                bookstoreId: createdBookstoreId
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                storeManagerToken = res.body.data.token;
                done();
            });
    });
});

describe('ADMIN AUTHOR & BOOK SETUP', () => {
    it('Create Author', (done) => {
        chai.request(app)
            .post('/api/v1/admin/authors/create')
            .set('x-access-token', adminToken)
            .send({ firstName: "John", lastName: "Doe" })
            .end((err, res) => {
                expect(res).to.have.status(201);
                createdAuthorId = res.body.id;
                done();
            });
    });

    it('Create Book', (done) => {
        chai.request(app)
            .post('/api/v1/admin/books/create')
            .set('x-access-token', adminToken)
            .send({
                name: "Test Book",
                desc: "Test description",
                authorId: createdAuthorId,
                price: 19.99,
                quantity: 10,
                bookStoreId: createdBookstoreId
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                createdBookId = res.body.id;
                done();
            });
    });

    it('Create Book with missing fields', (done) => {
        chai.request(app)
            .post('/api/v1/admin/books/create')
            .set('x-access-token', adminToken)
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });
});

describe('USER TESTS', () => {
    it('Get All Bookstores', (done) => {
        chai.request(app)
            .get('/api/v1/user/bookstores')
            .set('x-access-token', userToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get All Books', (done) => {
        chai.request(app)
            .get('/api/v1/user/books')
            .set('x-access-token', userToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Unauthorized Access to Admin Route', (done) => {
        chai.request(app)
            .post('/api/v1/admin/bookstores/create')
            .set('x-access-token', userToken)
            .send({
                name: "Unauthorized Bookstore",
                address: "123 Street",
                phoneNumber: "555-5555",
                email: "test@unauthorized.com"
            })
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });
});

describe('STORE MANAGER TESTS', () => {
    it('Update Book Quantity (existing store & book)', (done) => {
        chai.request(app)
            .put('/api/v1/store-manager/book/update-quantity')
            .set('x-access-token', storeManagerToken)
            .send({
                bookId: createdBookId,
                bookstoreId: createdBookstoreId,
                quantityChange: 5
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                createdInventoryId = res.body.id;
                done();
            });
    });
});

describe('CLEANUP TESTS', () => {
    it('Delete Inventory', (done) => {
        chai.request(app)
            .delete(`/api/v1/admin/inventory/${createdInventoryId}`)
            .set('x-access-token', adminToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Delete Book', (done) => {
        chai.request(app)
            .delete(`/api/v1/admin/books/delete/${createdBookId}`)
            .set('x-access-token', adminToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Delete Author', (done) => {
        chai.request(app)
            .delete(`/api/v1/admin/authors/delete/${createdAuthorId}`)
            .set('x-access-token', adminToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Delete Bookstore', (done) => {
        chai.request(app)
            .delete(`/api/v1/admin/bookstores/delete/${createdBookstoreId}`)
            .set('x-access-token', adminToken)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});
