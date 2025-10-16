import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { Conversation } from "./entities/conversation.entity";
import { promises } from "dns";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
  ) {}

  async sendMessage(dealerId: number, senderRole: 'dealer'|'admin', body: string) : Promise<Message> {
    // find or create conversation for this dealer
    let convo = await this.convoRepo.findOne({ where: { dealerId} });
    if (!convo) {
      convo = this.convoRepo.create({ dealerId : dealerId, adminId: 0});
      convo = await this.convoRepo.save(convo);
    }
     const msg = this.msgRepo.create({
      conversation: convo,
      senderId: dealerId,
      senderRole,
      body,
    });

    const savedMsg = await this.msgRepo.save(msg);

  // map to response DTO
    return {
      id: savedMsg.id,
      conversation: savedMsg.conversation,
      senderId: savedMsg.senderId,
      senderRole: savedMsg.senderRole,
      body: savedMsg.body,
      createdAt: savedMsg.createdAt,
    };
  }

  async getConversation(dealerId: number): Promise<Message[]> {
    return this.msgRepo.find({
      where: { conversation: { dealerId } },
      order: { createdAt: 'ASC' }
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    return this.convoRepo.find({ relations: ['messages'] });
  }
}
