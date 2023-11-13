import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Message } from './Message';
import { UsersInRoom } from './UsersInRoom';

@Entity()
export class Room {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => Message, (message) => message.room)
	messages: Message[];

	@OneToMany(() => UsersInRoom, (user) => user.room)
	users: UsersInRoom[];
}
