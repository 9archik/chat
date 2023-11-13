import { getRepository } from 'typeorm';

import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SECRET;

interface IAuthQuery {
	username: string;
	password: string;
}

const generateAccessToken = (id) => {
	const payload = {
		id,
	};
	return jwt.sign(payload, secret, { expiresIn: '90d' });
};

export const registration = async (
	req: Request<unknown, unknown, IAuthQuery, unknown>,
	res: Response,
) => {
	try {
		const userRepository = AppDataSource.getRepository(User);
		const { username, password } = req.body;
		const user = await userRepository.findOne({ where: { username: username } });
		if (!user) {
			const hashPassword = bcrypt.hashSync(password, 7);
			const user = new User();
			user.password = hashPassword;
			user.username = username;
			await userRepository.save(user);

			const token = generateAccessToken(user.id);

			res
				.cookie('token', token, {
					httpOnly: false,
					maxAge: 90 * 24 * 60 * 60 * 1000,
					expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
				})
				.status(200)
				.json({ userId: user.id });
		} else {
			res.status(403).json({ error: { user: true } });
		}
	} catch {
		res.status(500).json({ error: { server: true } });
	}
};

export const login = async (req: Request<unknown, unknown, IAuthQuery, unknown>, res: Response) => {
	try {
		const { username, password } = req.body;
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOne({ where: { username: username } });
		if (user) {
			const validPassword = bcrypt.compareSync(password, user.password);
			if (!validPassword) {
				return res.status(400).json({ error: { password: 'Введен неверный пароль' } });
			}
			const token = generateAccessToken(user.id);
			return res
				.cookie('token', token, { maxAge: 90 * 24 * 60 * 60 * 1000, httpOnly: false })
				.json({ userId: user.id });
		} else {
			res.status(400).json({ error: { user: 'Пользователя не существует' } });
		}
	} catch {
		res.status(500).json({ error: { server: 'Ошибка сервера' } });
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;

		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);

		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const newToken = generateAccessToken(decodedToken['id']);

			res
				.cookie('token', token, {
					httpOnly: false,
					maxAge: 90 * 24 * 60 * 60 * 1000,
					expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
				})
				.status(200)
				.json({ userId: Number(decodedToken['id']) });
			return;
		} else {
			throw new Error('Time out');
		}
	} catch (error) {
		res.status(401).json({ error: error.message });
	}
};

export const logout = (req: Request, res: Response) => {
	try {
		res.clearCookie('token');
	} catch (error) {
		res.status(500).json({ error: 'server error' });
	}
};
