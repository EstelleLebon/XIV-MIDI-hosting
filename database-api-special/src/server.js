import express from 'express';

import userGetOneHandler from './http/users/getOne/index.js';

import fileGetHandler from './http/files/get/index.js';
import fileGetOneHandler from './http/files/getOne/index.js';


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// User routes
app.use('/users', userGetOneHandler);

// File routes
app.use('/files', fileGetHandler);
app.use('/files', fileGetOneHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;