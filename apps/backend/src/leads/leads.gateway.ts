import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@WebSocketGateway()
export class LeadsGateway {
  constructor(private readonly leadsService: LeadsService) {}

  @SubscribeMessage('createLead')
  create(@MessageBody() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @SubscribeMessage('findAllLeads')
  findAll() {
    return this.leadsService.findAll();
  }

  @SubscribeMessage('findOneLead')
  findOne(@MessageBody() id: number) {
    return this.leadsService.findOne(id);
  }

  @SubscribeMessage('updateLead')
  update(@MessageBody() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(updateLeadDto.id, updateLeadDto);
  }

  @SubscribeMessage('removeLead')
  remove(@MessageBody() id: number) {
    return this.leadsService.remove(id);
  }
}
