const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../schemas/user');

dotenv.config();

// authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("auth-token");         // if token exists in header
        if (token) {
            // If the token is valid, the verified variable will contain the decoded payload (means the data associated to that token) of the token.
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            if (verified) {
                // If the token is successfully verified, the middleware attempts to find a user in the database with the `_id` obtained from the token's payload (`verified._id`)
                const user = await User.findOne({ _id: verified._id });
                if (user) {
                    // If a user is found, it attaches the user object to the request object (req.user = user) and calls the next function to pass control to the next middleware or route handler
                    req.user = user;
                    next();
                }
                else {
                    res.status(401).send("Access denied");
                }
            }
            else {
                res.status(401).send("Access denied");
            }
        }
        else {
            res.status(401).send("Access denied");
        }
    }
    catch (err) {
        next(err);
    }
}

module.exports = authMiddleware;

// If the token is valid, jwt.verify will return an object containing the decoded payload data