import app from './app.js'
import { router } from './routers/greeting.js'
import { errorMiddleware } from "./middleware/globalErrorHandler.js";
import { NotFoundError } from './errors/errors.js';
import 'dotenv/config'
import { config } from 'dotenv';

config()
app.use('/index', router);

app.all('*', (req, res, next) => {
    next(new NotFoundError())
}) // for unmatched routes

app.use(errorMiddleware); // error handler

app.listen(3000, () => console.log('Listenening'));