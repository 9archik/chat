import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Room } from './Room';
import { UsersInRoom } from './UsersInRoom';

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@ManyToOne(() => User)
	@JoinColumn()
	user: User;

	@ManyToOne(() => Room)
	@JoinColumn()
	room: Room;

	@ManyToOne(() => UsersInRoom, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
	@JoinColumn()
	userInRoom: UsersInRoom;
}
