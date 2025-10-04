import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { Conversation } from "./entities/conversation.entity";
import { MessagesService } from "./message.service";
import { MessagesController } from "./message.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]), // 👈 register entities
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService], // 👈 export if used in other modules
})
export class MessagesModule {}
