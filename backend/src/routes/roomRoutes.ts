
import { Router } from 'express';
import {  createRoom, getMyRooms, getRoomInfo, getRooms, addUserToRoom } from '../controllers/roomControllers';
import { createRoomMiddleware } from '../middlewares/roomMiddlewares';

const roomRouter = Router();

roomRouter.post('/create', createRoomMiddleware, createRoom);
roomRouter.post('/join/:id', addUserToRoom);
roomRouter.get('/list', getRooms);
roomRouter.get('/mylist', getMyRooms);
roomRouter.get('/:id', getRoomInfo)



export default roomRouter;
