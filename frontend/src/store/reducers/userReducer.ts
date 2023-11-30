import {
	IActionChangeRole,
	IActionLogin,
	IActionLogout,
	IUserState,
	UserAction,
	UserActionTypes,
} from '../../types/user';

const initialState: IUserState = {
	user: null,
};

export const userReducer = (state = initialState, action: UserAction): IUserState => {
	switch (action.type) {
		case UserActionTypes.LOGIN:
			return { ...state, user: { id: action.payload, role: null, ban: null } };

		case UserActionTypes.LOGOUT:
			return { ...state, user: { id: null, role: null, ban: null } };

		case UserActionTypes.CHANGEROLE:
			if (state.user && state.user.id) {
				return {
					...state,
					user: {
						...state.user,
						role: action.payload.role ? action.payload.role : state.user.role,
						ban: action.payload.ban !== undefined ? action.payload.ban : null,
					},
				};
			}
			return state;
		default:
			return state;
	}
};
