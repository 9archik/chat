import { Button } from 'react-bootstrap';
import { Dispatch, useEffect, useRef, useState } from 'react';
import FirstInput from './firstInput';
import { IErrorFromServer, IForm } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import { IActionLogin, UserActionTypes } from '../../types/user';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from '../../hooks/useTypeSelector';

const Host = process.env.REACT_APP_HOST;

interface IRegistrationQuery {
	userId?: number;
	error?: {
		user?: boolean;
		server?: boolean;
	};
}

const Register = () => {
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

	const [passwordRep, setPasswordRep] = useState<IForm>({
		value: '',
		pattern: /^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]{8,}$/,
		error: 'Пароли не совпадают',
		onFocus: true,
	});

	const sentNames = useRef<string[]>([]);

	const [serverError, setServerError] = useState<IErrorFromServer>({
		name: false,
		server: false,
	});

	const registerSubmit = () => {
		fetch(`${Host}/auth/register`, {
			method: 'POST',
			credentials: 'include',

			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: user.value,
				password: password.value,
				passwordRep: passwordRep.value,
			}),
		})
			.then((response) => response.json())
			.then((data: IRegistrationQuery) => {
				if (data?.userId) {
					dispatch({ type: UserActionTypes.LOGIN, payload: data?.userId });
					navigate('/');
					return;
				}
				if (data?.error?.user) {
					sentNames.current.push(user.value);
					setServerError({
						...serverError,
						name: true,
						server: false,
					});
					return;
				}
				if (data?.error?.server) {
					setServerError({ ...serverError, server: true });
					return;
				}
			})
			.catch((error) => {
				setServerError({ ...serverError, server: true });
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
				registerSubmit();
			}}
			className="container d-flex flex-column">
			<div className="d-flex flex-column mt-2 text-white">
				<div className="d-flex justify-content-between gap-3">
					<span>Username</span>
					<FirstInput user={user} serverError={serverError} />
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
					{password.error && !password.onFocus && (
						<span className="text-danger">{password.error}</span>
					)}
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
							if (regex.test(event.target.value)) {
								setPassword({
									...password,
									error: !password.pattern.test(event.target.value)
										? 'Минимальная длина 8 символов'
										: null,
									value: event.target.value,
								});
							}
						}

						if (serverError.server) {
							setServerError({ ...serverError, server: false });
						}
					}}
				/>
			</div>

			<div className="d-flex flex-column mt-2 text-white">
				<div className="d-flex justify-content-between gap-3">
					<span>Repeat password</span>
					{passwordRep.error && !passwordRep.onFocus && (
						<span className="text-danger">{passwordRep.error}</span>
					)}
				</div>
				<input
					className="bg-transparent mt-1 px-3 border border-dark py-1 text-white"
					placeholder="enter username"
					required
					type="password"
					value={passwordRep.value}
					onFocus={() => {
						setPasswordRep({ ...passwordRep, onFocus: true });
					}}
					onBlur={() => {
						setPasswordRep({ ...passwordRep, onFocus: false });
					}}
					onChange={(event) => {
						const regex = /^[a-zA-Z0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?~]{0,}$/;

						if (regex.test(event.target.value)) {
							setPasswordRep({
								...passwordRep,
								error: event.target.value !== password.value ? 'Пароли не совпадают' : null,
								value: event.target.value,
							});
						}

						if (serverError.server) {
							setServerError({ ...serverError, server: false });
						}
					}}
				/>
			</div>

			<Button
				disabled={
					user.error || password.error || passwordRep.error || serverError.name ? true : false
				}
				className="mt-3"
				type="submit">
				Register
			</Button>
		</form>
	);
};

export default Register;
