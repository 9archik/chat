import { error } from 'console';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTypedSelector } from '../../hooks/useTypeSelector';

interface ICreateQuery {
	roomId?: number;
	error?: {
		auth?: boolean;
		server?: boolean;
	};
}

const Host = process.env.REACT_APP_HOST;

const CreateRoom = () => {
	const [roomName, setRoomName] = useState<string>('');
	const navigate = useNavigate();

	const createRoom = () => {
		fetch(`${Host}/room/create`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ room: roomName }),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => res.json())
			.then((data: ICreateQuery) => {
				if (data?.roomId) {
					navigate(`/room/${data?.roomId}`);
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
		<div className="container">
			<div className="fs-2 text-white text-center fw-bold">Create room</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					createRoom();
				}}
				className="">
				<label className="d-flex flex-column mt-2">
					<span className="text-white">Room name</span>
					<input
						onChange={(e) => {
							setRoomName(e.target.value);
						}}
						required
						placeholder="room name"
						className="w-100 mt-1 px-2"
					/>
					<Button disabled={roomName.length === 0} className="mt-2" type="submit">
						Create room
					</Button>
				</label>
			</form>
		</div>
	);
};

export default CreateRoom;
