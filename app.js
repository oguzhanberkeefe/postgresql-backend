const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const errorHandlingMiddleware = require('./middlewares/ErrorHandlingMiddleware');

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());

app.set('API_SECRET_KEY_USER', process.env.API_SECRET_KEY_USER);
app.set('API_SECRET_KEY_STOREMANAGER', process.env.API_SECRET_KEY_STOREMANAGER);
app.set('API_SECRET_KEY_ADMIN', process.env.API_SECRET_KEY_ADMIN);

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const indexRouter = require('./routes/IndexRouter');
app.use('/api/v1', indexRouter);

app.use((req, res, next) => {
  if (req.url.includes('transport=polling')) {
    return res.status(200).end();
  }
  next();
});

app.use((req, res, next) => next(createError(404)));

app.use(errorHandlingMiddleware);

module.exports = app;
