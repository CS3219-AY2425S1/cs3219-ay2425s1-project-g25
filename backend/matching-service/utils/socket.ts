import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export function initSocket(server: http.Server): Server {
    io = new Server(server, {
        cors: {
            origin: '*',
        },
    });
    return io;
}

export function getSocket(): Server {
    if (!io) {
        throw new Error('Socket.io is not initialized!');
    }
    return io;
}
