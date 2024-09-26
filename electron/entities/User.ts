import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id?: number;

  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "int" })
  age: number;
}
