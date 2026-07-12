import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const auth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select(
            "-password -resetPasswordToken -resetPasswordExpire"
        );

        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }

        req.user = user;
        return next();
    }

    res.status(401);
    throw new Error("Not authorized");
});

export default auth;