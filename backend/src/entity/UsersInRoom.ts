import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	OneToOne,
	JoinColumn,
	Index,
} from 'typeorm';
import { Room } from './Room';
import { User } from './User';
import { Message } from './Message';

@Entity()
@Index(['room', 'user'], { unique: true })
export class UsersInRoom {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: 'member' })
	role: 'admin' | 'member' | 'moderator';

	@Column({ default: null, nullable: true, type: 'timestamptz' })
	bannedUntil: null | Date;

	@Column({ default: false, nullable: false })
	leave: boolean;

	@Column({ default: false })
	kick: boolean;

	@ManyToOne(() => Room, (room) => room.users)
	@JoinColumn()
	room: Room;

	@ManyToOne(() => User, (user) => user.users)
	@JoinColumn()
	user: User;

	@OneToMany(() => Message, (message) => message.userInRoom, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	messages: Message[];
}
