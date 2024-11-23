import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { validateToken } from './validateToken.js';

import { 
    createOrderRoute,
    getOrderRoute,
    getUserOrdersRoute,
    checkoutRoute,
    refundRoute
 } from './routes.js';

import {
    CREATE_ORDER_PATH,
    GET_ORDER_DETAILS_PATH,
    GET_USER_ORDERS_PATH,
    PROCESS_PAYMENT_PATH,
    REQUEST_REFUND_PATH
} from './const.js';


dotenv.config();

async function connectDB() {
  try {
    console.log(process.env.DB_URI)
    await mongoose.connect(process.env.DB_URI as string, {
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Await the database connection right at the top level
await connectDB();

const port = process.env.PORT ;

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(validateToken);
app.post(CREATE_ORDER_PATH, createOrderRoute);
app.get(GET_ORDER_DETAILS_PATH, getOrderRoute);
app.get(GET_USER_ORDERS_PATH, getUserOrdersRoute);
app.put(PROCESS_PAYMENT_PATH, checkoutRoute);
app.post(REQUEST_REFUND_PATH, refundRoute);

app.listen(port, () => {
    console.log(`Server running! port ${port}`);
});
