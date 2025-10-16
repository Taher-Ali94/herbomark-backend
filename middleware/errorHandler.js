import { logEvents } from "./logger.js";
import z from "zod";


const errorHandler = (err, req, res, next) => {

    if (err instanceof z.ZodError) {
        formatZodError(res, err);
        logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "zodErrorLog.log");
        return;
    }

    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLog.log");

    console.log(err.stack);

    const errorStatus = res.statusCode ? res.statusCode : 500;

    res.status(errorStatus);
    res.json({ message: err.message });
}

export default errorHandler;


const formatZodError = (res, error) => {
    const errors = error?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));


    res.status(400).json({
        message: "Validation failed",
        errors: errors,
    });
    return;
};