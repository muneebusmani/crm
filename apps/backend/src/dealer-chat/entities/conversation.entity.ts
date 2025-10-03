import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

// conversation.entity.ts
@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  dealerId!: number;   // each dealer has their own thread

  @Column({ nullable: true })
  adminId!: number;    // optional if you want to assign an admin

  @CreateDateColumn()
  createdAt!: Date;
}
