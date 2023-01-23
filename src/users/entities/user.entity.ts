import {
    Column, Entity, PrimaryGeneratedColumn,
    BeforeInsert
} from "typeorm";
import { hash } from 'bcrypt'
import { UserRoles } from "./user-roles.enum";

@Entity('users')
export class UserEntity {
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

    @Column({ type: 'enum', enum: UserRoles, default: UserRoles.REGISTERED_USER })
    role: UserRoles;

    @Column({ nullable: false, default: false })
    isActive: boolean;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, Number(process.env.HASH_SALT));
    }

    async updatePassword(newPassword: string) {
        this.password = newPassword;
        this.lastPasswordResetTime = new Date(Date.now());
        await this.hashPassword();
    }
}