import { Dispatch, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { IActionChangeRole, IActionLogin, IActionLogout, UserActionTypes } from '../../types/user';
import { error } from 'console';

interface IRoom {
	id: number;
	name: string;
}

interface IQuery {
	error?: {
		auth?: boolean;
	};
}

const Host = process.env.REACT_APP_HOST;

const MyListRoom = () => {
	const [rooms, setRooms] = useState<IRoom[]>([]);
	const dispatch: Dispatch<IActionLogout | IActionChangeRole> = useDispatch();
	const navigate = useNavigate();
	useEffect(() => {
		fetch(`${Host}/room/mylist`, {
			method: 'GET',
			credentials: 'include',

			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error('error');
				}
			})
			.then((data) => {
				if (data.error) {
				} else {
				
					const rooms: IRoom[] = data;
					setRooms(rooms);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const enterUserToRoom = (index: number) => {
		fetch(`${Host}/room/${index}`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else {
					if (res.status === 401) {
						dispatch({ type: UserActionTypes.LOGOUT });
						navigate('/login');
						throw new Error('unauthorized');
					}
				}
			})
			.then((data) => {
			    console.log('data', data)
				dispatch({
					type: UserActionTypes.CHANGEROLE,
					payload: {
						role: data?.role ? data?.role : 'member',
						ban: data.bannedUntil,
					},
				});
				navigate(`/room/${index}`);
			})
			.catch((error) => {
				console.error(error);
			});
	};
	return (
		<div className="container">
			<div className="text-white d-flex justify-content-between align-items-center fw-bold text-center mt-2 fs-2">
				<span>My rooms</span>
				<Link
					to={'/createRoom'}
					className="fs-6 mh-0 bg-danger py-1 px-3 rounded text-decoration-none text-white">
					+ create room
				</Link>
			</div>

			<ul className="d-flex flex-column p-0">
				{rooms.map((el) => {
					return (
						<li key={el.id} className="d-flex justify-content-between mt-3">
							<span className="text-white fw-bold fs-4">{el.name}</span>
							<Button
								onClick={() => {
									enterUserToRoom(el.id);
								}}
								className="text-decoration-none d-flex align-items-center bg-primary px-3 pt-1 text-white fw-bold rounded">
								Join
							</Button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default MyListRoom;
