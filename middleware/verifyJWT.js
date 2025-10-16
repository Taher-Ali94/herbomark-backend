
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";



const verifyJwt = expressAsyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next()
        }

    );
});


export default verifyJwt;