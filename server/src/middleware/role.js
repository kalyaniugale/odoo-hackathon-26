const role = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error("Not authorized");
        }

        // Admin has access to all protected routes
        if (req.user.role === "Admin") {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error("Access denied");
        }

        next();
    };
};

export default role;