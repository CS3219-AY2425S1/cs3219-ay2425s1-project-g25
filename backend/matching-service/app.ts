import cors from 'cors';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './utils/database';
import { errorHandler } from './middlewares/errorHandler';
import matchingRoutes from './routes/matchingRoutes';
import http from 'http';
import { initSocket } from './utils/socket';
import { setupSocketListeners, setupSubscriber } from './controllers/matchingController';

dotenv.config({ path: path.resolve(__dirname, './.env') });

connectToDatabase();

const port = process.env.PORT || 3003;
const app: Express = express();

const server = http.createServer(app);

initSocket(server);

app.use(express.json());

app.use('/api/match', matchingRoutes);

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(errorHandler);

server.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);

  setupSocketListeners();
  
  await setupSubscriber();
});
