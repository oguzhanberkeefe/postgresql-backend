const jwt = require('jsonwebtoken');

const verifyToken = (token, secretKey) =>
    new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err && err.name === 'TokenExpiredError') {
                return reject({ expired: true, decoded });
            }
            if (err) return reject(err);
            resolve(decoded);
        });
    });

const refreshToken = (decodedToken, secretKey) => {
    const payload = {
        id: decodedToken.id,
        role: decodedToken.role,
    };

    if (decodedToken.bookStoreId) {
        payload.bookStoreId = decodedToken.bookStoreId;
    }

    return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const roleHierarchy = {
    admin: ["admin", "storemanager", "user"],
    storemanager: ["storemanager", "user"],
    user: ["user"]
};


const verifyTokenMiddleware = (allowedRoles) => async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(404).json({ message: "Token is required" });
        }

        const secretKeys = {
            user: req.app.get('API_SECRET_KEY_USER'),
            storemanager: req.app.get('API_SECRET_KEY_STOREMANAGER'),
            admin: req.app.get('API_SECRET_KEY_ADMIN'),
        };

        let decodedToken = null;
        let newToken = null;

        for (const [role, secretKey] of Object.entries(secretKeys)) {
            try {
                decodedToken = await verifyToken(token, secretKey);

                const userRole = decodedToken.role.toLowerCase();
                if (roleHierarchy[userRole]?.some(r => allowedRoles.includes(r))) {
                    req.decode = decodedToken;
                    req.role = userRole;

                    if (decodedToken.exp < Date.now() / 1000) {
                        newToken = refreshToken(decodedToken, secretKey);
                    }
                    if (newToken) {
                        return res.status(200).json({
                            message: "Token expired, a new token has been generated",
                            newToken,
                        });
                    }
                    return next();
                }
            } catch (err) {
                if (err.expired) {
                    newToken = refreshToken(err.decoded, secretKey);
                    return res.status(401).json({
                        message: "Token expired, a new token has been generated",
                        newToken,
                    });
                }
            }
        }
        return res.status(403).json({ message: "Access denied" });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};


const verifyTokenUsers = verifyTokenMiddleware(['user', 'storemanager', 'admin']);
const verifyTokenStoremanager = verifyTokenMiddleware(['storemanager', 'admin']);
const verifyTokenAdmin = verifyTokenMiddleware(['admin']);

module.exports = {
    verifyTokenUsers,
    verifyTokenStoremanager,
    verifyTokenAdmin,
};
