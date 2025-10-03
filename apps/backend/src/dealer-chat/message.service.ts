import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { Conversation } from "./entities/conversation.entity";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(Conversation) private convoRepo: Repository<Conversation>,
  ) {}

  async sendMessage(dealerId: number, senderId: number, senderRole: 'dealer'|'admin', body: string) {
    // find or create conversation for this dealer
    let convo = await this.convoRepo.findOne({ where: { dealerId } });
    if (!convo) {
      convo = this.convoRepo.create({ dealerId : dealerId, adminId: 0});
      convo = await this.convoRepo.save(convo);
    }

    const msg = this.msgRepo.create({
      conversation: convo,
      senderId,
      senderRole,
      body,
    });
    return this.msgRepo.save(msg);
  }

  async getConversation(dealerId: number) {
    return this.msgRepo.find({
      where: { conversation: { dealerId } },
      order: { createdAt: 'ASC' }
    });
  }

  async getAllConversations() {
    return this.convoRepo.find({ relations: ['messages'] });
  }
}
