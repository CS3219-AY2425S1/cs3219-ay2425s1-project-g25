import cors from "cors";
import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { WebSocket } from "ws";
import collaborationRoutes from "./routes/collaborationRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { connectToDatabase } from "./utils/database";
import { setUpKafkaSubscribers } from "./utils/kafkaClient";
const setupWSConnection = require("y-websocket/bin/utils").setupWSConnection;


dotenv.config({ path: path.resolve(__dirname, "./.env") });

connectToDatabase();

const port = process.env.PORT || 3004;
const app: Express = express();

const server = http.createServer(app);

app.use(express.json());

app.use("/api/collab", collaborationRoutes);

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use(errorHandler);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
    // // Extract sessionId from the URL for connecting to the Yjs document
    // const sessionId = req.url?.split('/').pop();

    // console.log(`A user has connected to session: ${sessionId}!`)

    // if (sessionId) {
    //     // Initialize or get the Yjs document from YDocManager
    //     const ydoc = YDocManager.getDoc(sessionId) || YDocManager.initializeDoc(sessionId);
    
    //     // Set up the document synchronization logic
    //     const encoder = Y.encodeStateAsUpdate(ydoc);
    //     ws.send(encoder);
    
    //     ws.on('message', (message) => {
    //         const update = new Uint8Array(message instanceof ArrayBuffer ? message : (message as Buffer).buffer);
    //         Y.applyUpdate(ydoc, update);
    //         wss.clients.forEach((client) => {
    //             if (client !== ws && client.readyState === WebSocket.OPEN) {
    //                 client.send(update);
    //             }
    //         });
    //     });
    
    //     ws.on('close', () => {
    //         console.log(`Connection closed for session: ${sessionId}`);
    //     });

    // } else {
    //     console.error("No session ID found in WebSocket connection URL.");
    //     ws.close();
    // }
    setupWSConnection(ws, req);
});

// Start the server
server.listen(port, async () => {
    console.log(`Collaboration service running on http://localhost:${port}`);

    await setUpKafkaSubscribers();
});