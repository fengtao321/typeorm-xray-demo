import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("cars")
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