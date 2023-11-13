import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './Message';
import { Room } from './Room';
import { UsersInRoom } from './UsersInRoom';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	password: string;

	@OneToMany(() => Message, (message) => message.user)
	messages: Message[];

	@OneToMany(() => UsersInRoom, (user) => user.user)
	users: UsersInRoom[];
}
