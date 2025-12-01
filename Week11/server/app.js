import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import signupRouter from './routes/signup.js';
import { createIndexes } from './repositories/participants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

app.use(express.json());

// 讓 Node 直接 serve Week09/client 裡的 HTML / JS 
const clientPath = path.join(__dirname, '../../Week09/client');
app.use(express.static(clientPath));

// API route
app.use('/api/signup', signupRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'signup_form.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const port = process.env.PORT || 3001;

connectDB()
  .then(async () => {
    await createIndexes();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Serving client from: ${clientPath}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect MongoDB', error);
    process.exit(1);
  });
