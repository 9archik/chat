import { JwtPayload } from "jsonwebtoken";

export function isJwtPayload(token: any): token is JwtPayload {
	return typeof token === 'object' && token !== null && 'id' in token && 'exp' in token;
}

export function isNumber(value: string): boolean {
	return !isNaN(Number(value));
}