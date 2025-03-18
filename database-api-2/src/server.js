import express from 'express';

import userPostHandler from './http/users/post/index.js';
import userGetOneHandler from './http/users/getOne/index.js';
import userPutHandler from './http/users/put/index.js';
import userDeleteHandler from './http/users/delete/index.js';

import filePostHandler from './http/files/post/index.js';
import fileGetHandler from './http/files/get/index.js';
import fileGetOneHandler from './http/files/getOne/index.js';
import filePutHandler from './http/files/put/index.js';
import fileDeleteHandler from './http/files/delete/index.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// User routes
app.use('/users', userPostHandler);
app.use('/users', userGetOneHandler);
app.use('/users', userPutHandler);
app.use('/users', userDeleteHandler);

// File routes
app.use('/files', filePostHandler);
app.use('/files', fileGetHandler);
app.use('/files', fileGetOneHandler);
app.use('/files', filePutHandler);
app.use('/files', fileDeleteHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('API is running');
});

export default app;