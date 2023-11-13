import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useTypedSelector } from '../../hooks/useTypeSelector';
import { useCookies } from 'react-cookie';
import { Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import { IActionLogout, UserActionTypes } from '../../types/user';

const Header = () => {
	const { user } = useTypedSelector((state) => state.user);
	const dispatch: Dispatch<IActionLogout> = useDispatch();

	const [cookies, setCookie, removeCookie] = useCookies(['token']);

   

	return (
		<header className="bg-success ">
			<Navbar>
				<Container className="justify-content-between">
					<Link to="/" className="fs-2 fw-bolder text-white text-decoration-none">
						Chat
					</Link>

					<Nav className="d-flex gap-3">
						{user?.id ? (
							<>
								<NavLink
									className={({ isActive }) =>
										isActive
											? 'text-white text-decoration-none'
											: 'text-white text-decoration-none opacity-75'
									}
									to="/myrooms">
									My rooms
								</NavLink>
								<NavLink
									className={({ isActive }) =>
										isActive
											? 'text-white text-decoration-none'
											: 'text-white text-decoration-none opacity-75'
									}
									to="/">
									Lobby
								</NavLink>

								<Link
									onClick={() => {
										removeCookie('token');
										dispatch({ type: UserActionTypes.LOGOUT });
									}}
									className="text-white text-decoration-none opacity-75"
									to="/login">
									Logout
								</Link>
							</>
						) : (
							<>
								<NavLink
									className={({ isActive }) =>
										isActive
											? 'text-white text-decoration-none'
											: 'text-white text-decoration-none opacity-75'
									}
									to="/login">
									Login
								</NavLink>
								<NavLink
									className={({ isActive }) =>
										isActive
											? 'text-white text-decoration-none'
											: 'text-white text-decoration-none opacity-75'
									}
									to="/register">
									Register
								</NavLink>
							</>
						)}
					</Nav>
				</Container>
			</Navbar>
		</header>
	);
};

export default Header;
