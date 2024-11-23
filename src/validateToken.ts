import dotenv from 'dotenv';
dotenv.config();
import { Request, Response,NextFunction } from 'express';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 
    const preSharedToken = process.env.ORDERS_SHARED_API_TOKEN;
    if(!preSharedToken){
        return res.sendStatus(500);
    }
    if (token == null) {
        return res.sendStatus(401);
    }
    if (token !== preSharedToken) {
        return res.sendStatus(403); 
    }
    next();
};

export { validateToken };
