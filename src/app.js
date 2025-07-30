import express from 'express';
import cors from 'cors';
import errorMiddleware from './middleware/error.middleware.js'
import countriesRoutes from './routes/countries.routes.js';
const app = express();


// Middleware
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/v1', countriesRoutes);


// Error handling
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handleError);

app.listen(3001, '0.0.0.0', () => {
  console.log("Adondevamos.back is running at ", 3001);
});