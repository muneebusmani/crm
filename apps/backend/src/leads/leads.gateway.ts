import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket
} from '@nestjs/websockets';
import { LeadsService } from './leads.service';
import { CreateLeadSchema, CreateLeadDto, UpdateLeadSchema, UpdateLeadDto } from '@crm/types'; 
import { ApiResponse } from '@crm/types';
import { Socket } from 'socket.io';
import { CustomError } from '../common/custom-error';
import { ZodError, z } from 'zod';

@WebSocketGateway()
export class LeadsGateway {
  constructor(private readonly leadsService: LeadsService) {}

 private async buildResponse<T>(data : T): Promise<ApiResponse<T>> {
  try {
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof CustomError
        ? error.message
        : error instanceof ZodError
        ? error.issues.map(e => e.message).join(', ') // ✅ use .issues
        : 'Internal server error';
    return { success: false, error: message };
  }
}

private validate<TSchema extends { safeParse: (v: unknown) => any }>(
  schema: TSchema,
  payload: unknown,
): { ok: true; data: any } | { ok: false; error: string } {
  const result = schema.safeParse(payload);
  if (result.success) return { ok: true, data: result.data };

  const errMsg = result.error.issues // ✅ use .issues
    .map(e => {
      const path = e.path.length ? `${e.path.join('.')}: ` : '';
      return `${path}${e.message}`;
    })
    .join('; ');

  return { ok: false, error: errMsg };
}


  @SubscribeMessage('createLead')
  async create(@MessageBody() payload: unknown, @ConnectedSocket() client: Socket) {
    const v = this.validate(CreateLeadSchema, payload);
    if (!v.ok) return { success: false, error: v.error };

    const dto: CreateLeadDto = v.data; // ✅ use DTO here
    const result = await this.leadsService.create(dto);
    client.emit("createLeadResponse", await this.buildResponse(result));
  }

  @SubscribeMessage('findAllLeads')
  findAll() {
    return this.buildResponse(this.leadsService.findAll());
  }

  @SubscribeMessage('findOneLead')
  findOne(@MessageBody() id: number) {
    return this.buildResponse(this.leadsService.findOne(id));
  }

  @SubscribeMessage('updateLead')
  async update(@MessageBody() payload: unknown, @ConnectedSocket() client: Socket) {
    const UpdateWithId = UpdateLeadSchema.extend({ id: z.number() });
    const v = this.validate(UpdateWithId, payload);
    if (!v.ok) return { success: false, error: v.error };

    const dto: UpdateLeadDto & { id: number } = v.data; // ✅ use DTO here
    const { id, ...updateFields } = dto;
    const result =  await this.leadsService.update(id, updateFields);
    client.emit("updatedLeadResponse", await this.buildResponse(result));
  }

  @SubscribeMessage('removeLead')
  remove(@MessageBody() id: number) {
    return this.buildResponse(this.leadsService.remove(id));
  }
}
