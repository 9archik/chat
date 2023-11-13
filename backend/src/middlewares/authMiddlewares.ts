import { Request, RequestHandler } from 'express';

interface IRegistrationQuery {
	username?: string;
	password?: string;
	passwordRep?: string;
}

export const registrationMiddleware: RequestHandler = (
	req: Request<unknown, unknown, IRegistrationQuery, unknown>,
	res,
	next,
) => {
	const usernameRegex = /^[^\s]{2,}$/;
	if (
		usernameRegex.test(req.body.username) &&
		req?.body?.password?.length >= 8 &&
		req?.body?.password === req?.body?.passwordRep
	) {
		next();
	} else {
		res.status(400).send('Неверные данные для регистрации');
	}
};

export const loginMiddleware: RequestHandler = (
	req: Request<unknown, unknown, IRegistrationQuery, unknown>,
	res,
	next,
) => {
	const usernameRegex = /^[^\s]{2,}$/;
	if (usernameRegex.test(req.body.username) && req?.body?.password?.length >= 8) {
		next();
	} else {
		res.status(400).send('Неверные данные для авторизации');
	}
};
