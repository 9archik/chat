import { AppDataSource } from './data-source';
import { User } from './entity/User';
import * as express from 'express';
import authRouter from './routes/authRoutes';
import * as dotenv from 'dotenv';
import roomRouter from './routes/roomRoutes';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import * as cors from 'cors';
import * as jwt from 'jsonwebtoken';
import { CustomSocket } from './interface';
import { Room } from './entity/Room';
import { Message } from './entity/Message';
import { UsersInRoom } from './entity/UsersInRoom';

const cookieParser = require('cookie-parser');

dotenv.config();

const port = process.env.PORT;

const secret = process.env.SECRET;

const app = express();

const server = createServer(app);

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: 'GET,PUT',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
	},
});
app.use(cookieParser());
app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
		methods: 'GET,PUT,POST,DELETE',
		allowedHeaders: 'Content-Type, Authorization',
		credentials: true,
	}),
);
app.use('/auth', authRouter);
app.use('/room', roomRouter);

AppDataSource.initialize()
	.then(async () => {
		server.listen(port, () => console.log('Example app is listening on port', process.env.SECRET));
		io.on('connection', (socket: CustomSocket) => {
			socket.on('join', async (room) => {
				try {
					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const decodedToken = jwt.verify(token, secret);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						socket.customId = `room=${room}&user=${decodedToken['id']}`;
						await socket.join(room);
						const messageRepository = AppDataSource.getRepository(Message);
						const messages = await messageRepository
							.createQueryBuilder('message')
							.leftJoinAndSelect('message.user', 'user')
							.leftJoinAndSelect('message.userInRoom', 'uir')

							.where('message.room.id = :roomId', { roomId: room })
							.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
							.getMany();

						io.to(room).emit('message_list', messages);
					}
				} catch {}
			});
			socket.on('message', async (message) => {
				try {
					const roomRepository = AppDataSource.getRepository(Room);
					const userRepository = AppDataSource.getRepository(User);
					const usersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
					const messageRepository = AppDataSource.getRepository(Message);

					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const roomId = Array.from(socket.rooms)[1];

					const room = await roomRepository.findOne({ where: { id: Number(roomId) } });

					const decodedToken = jwt.verify(token, secret);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						const user = await userRepository.findOne({
							where: { id: Number(decodedToken['id']) },
						});

						const userInRoom = await usersInRoomRepository
							.createQueryBuilder('uir')
							.where('uir.user = :userId', { userId: Number(decodedToken['id']) })
							.andWhere('uir.room = :roomId', { roomId: roomId })
							.getOne();

						if (!userInRoom.bannedUntil || new Date(userInRoom.bannedUntil) < new Date()) {
							const messageDB = new Message();
							userInRoom.bannedUntil = null;
							messageDB.text = message;
							messageDB.room = room;
							messageDB.user = user;
							messageDB.userInRoom = userInRoom;

							await messageRepository.save(messageDB);

							const messages = await messageRepository
								.createQueryBuilder('message')
								.leftJoinAndSelect('message.user', 'user')
								.leftJoinAndSelect('message.userInRoom', 'uir')

								.where('message.room.id = :roomId', { roomId: roomId })
								.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
								.getMany();

							io.to(roomId).emit('message_list', messages);
						}
					}
				} catch {}
			});
			socket.on('ban', async (userTo, days) => {
				try {
					const roomRepository = AppDataSource.getRepository(Room);
					const userRepository = AppDataSource.getRepository(User);
					const usersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
					const messageRepository = AppDataSource.getRepository(Message);

					console.log(userTo, days);

					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const roomId = Array.from(socket.rooms)[1];

					const decodedToken = jwt.verify(token, secret);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						const userInRoomFrom = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: Number(decodedToken['id']) })
							.getOne();
						const userInRoomTo = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: Number(userTo) })
							.getOne();

						if (userInRoomFrom && userInRoomTo) {
							if (
								userInRoomFrom.role === 'admin' &&
								(!userInRoomTo.bannedUntil || new Date(userInRoomTo.bannedUntil) < new Date())
							) {
								userInRoomTo.role = 'member';
								userInRoomTo.bannedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
								await usersInRoomRepository.save(userInRoomTo);
								const messages = await messageRepository
									.createQueryBuilder('message')
									.leftJoinAndSelect('message.user', 'user')
									.leftJoinAndSelect('message.userInRoom', 'uir')

									.where('message.room.id = :roomId', { roomId: roomId })
									.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
									.getMany();

								io.to(roomId).emit('ban', {
									userId: Number(userTo),
									ban: userInRoomTo.bannedUntil,
									messages,
								});
								return;
							}

							if (userInRoomFrom.role === 'moderator') {
								console.log('days', days, userInRoomTo);
								if (
									userInRoomTo.role === 'member' &&
									(!userInRoomTo.bannedUntil || new Date(userInRoomTo.bannedUntil) < new Date())
								) {
									userInRoomTo.bannedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
									await usersInRoomRepository.save(userInRoomTo);
									const messages = await messageRepository
										.createQueryBuilder('message')
										.leftJoinAndSelect('message.user', 'user')
										.leftJoinAndSelect('message.userInRoom', 'uir')

										.where('message.room.id = :roomId', { roomId: roomId })
										.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
										.getMany();
									console.log('days', days);
									io.to(roomId).emit('ban', {
										userId: Number(userTo),
										ban: userInRoomTo.bannedUntil,
										messages: messages,
									});
									return;
								} else {
									return;
								}
							}
						}
					}
				} catch {}
			});
			socket.on('kick', async (userTo) => {
				try {
					const roomRepository = AppDataSource.getRepository(Room);
					const userRepository = AppDataSource.getRepository(User);
					const usersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
					const messageRepository = AppDataSource.getRepository(Message);

					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const roomId = Array.from(socket.rooms)[1];

					const decodedToken = jwt.verify(token, secret);

					console.log(userTo);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						const userInRoomFrom = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: Number(decodedToken['id']) })
							.getOne();
						const userInRoomTo = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: userTo })
							.getOne();

						if (userInRoomFrom && userInRoomTo) {
							if (userInRoomFrom.role === 'admin') {
								userInRoomTo.kick = true;
								userInRoomTo.leave = true;
								await usersInRoomRepository.save(userInRoomTo);
								io.to(roomId).emit('kick_user', { userId: userTo });
								return;
							}

							if (userInRoomFrom.role === 'moderator') {
								if (userInRoomTo.role === 'member') {
									userInRoomTo.kick = true;
									userInRoomTo.leave = true;
									await usersInRoomRepository.save(userInRoomTo);

									io.to(roomId).emit('kick_user', { userId: userTo });
									return;
								} else {
									return;
								}
							}
						}
					}
				} catch {}
			});
			socket.on('leave', async () => {
				try {
					const roomRepository = AppDataSource.getRepository(Room);
					const userRepository = AppDataSource.getRepository(User);
					const usersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
					const messageRepository = AppDataSource.getRepository(Message);

					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const roomId = Array.from(socket.rooms)[1];

					const decodedToken = jwt.verify(token, secret);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						const userInRoom = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: Number(decodedToken['id']) })
							.getOne();

						userInRoom.leave = true;
						await usersInRoomRepository.save(userInRoom);
						io.to(roomId).emit('kick_user', { userId: decodedToken['id'] });
					}
				} catch {}
			});
			socket.on('change_role', async (userTo) => {
				try {
					const roomRepository = AppDataSource.getRepository(Room);
					const userRepository = AppDataSource.getRepository(User);
					const usersInRoomRepository = AppDataSource.getRepository(UsersInRoom);
					const messageRepository = AppDataSource.getRepository(Message);

					const cookieString = socket.client.request.headers.cookie;

					const cookies = {};
					cookieString.split(';').forEach((cookie) => {
						const parts = cookie.split('=');
						const name = parts.shift().trim();
						const value = decodeURI(parts.join('='));
						cookies[name] = value;
					});

					const token = cookies['token'];

					const roomId = Array.from(socket.rooms)[1];

					const decodedToken = jwt.verify(token, secret);

					if (decodedToken['id'] && decodedToken['exp'] * 1000 > Date.now()) {
						const userInRoomFrom = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: Number(decodedToken['id']) })
							.getOne();
						const userInRoomTo = await usersInRoomRepository
							.createQueryBuilder('usersInRoom')
							.where('usersInRoom.room.id = :roomId', { roomId: roomId })
							.andWhere('usersInRoom.user.id = :userId', { userId: userTo })
							.getOne();

						if (userInRoomFrom.role === 'admin' && userInRoomTo.role === 'member') {
							userInRoomTo.role = 'moderator';
							await usersInRoomRepository.save(userInRoomTo);
							const messages = await messageRepository
								.createQueryBuilder('message')
								.leftJoinAndSelect('message.user', 'user')
								.leftJoinAndSelect('message.userInRoom', 'uir')

								.where('message.room.id = :roomId', { roomId: roomId })
								.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
								.getMany();
							io.to(roomId).emit('change_role', {
								userId: Number(userTo),
								role: 'moderator',
								messages,
							});
							return;
						}
						if (userInRoomFrom.role === 'admin' && userInRoomTo.role === 'moderator') {
							userInRoomTo.role = 'member';
							await usersInRoomRepository.save(userInRoomTo);
							const messages = await messageRepository
								.createQueryBuilder('message')
								.leftJoinAndSelect('message.user', 'user')
								.leftJoinAndSelect('message.userInRoom', 'uir')

								.where('message.room.id = :roomId', { roomId: roomId })
								.select(['message.id', 'message.text', 'uir', 'user.id', 'user.username'])
								.getMany();
							io.to(roomId).emit('change_role', {
								userId: Number(userTo),
								role: 'member',
								messages,
							});
							return;
						}
					}
				} catch {}
			});
			io.on('disconnect', () => {
				console.log('user disconnect');
			});
		});
	})
	.catch((error) => console.log(error));
