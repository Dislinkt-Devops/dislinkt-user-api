import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn,
    BeforeInsert
} from "typeorm";
import { hash } from 'bcrypt'

@Entity('users')
export class User extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true, type: 'timestamptz' })
    lastPasswordResetTime: Date | null;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, Number(process.env.HASH_SALT));
    }

    // role: UserRoles;
}