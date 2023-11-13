import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { IErrorFromServer, IForm } from '../../interfaces';
import FirstInput from './firstInput';
import PasswordError from './passwordError';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IActionLogin, UserActionTypes } from '../../types/user';
import { getCookie } from 'typescript-cookie';
import { isJwtPayload, isNumber } from '../../typeGuard';
import { useTypedSelector } from '../../hooks/useTypeSelector';

const Host = process.env.REACT_APP_HOST;

const secret = process.env.REACT_APP_SECRET;

interface ILoginQuery {
	userId?: number;
	error?: {
		server?: boolean;
		password?: boolean;
		user?: boolean;
	};
}

const Login = () => {
	const navigate = useNavigate();
	const dispatch: Dispatch<IActionLogin> = useDispatch();
	const [user, setUser] = useState<IForm>({
		value: '',
		pattern: /^[^\s]{2,}$/,
		error: 'Минимальная длина 2 символа',
		onFocus: true,
	});

	const [password, setPassword] = useState<IForm>({
		value: '',
		pattern: /^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]{8,}$/,
		error: 'Минимальная длина 8 символов',
		onFocus: true,
	});

	const [serverError, setServerError] = useState<IErrorFromServer>({
		name: false,
		server: false,
	});

	const sentNames = useRef<string[]>([]);

	const loginSubmit = () => {
		fetch(`${Host}/auth/login`, {
			method: 'POST',
			credentials: 'include',

			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: user.value, password: password.value }),
		})
			.then((response) => response.json())
			.then((data: ILoginQuery) => {
				if (data?.userId) {
					setServerError({
						...serverError,
						password: false,
						name: false,
						server: false,
					});
					dispatch({ type: UserActionTypes.LOGIN, payload: data?.userId });
					navigate('/');
					return;
				}
				if (data?.error?.user) {
					sentNames.current.push(user.value);
					setServerError({ ...serverError, name: true });
					dispatch({ type: UserActionTypes.LOGIN, payload: null });
					return;
				}

				if (data?.error?.password) {
					setServerError({ ...serverError, password: true });
					dispatch({ type: UserActionTypes.LOGIN, payload: null });
					return;
				}

				if (data?.error?.server) {
					setServerError({ ...serverError, server: true });
					dispatch({ type: UserActionTypes.LOGIN, payload: null });
					return;
				}
			})
			.catch((error) => {
				setServerError({ ...serverError, server: true });
				dispatch({ type: UserActionTypes.LOGIN, payload: null });
			});
	};

	const userInfo = useTypedSelector((state) => state.user);

	if (userInfo.user?.id) {
		navigate('/');
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				loginSubmit();
			}}
			className="container d-flex flex-column">
			<div className="d-flex flex-column mt-2 text-white">
				<div className="d-flex justify-content-between gap-3">
					<span>Username</span>
					<FirstInput serverError={serverError} user={user} />
				</div>
				<input
					className="bg-transparent mt-1 border border-dark py-1 px-3 text-white"
					placeholder="enter username"
					value={user.value}
					onFocus={() => {
						setUser({ ...user, onFocus: true });
					}}
					onBlur={() => {
						setUser({ ...user, onFocus: false });
					}}
					onChange={(event) => {
						setUser({
							...user,
							value: event.target.value.replace(/\s/g, ''),
							error: !user.pattern.test(event.target.value)
								? 'Минимальная длина - 2 символа'
								: null,
						});

						for (let i = 0; i < sentNames.current.length; i++) {
							if (sentNames.current[i] === event.target.value.replace(/\s/g, '')) {
								setServerError({ ...serverError, server: false, name: true });
								return;
							}
						}

						setServerError({ ...serverError, server: false, name: false });
					}}
					required
				/>
			</div>

			<div className="d-flex flex-column mt-2 text-white">
				<div className="d-flex justify-content-between gap-3">
					<span>Password</span>
					<PasswordError password={password} serverError={serverError} />
				</div>
				<input
					className="bg-transparent mt-1 px-3 border border-dark py-1 text-white"
					placeholder="enter username"
					required
					type="password"
					value={password.value}
					onFocus={() => {
						setPassword({ ...password, onFocus: true });
					}}
					onBlur={() => {
						setPassword({ ...password, onFocus: false });
					}}
					onChange={(event) => {
						const regex = /^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]{0,}$/;
						if (regex.test(event.target.value)) {
							setPassword({
								...password,
								error: !password.pattern.test(event.target.value)
									? 'Минимальная длина 8 символов'
									: null,
								value: event.target.value,
							});

							if (serverError.password) {
								setServerError({ ...serverError, server: false, password: false });
							} else {
								setServerError({ ...serverError, server: false });
							}
						}
					}}
				/>
			</div>

			<Button
				disabled={
					password.error || user.error || serverError.password || serverError.name ? true : false
				}
				className="mt-3"
				type="submit">
				Login
			</Button>
		</form>
	);
};

export default Login;
