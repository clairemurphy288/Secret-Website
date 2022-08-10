import express from 'express';
import ejs from 'ejs';

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}));

