import { FC } from 'react';
import { IErrorFromServer, IFirstInput, IForm } from '../../interfaces';


const FirstInput: FC<IFirstInput> = ({ user, serverError }) => {
	if (serverError.server) {
		return <span className="text-danger">{'Ошибка сервера'}</span>;
	}

	if (serverError.name) {
		return <span className="text-danger">{'Пользователь уже существует'}</span>;
	}

	if (user.error && !user.onFocus) {
		return <span className="text-danger">{'Минимальная длина: 2 символа'}</span>;
	}

	return <></>;
};

export default FirstInput;
