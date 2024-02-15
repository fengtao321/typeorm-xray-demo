import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

// CREATE TABLE users (
//   id              SERIAL PRIMARY KEY,
//   firstName           VARCHAR(100) NULL,
//   lastName  VARCHAR(100) NULL
// );

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number | undefined

    @Column({
        type: 'varchar',
        nullable: true
      })
    firstName: string | undefined

    @Column({
        type: 'varchar',
        nullable: true
      })
    lastName: string | undefined
}