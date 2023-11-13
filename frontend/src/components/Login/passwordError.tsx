import { FC } from 'react';
import { IErrorFromServer, IForm } from '../../interfaces';

interface IPasswordError {
	password: IForm;
	serverError: IErrorFromServer;
}
const PasswordError: FC<IPasswordError> = ({ password, serverError }) => {
	if (serverError.password) {
		return <span className="text-danger">{'Неверный пароль'}</span>;
	}
	if (password.error && !password.onFocus) {
		return <span className="text-danger">{password.error}</span>;
	}
	return <></>;
};

export default PasswordError;
