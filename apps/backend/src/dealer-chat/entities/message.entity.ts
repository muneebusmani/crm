import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

// message.entity.ts
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Conversation, { eager: true })
  conversation!: Conversation;

  @Column()
  senderId!: number;     // dealer or admin user id

  @Column()
  senderRole!: 'dealer' | 'admin';

  @Column({ type: 'text' })
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
