import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { User } from "./User";

@Entity()
  export class Tip {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public date: Date;

    @Column()
    public scoreHomeTeam: number;

    @Column()
    public scoreAwayTeam: number;
  
    @Column()
    public matchId: number;

    @Column()
    @CreateDateColumn()
    public createdAt: string;

    @ManyToOne(() => User, (user) => user.tips, {onDelete: "CASCADE"})
    public user: User;
  }
