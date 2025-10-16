const verifyAdmin = (req, res, next) => {
    const roles = req.roles;

    if (!roles) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const hasAdminRole = Array.isArray(roles)
        ? roles.map((r) => String(r).toLowerCase()).includes("admin")
        : String(roles).toLowerCase() === "admin";

    if (!hasAdminRole) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};

export default verifyAdmin;


