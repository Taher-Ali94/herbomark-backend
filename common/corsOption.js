import allowedOrigins from "./allowedOrigins.js";




const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 204,
}

export default corsOptions