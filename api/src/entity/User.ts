import * as bcrypt from "bcryptjs";
import {
Column,
CreateDateColumn,
Entity,
OneToMany,
PrimaryGeneratedColumn,
Unique,
} from "typeorm";
import { Tip } from "./Tip";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  public realName: string;

  @Column()
  public grade: string;

  @Column()
  public isAdmin: boolean;

  @Column()
  public isExpert: boolean;

  @Column({default: ""})
  public expertText: string;

  @Column({select: false})
  public password: string;

  @OneToMany(() => Tip, (tip) => tip.user)
  public tips: Tip[];

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  public points?: number;
  public place?: number;

  public hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      if (unencryptedPassword) {
          return bcrypt.compareSync(unencryptedPassword, this.password);
      } else {
          return false;
      }
  }
}
