export interface IForm {
	value: string;
	pattern: RegExp;
	error: null | string;
	onFocus: boolean;
}

export interface IErrorFromServer {
	name: boolean;
	server: boolean;
    password?: boolean;
}


export interface IFirstInput {
	user: IForm;
	serverError: IErrorFromServer;

}