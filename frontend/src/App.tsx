import React, { Dispatch, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import ListRoom from './components/ListRoom';
import Login from './components/Login';
import Register from './components/Register';
import Room from './components/Room';
import MyListRoom from './components/MyListRoom';
import CreateRoom from './components/createRoom';
import { IActionLogin, UserActionTypes } from './types/user';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from './hooks/useTypeSelector';

const Host = process.env.REACT_APP_HOST;

function App() {
	const dispatch: Dispatch<IActionLogin> = useDispatch();
	const navigate = useNavigate();
	const { user } = useTypedSelector((state) => state.user);
	useEffect(() => {
		fetch(`${Host}/auth/refresh`, {
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
					navigate('/login');
					throw new Error('');
				}
			})
			.then((data) => {
				dispatch({ type: UserActionTypes.LOGIN, payload: data.userId });
			})
			.catch((error) => {
				dispatch({ type: UserActionTypes.LOGIN, payload: null });
			});
	}, []);

	if (!user) {
		return (
			<div className="bg-secondary mh-100 d-flex justify-content-center align-items-center fs-1 text-white fw-bold">
				Loading
			</div>
		);
	}


	return (
		<>
			<Header />
			<main className="bg-secondary flex-grow-1 flex-shrink-1 d-flex position-relative">
				<Routes>
					<Route path="" element={<ListRoom />} />
					<Route path="/myrooms" element={<MyListRoom />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/room/:id" element={<Room />} />
					<Route path="/createRoom" element={<CreateRoom />} />
				</Routes>
			</main>
		</>
	);
}

export default App;
