import cors from 'cors';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import questionsRoutes from './question-service/routes/questionsRoutes';
import categoriesRoutes from './question-service/routes/categoriesRoutes';
import { connectToDatabase } from './utils/database';
import { errorHandler } from './middlewares/errorHandler';
import { populateQuestions } from './utils/populateQuestions';

dotenv.config();

connectToDatabase();

const port = process.env.PORT || 3001;
const app: Express = express();

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.match(/localhost/) || origin.match(/127\.0\.0\.1/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use('/api/questions', questionsRoutes);
app.use('/api/categories', categoriesRoutes);

app.use(errorHandler);

if (process.env.POPULATE_DB) {
  populateQuestions();
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
