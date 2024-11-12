import jwt from "jsonwebtoken";

export function decodeToken(token: string): { id: string; isAdmin: boolean } | null {
    try {
        const decoded = jwt.decode(token) as { id: string; isAdmin: boolean };
        if (decoded && decoded.id) {
            return decoded;
        } else {
            throw new Error("Invalid token payload");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Failed to decode token:", error.message);
        } else {
            console.error("Unknown error occurred during token decoding");
        }
        return null;
    }
}
