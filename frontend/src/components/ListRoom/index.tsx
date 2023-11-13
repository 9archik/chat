import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { error } from 'console';
import { useTypedSelector } from '../../hooks/useTypeSelector';

const Host = process.env.REACT_APP_HOST;

interface IRoom {
	id: number;
	name: string;
}

interface IQuery {
	error?: {
		auth?: boolean;
	};
}

interface IAddUserQuery {
	success?: boolean;
	error?: {
		user?: string;
		auth?: boolean;
	};
}

const ListRoom = () => {
	const [rooms, setRooms] = useState<IRoom[]>([]);
	const navigate = useNavigate();
	useEffect(() => {
		fetch(`${Host}/room/list`, {
			method: 'GET',
			credentials: 'include',

			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
				} else {
					console.log(data);
					const rooms: IRoom[] = data;
					setRooms(rooms);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const addUserToRoom = (index: number) => {
		fetch(`${Host}/room/join/${index}`, {
			method: 'POST',
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
						navigate(`/login/${index}`);
					}
				}
			})
			.then((data: IAddUserQuery) => {
				if (data.success) {
					navigate(`/room/${index}`);
					return;
				}

				if (data?.error?.auth) {
					return;
				}
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const userInfo = useTypedSelector((state) => state.user);

	if (!userInfo.user?.id) {
		navigate('/login');
	}

	return (
		<div className="container d-flex flex-column">
			{rooms.length === 0 ? (
				<div className="fs-2 d-flex justify-content-center align-items-center text-white fw-bold mt-2 flex-grow-1 flex-shrink-1">
					Rooms not found
				</div>
			) : (
				<>
					<div className="fs-2 d-flex justify-content-center text-white fw-bold mt-2">
						Active rooms
					</div>
					<ul className="d-flex flex-column p-0 mt-2">
						{rooms.map((el) => {
							return (
								<li key={el.id} className="d-flex justify-content-between mt-3">
									<span className="text-white fw-bold fs-4">{el.name}</span>
									<Button
										onClick={() => {
											addUserToRoom(el.id);
										}}
										className="text-decoration-none d-flex align-items-center bg-primary px-3 pt-1 text-white fw-bold rounded">
										Join
									</Button>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</div>
	);
};

export default ListRoom;
