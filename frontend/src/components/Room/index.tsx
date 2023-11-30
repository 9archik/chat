import { useNavigate, useParams } from 'react-router-dom';
import { Dispatch, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useTypedSelector } from '../../hooks/useTypeSelector';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { IActionChangeRole, UserActionTypes } from '../../types/user';
import { RootState } from '../../store/reducers/index';
import styles from './style.module.scss';

interface IMessage {
	id: number;
	text: string;
	user: {
		id: number;
		username: string;
	};
	userInRoom: {
		id: number;
		role: 'member' | 'moderator' | 'admin';
		bannedUntil: string | null;
	} | null;
}

interface IGetRoomQuery {
	room?: { id?: number; name: string };
	bannedUntil?: null | string;
	role?: 'admin' | 'moderator' | 'member';
}

interface IChangeRoleWS {
	userId?: number;
	role?: 'member' | 'admin' | 'moderator';
	messages?: IMessage[];
}

const Host = process.env.REACT_APP_HOST;

const mapValues: Map<string, number> = new Map();

mapValues.set('member', 0);
mapValues.set('moderator', 1);
mapValues.set('admin', 2);

const months = [
	'Января',
	'Февраля',
	'Марта',
	'Апреля',
	'Мая',
	'Июня',
	'Июля',
	'Августа',
	'Сентября',
	'Октября',
	'Ноября',
	'Декабря',
];

const Room = () => {
	const { user } = useTypedSelector((state) => state.user);
	const dispatchRole: Dispatch<IActionChangeRole> = useDispatch();
	const [connect, setConnect] = useState<boolean>(false);
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [roomName, setRoomName] = useState<string>('');
	const bottomRef = useRef<HTMLLIElement>(null);
	const refInput = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const { id } = useParams();


	const socketRef = useRef<null | Socket>(null);
	useEffect(() => {
		socketRef.current = io('http://localhost:5000', {
			withCredentials: true,
		});

		fetch(`${Host}/room/${id}`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.ok) return res.json();
				else {
					if (res.status === 401) {
						navigate('/login');
						throw new Error('unauthorized');
					}
					if (res.status === 404) {
						navigate('');
						throw new Error('user does not exist in room');
					}
				}
			})
			.then((data: IGetRoomQuery) => {
				if (socketRef?.current && data) {
		
					setRoomName(data.room?.name ? data.room?.name : '');
					socketRef.current.emit('join', id);
					dispatchRole({
						type: UserActionTypes.CHANGEROLE,
						payload: {
							role: data?.role ? data?.role : 'member',
							ban: data.bannedUntil ? new Date(data.bannedUntil) : null,
						},
					});
					setConnect(true);
				}
			})
			.catch((error) => {
				console.error(error);
			});
		if (socketRef?.current) {
			socketRef.current.on('message_list', (data: IMessage[]) => {
		
				setMessages(data);
			});

			socketRef.current.on('kick_user', (data) => {
				if (data?.userId === user?.id) {
					navigate('/');
				}
			});

			socketRef.current.on('change_role', (data: IChangeRoleWS) => {
				if (data?.userId === user?.id) {
					if (data?.role) {
						dispatchRole({
							type: UserActionTypes.CHANGEROLE,
							payload: { role: data.role },
						});
					}
				}
				if (data?.messages) {
					setMessages(data.messages);
				}
			});

			socketRef.current.on('ban', (data) => {
				if (data?.userId === user?.id) {
					if (data?.ban) {
						dispatchRole({
							type: UserActionTypes.CHANGEROLE,
							payload: { ban: new Date(data?.ban) },
						});
					}
				}
				if (data?.messages) {
					setMessages(data.messages);
				}
			});
		}
	}, []);

	useEffect(() => {
		if (bottomRef?.current) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	const userInfo = useTypedSelector((state) => state.user);

	if (!userInfo.user?.id) {
		navigate('/login');
	}

	if (!connect) {
		return <></>;
	}

	return (
		<div className="container d-flex flex-column p-0 bg-light position-absolute w-100 top-0 start-50 translate-middle-x mxh-100">
			<div className="text-center d-flex p-2 justify-content-between align-items-center text-black fw-bold fs-5 border-bottom">
				<span>{roomName}</span>
				<Button
					onClick={() => {
						if (socketRef.current) {
							socketRef.current.emit('leave');
						}
					}}
					className="bg-danger border-0 fw-bold">
					Leave from room
				</Button>
			</div>
			<ul className="flex-grow-1 flex-shrink-1 p-0 m-0 mt-2 p-0 h-100 mh-0 overflow-auto">
				{messages.map((el) => {
					return (
						<li key={el.id} className="px-2 position-relative">
							<div
								className={`fs-0 d-flex fw-bold ${
									el.user.id === user?.id ? 'justify-content-end' : 'justify-content-between'
								}`}>
								<span>{el.user.id === user?.id ? 'You' : el.user.username}:</span>
								{el.user.id !== user?.id &&
									Number(
										mapValues.get(user?.role as string) ? mapValues.get(user?.role as string) : 0,
									) >
										Number(
											mapValues.get(el.userInRoom?.role as string)
												? mapValues.get(el.userInRoom?.role as string)
												: 0,
										) && (
										<div>
											{' '}
											<Button
												onClick={() => {
													socketRef?.current?.emit('ban', el.user.id, 1);
												}}
												className={`text-white fw-bold p-1 ${styles.btns}`}>
												Ban
											</Button>
											{user?.role === 'admin' && (
												<Button
													onClick={() => {
														socketRef.current?.emit('change_role', el.user.id);
													}}
													className={`${styles.btns} text-white bg-success ms-2 fw-bold p-1`}>
													{el.userInRoom?.role === 'member' ? 'moderator' : 'member'}
												</Button>
											)}
											<Button
												onClick={() => {
													socketRef.current?.emit('kick', el.user.id);
												}}
												className={`bg-danger text-white fw-bold p-1 ms-2 ${styles.btns}`}>
												Kick
											</Button>
										</div>
									)}
							</div>
							<div
								className={`fs-0 d-flex ${
									el.user.id === user?.id ? 'justify-content-end' : 'justify-content-between'
								}`}>
								<span>{el.text}</span>
							</div>
						</li>
					);
				})}

				<li ref={bottomRef}></li>
			</ul>
			{!user?.ban || user.ban < new Date() ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const inputValue = refInput?.current?.value;

						if (inputValue && inputValue.length > 0) {
							refInput.current.value = '';
							if (socketRef.current) {
								socketRef.current.emit('message', inputValue);
							}
						}
					}}
					className="w-100 d-flex">
					<input ref={refInput} className="w-100 py-1 px-2" />
					<button className="px-3">Send</button>
				</form>
			) : (
				<div className="p-2 text-danger fw-bold bg-white border border-top">{`Вы забанены до ${user.ban.getDate()} ${
					months[user.ban.getMonth()]
				} ${user.ban.getHours()}:${user.ban.getMinutes()}`}</div>
			)}
		</div>
	);
};

export default Room;
