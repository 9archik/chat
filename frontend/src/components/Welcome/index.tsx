import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const Welcome = () => {
	return (
		<Container className="justify-content-center d-flex flex-column align-items-center">
			<span className="text-white fw-bold fs-3">Welcome to chat app</span>
			<Link
				className="fs-4 mt-3 text-decoration-none text-white bg-primary rounded py-1 px-3"
				to="">
				Go to Lobby
			</Link>
		</Container>
	);
};

export default Welcome;
