import { Router } from 'express';
import { login, refreshToken, registration } from '../controllers/authControllers';
import { loginMiddleware, registrationMiddleware } from '../middlewares/authMiddlewares';

const authRouter = Router();

authRouter.post('/register', registrationMiddleware, registration);
authRouter.post('/login', loginMiddleware, login);
authRouter.post('/refresh', refreshToken);

export default authRouter;
