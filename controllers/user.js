import expressAsyncHandler from "express-async-handler";
import { User } from "../database/models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_SECURE = (process.env.COOKIE_SECURE ?? '').toLowerCase() === 'true' || isProd;
const COOKIE_SAME_SITE = COOKIE_SECURE ? 'none' : 'lax';



const login = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const foundUser = await User.findOne({ username });
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: "Not authorised" });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        return res.status(401).json({ message: "Not authorised" });
    }

    const accessToken = jwt.sign(
        { UserInfo: { username: foundUser.username, roles: foundUser.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" },
    );

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ accessToken, roles: foundUser.roles, message: "Logged in successfully." });
})

const refresh = expressAsyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden" })
            }

            const foundUser = await User.findOne({ username: decoded.username }).exec();

            if (!foundUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const accessToken = jwt.sign(
                { UserInfo: { username: foundUser.username, roles: foundUser.roles } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1m" }
            );
            return res.status(200).json({ accessToken });
        }
    );

})

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        res.sendStatus(204);
    }//No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: COOKIE_SAME_SITE, secure: COOKIE_SECURE })
    res.json({ message: 'Cookie cleared' })
}

const register = expressAsyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    const existing = await User.findOne({ username });
    if (existing) {
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, roles: ["Customer"] });

    const accessToken = jwt.sign(
        { UserInfo: { username: newUser.username, roles: newUser.roles } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    );

    const refreshToken = jwt.sign(
        { username: newUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAME_SITE,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ accessToken, roles: newUser.roles, message: "User created successfully." });
})

const getAllCustomers = expressAsyncHandler(async (req, res) => {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const roles = decoded?.UserInfo?.roles || [];
            const rolesLower = Array.isArray(roles) ? roles.map(r => String(r).toLowerCase()) : [String(roles).toLowerCase()];
            const isAdmin = rolesLower.includes('admin');
            if (!isAdmin) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const customers = await User.find({ roles: 'Customer' })
                .select('-password')
                .lean();

            return res.status(200).json({ users: customers });
        }
    );
});

export { login, logout, refresh, register, getAllCustomers };