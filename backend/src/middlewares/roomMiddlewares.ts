import { NextFunction, Request, RequestHandler, Response } from 'express';
import { createRoom } from '../controllers/roomControllers';

import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SECRET;

export const createRoomMiddleware: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.cookies.token;

	if (!token) {
		res.status(401).json({ error: { auth: true } });
		return;
	}

	if (!req?.body?.room) {
		res.status(422).json({ error: { data: true } });
		return;
	}

	next();
};
