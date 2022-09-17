import { sign } from 'jsonwebtoken'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
    constructor(init?: Partial<RefreshToken>) {
        super();
        Object.assign(this, init);
    }
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    userId: string;

    @Column({ nullable: false })
    userAgent: string;

    @Column({ nullable: false })
    ipAddress: string;

    sign(): string {
        return sign({ ...this }, process.env.JWT_REFRESH_SECRET)
    }
}