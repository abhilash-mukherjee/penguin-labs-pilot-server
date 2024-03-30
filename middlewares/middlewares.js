// middleware.js

import jwt from 'jsonwebtoken';
import { User } from '../db/schemas.js';

const auth = async (req, res, next) => {
    try {
        // Get the token from the request headers
        const authHeader = req.headers.authorization;

        // If no token provided, return unauthorized
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Extract the token from the authHeader
        const token = authHeader.split(" ")[1];

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Extract user id from the decoded token
        const userId = decodedToken.userId;

        // Find the user based on the user id from the token
        const user = await User.findById(userId);

        // If user not found, return unauthorized
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Add user id to request headers
        req.userId = userId;

        // Proceed to the next middleware
        next();
    } catch (error) {
        // If token verification fails, return unauthorized
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export { auth };
