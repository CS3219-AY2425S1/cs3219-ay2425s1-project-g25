// helpers.ts
import { Server } from "socket.io";

/**
 * Validates if the socket ID is valid and connected.
 * @param io - Socket.IO server instance.
 * @param socketId - Socket ID to validate.
 * @returns Boolean indicating validity.
 */
export function isValidSocketId(io: Server, socketId: string): boolean {
    return io.sockets.sockets.has(socketId);
}
