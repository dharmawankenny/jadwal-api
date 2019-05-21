import 'dotenv/config';

import express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import jadwalScrapperRoutes from './api/routes/jadwalScrapperRoutes';
import jadwalServerRoutes from './api/routes/jadwalServerRoutes';

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useFindAndModify: false })
  .then(()=> {
    console.log('Database connected');
  })
  .catch((error)=> {
    console.log('Error connecting to database');
  });

const server = express();
const PORT = process.env.PORT || 5000;

// Server base configs, ssl redirection, CORS header, etc.
server.use(sslRedirect());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors());

// allow all CORS, this is not recommended but it is a
// proof of concept app anyway so its okay
server.options('*', cors())

// register API routes defined in the eaiRoute file
jadwalScrapperRoutes(server);
jadwalServerRoutes(server);

server.listen(PORT, () => console.log(`Jadwal API server started on:  ${ PORT }`));
