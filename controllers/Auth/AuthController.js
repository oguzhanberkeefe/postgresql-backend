const jwt = require('jsonwebtoken'); const bcrypt = require('bcryptjs');
const { User, UserLoginLogs } = require("../../models/IndexModel");
const { validationResult } = require('express-validator');
const CustomError = require('../../helpers/CustomErrorHelper');
const getClientIP = require('../../helpers/GetClientIpHelper');

class AuthController {
    static async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new CustomError('Validation Error', 400, errors.array()));
            }

            const { email, password, firstName, lastName, phoneNumber, role, bookstoreId } = req.body;
            const ipAddress = getClientIP(req);
            const lastLoginDate = new Date();

            if (role === "STOREMANAGER" && !bookstoreId) {
                return next(new CustomError("'bookstore ID' is required for the STORE MANAGER role.", 400));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                role,
                ipAddress,
                lastLoginDate,
                ...(role === "STOREMANAGER" ? { bookStoreId: bookstoreId } : {}),
            });

            let secretKey;
            if (role === "ADMIN") {
                secretKey = req.app.get("API_SECRET_KEY_ADMIN");
            } else if (role === "STOREMANAGER") {
                secretKey = req.app.get("API_SECRET_KEY_STOREMANAGER");
            } else {
                secretKey = req.app.get("API_SECRET_KEY_USER");
            }

            const tokenPayload = {
                id: newUser.id,
                role: newUser.role
            };

            if (role === "STOREMANAGER") {
                tokenPayload.bookStoreId = newUser.bookStoreId;
            }

            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

            return res.status(201).json({
                status: "success",
                message: "User successfully created",
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    ipAddress: newUser.ipAddress,
                    token
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new CustomError('Validation Error', 400, errors.array()));
            }

            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return next(new CustomError("User not found", 404));
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return next(new CustomError("Invalid password", 401));
            }

            const ipAddress = getClientIP(req);
            user.ipAddress = ipAddress;
            user.lastLoginDate = new Date();
            await user.save();

            const userAgent = req.headers['user-agent'] || 'Unknown';
            await UserLoginLogs.create({
                userId: user.id,
                ipAddress,
                loginDate: new Date(),
                browser: userAgent,
                deviceInfo: userAgent,
                osInfo: userAgent
            });

            let secretKey;
            if (user.role === "ADMIN") {
                secretKey = req.app.get("API_SECRET_KEY_ADMIN");
            } else if (user.role === "STOREMANAGER") {
                secretKey = req.app.get("API_SECRET_KEY_STOREMANAGER");
            } else {
                secretKey = req.app.get("API_SECRET_KEY_USER");
            }

            if (!secretKey) {
                return next(new CustomError(`JWT secret key for role ${user.role} is missing. Check your .env file.`, 500));
            }

            const tokenPayload = {
                id: user.id,
                role: user.role
            };

            if (user.role === "STOREMANAGER") {
                tokenPayload.bookStoreId = user.bookStoreId;
            }

            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '24h' });

            return res.status(200).json({
                status: "success",
                message: "Login successful",
                data: {
                    token,
                    role: user.role,
                    ipAddress: user.ipAddress
                }
            });
        } catch (error) {
            return next(error);
        }
    }


    static async logout(req, res, next) {
        try {
            req.session.destroy();
            return res.status(200).json({ status: "success", message: "Logout successful" });
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = AuthController;
