import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof Error) {
        console.error("Error:", err.message);
        return res.status(400).json({ message: err.message });
    } else {
        console.error("Unexpected error:", err);
        return res.status(500).json({ message: "An unexpected error occurred." });
    }
}
