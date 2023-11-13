export interface IUser {
	id: number | null;
	role: null | 'member' | 'admin' | 'moderator';
	ban: Date | null;
}

export interface IUserState {
	user: null | IUser;
}

export enum UserActionTypes {
	LOGIN = 'LOGIN',
	LOGOUT = 'LOGOUT',
	CHANGEROLE = 'CHANGEROLE',
}

export interface IActionLogin {
	type: UserActionTypes.LOGIN;
	payload: number | null;
}

export interface IActionLogout {
	type: UserActionTypes.LOGOUT;
}

export interface IActionChangeRole {
	type: UserActionTypes.CHANGEROLE;
	payload: { role?: 'admin' | 'moderator' | 'member' | null, ban?: Date | null }
}

export type UserAction = IActionLogin | IActionLogout | IActionChangeRole;
