
import { Request, Response } from 'express';
import Order from './models/order.js'; 
import axios from 'axios'; 
 import { Publisher } from './publisher.js'; 
import mongoose, { ObjectId } from 'mongoose';

const publisher = new Publisher();


export async function createOrderRoute(req: Request, res: Response) {
    const { eventId, ticketCategory, quantity, totalPrice } = req.body;
    const {userId} = req.query;
    const order = new Order({
        userId,
        eventId,
        ticketCategory,
        quantity,
        totalPrice
    });
    try {
        const error = await order.validate();
    } catch (error) {
        res.status(400).send('Invalid order data');
        return;        
    }
    try{
        await order.save();
    }
    catch (error){
        res.status(500).send('Error creating order');
        return;
    }
    res.status(201).json(order);
}


export async function getOrderRoute(req: Request, res: Response) {
    const { orderId } = req.query;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching order details');
    }
}

export async function getUserOrdersRoute(req: Request, res: Response) {
    const { userId } = req.query;
    let { page, size } = req.query; // Extract page and size from the request query

    // Default to page 1 if page is not provided, and default to size 10 if size is not provided
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const sizeNum = size ? parseInt(size as string, 10) : 10;
    const skip = (pageNum - 1) * sizeNum; // Calculate the number of documents to skip

    try {
        // Query the database with pagination
        const orders = await Order.find({ userId: new mongoose.Types.ObjectId(String(userId))})
                                  .skip(skip) // Skip the documents for previous pages
                                  .limit(sizeNum); // Limit the number of documents returned

        const totalOrders = await Order.countDocuments({ userId: new mongoose.Types.ObjectId(String(userId))}); // Count the total number of orders for the user

        // If no orders are found, send a 404 response
        if (!orders) {
            return res.status(404).send('No orders found for user');
        }

        // Send a 200 response with the orders and pagination details
        res.status(200).json({
            total: totalOrders,
            page: pageNum,
            size: sizeNum,
            data: orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching orders for user');
    }
}


// export async function getUserOrdersRoute(req: Request, res: Response) {
//     const { userId } = req.query;
//     try {
//         const orders = await Order.find({ userId: new mongoose.Types.ObjectId(String(userId))});
//         if (!orders) {
//             return res.status(404).send('No orders found for user');
//         }
//         res.status(200).json(orders);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error fetching orders for user');
//     }
// }

export async function checkoutRoute(req: Request, res: Response) {
    const { orderId } = req.query;
    const { cc, holder, cvv, exp, charge } = req.body; 

    try {
        const paymentResponse = await axios.post('https://www.cs-wsp.net/_functions/pay', {
            cc,
            holder,
            cvv,
            exp,
            charge
        });
    
        if (paymentResponse.status === 200 && paymentResponse.data.paymentToken) {
            const transactionId = paymentResponse.data.paymentToken; 

            const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'Paid', transactionId: transactionId }, { new: true });

            await publisher.publishOrderUpdate(String(updatedOrder._id), 'Paid',String(updatedOrder.eventId),String(updatedOrder.ticketCategory),updatedOrder.quantity);
            res.status(200).json({ message: 'Payment processed successfully', transactionId });
        } else {
            res.status(400).json({ message: 'Payment processing failed', details: paymentResponse.data });
        }
    } catch (error) {
        
        console.error("Error during checkout process for orderId:", orderId, error);
        res.status(500).json({ message: 'Internal server error', error: error.toString() });
    }
}



export async function refundRoute(req: Request, res: Response) {
    const { orderId } = req.query; 

    try {
        const refundResponse = await axios.post('https://www.cs-wsp.net/_functions/refund', {
            orderId
        });

        if (refundResponse.status === 200) {
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'Refunded' }, { new: true });

            await publisher.publishOrderUpdate(String(updatedOrder._id), 'Refunded',String(updatedOrder.eventId),String(updatedOrder.ticketCategory),updatedOrder.quantity);
            
            res.status(200).json({ message: 'Refund processed successfully' });
        } else {
            res.status(400).json({ message: 'Refund processing failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
