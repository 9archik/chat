import { AppDataSource } from '../data-source';
import { Message } from '../entity/Message';
import { Room } from '../entity/Room';
import { User } from '../entity/User';
import { UsersInRoom } from '../entity/UsersInRoom';
import { Server } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const secret = process.env.SECRET;

export const createRoom = async (req: Request, res: Response) => {
	try {
		const roomRepository = AppDataSource.getRepository(Room);
		const userRepository = AppDataSource.getRepository(User);
		const UsersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
		const token = req.cookies.token;

		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);

		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const user = await userRepository.findOne({ where: { id: Number(decodedToken['id']) } });
			if (user) {
				const room = roomRepository.create({ name: req.body.room });

				await roomRepository.save(room);

				const userInRoom = new UsersInRoom();

				userInRoom.role = 'admin';

				userInRoom.user = user;

				userInRoom.room = room;

				await UsersInRoomRepository.save(userInRoom);

				res.status(200).json({ roomId: room.id });
			}
		} else {
			res.status(401).json({ error: { auth: true } });
			return;
		}
	} catch {
		res.status(400).json({ error: { server: true } });
	}
};

export const addUserToRoom = async (req: Request, res: Response) => {
	try {
		const roomRepository = AppDataSource.getRepository(Room);
		const userRepository = AppDataSource.getRepository(User);
		const messageRepository = AppDataSource.getRepository(Message);
		const UsersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
		const token = req.cookies.token;

		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);

		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const user = await userRepository.findOne({ where: { id: Number(decodedToken['id']) } });
			const room = await roomRepository.findOne({ where: { id: Number(req.params.id) } });
			const userInRoom = await AppDataSource.getRepository(UsersInRoom)
				.createQueryBuilder('uir')
				.where('uir.user = :userId', { userId: Number(decodedToken['id']) })
				.andWhere('uir.room = :roomId', { roomId: Number(req.params.id) })
				.getOne();

			console.log('user', userInRoom);

			if (!userInRoom) {
				const userInRoom = new UsersInRoom();
				userInRoom.user = user;
				userInRoom.room = room;
				await UsersInRoomRepository.save(userInRoom);

				const messages = await messageRepository
					.createQueryBuilder('message')
					.leftJoinAndSelect('message.user', 'user')
					.where('message.room.id = :roomId', { roomId: Number(req.params.id) })
					.select(['message.id', 'message.text', 'user.id', 'user.username'])
					.getMany();

				res.status(200).json({ success: true });
				return;
			} else {
				if (userInRoom.leave) {
					if (!userInRoom.kick) {
						userInRoom.leave = false;
						await UsersInRoomRepository.save(userInRoom);
						res.status(200).json({ success: true });
						return;
					} else {
						res.status(422).json({ error: { user: 'Пользователь забанен' } });
					}
				}
				return;
			}
		} else {
			res.status(401).json({ error: { auth: true } });
			return;
		}
	} catch {
		res.status(400).json({ success: false });
	}
};

export const getRoomInfo = async (req: Request, res: Response) => {
	try {
		const roomRepository = AppDataSource.getRepository(Room);
		const userRepository = AppDataSource.getRepository(User);
		const UsersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
		const messageRepository = AppDataSource.getRepository(Message);
		const token = req.cookies.token;
		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);
		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const info: any = {};

			const messages = await messageRepository
				.createQueryBuilder('message')
				.leftJoinAndSelect('message.user', 'user')
				.leftJoinAndSelect('message.userInRoom', 'uir')

				.where('message.room.id = :roomId', { roomId: req.params.id })
				.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
				.getMany();

			const userInfo = await AppDataSource.getRepository(UsersInRoom)
				.createQueryBuilder('uir')
				.where('uir.user = :userId', { userId: Number(decodedToken['id']) })
				.andWhere('uir.room = :roomId', { roomId: req.params.id })
				.andWhere('uir.leave = :leave AND uir.kick = :kick', { leave: false, kick: false })
				.select(['uir.role', 'uir.bannedUntil'])
				.getOne();

			if (userInfo) {
				const room = await roomRepository.findOne({ where: { id: Number(req.params.id) } });
				info.role = userInfo.role;
				info.bannedUntil = userInfo.bannedUntil;
				info.room = room;
				res.status(200).json(info);
				return;
			} else {
				res.status(404).json({ error: { room: 'Комнаты нет либо пользователь не состоит в ней' } });
				return;
			}
		}
	} catch {
		res.status(404).json({ error: { server: true } });
	}
};

export const getRooms = async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		const roomRepository = AppDataSource.getRepository(Room);

		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);

		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const rooms = await roomRepository
				.createQueryBuilder('room')
				.leftJoinAndSelect('room.users', 'userInRoom', 'userInRoom.user = :userId', { userId: decodedToken['id'] })
				.where('userInRoom.id IS NULL OR (userInRoom.leave = true AND userInRoom.kick = false)')
				.getMany();

			console.log('token', decodedToken['id']);

			res.status(200).json(rooms);
		} else {
			res.status(401).json({ error: { auth: true } });
			return;
		}
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

export const getMyRooms = async (req: Request, res: Response) => {
	try {
		const token = req.cookies.token;
		const userRepository = AppDataSource.getRepository(UsersInRoom);
		const roomRepository = AppDataSource.getRepository(Room);

		if (!token) {
			res.status(401).json({ error: { auth: true } });
			return;
		}

		const decodedToken = jwt.verify(token, secret);

		if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
			const rooms = await roomRepository
				.createQueryBuilder('room')
				.innerJoin('room.users', 'usersInRoom')
				.where(
					'usersInRoom.user = :userId AND usersInRoom.leave = :leave AND usersInRoom.kick = :kick',
					{
						userId: decodedToken['id'],
						leave: false,
						kick: false,
					},
				)
				.getMany();

			res.status(200).json(rooms);
		} else {
			res.status(401).json({ error: { auth: true } });
			return;
		}
	} catch (error) {
		res.status(400).json({ success: false });
	}
};
