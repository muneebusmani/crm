import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import { MessagesService } from "./message.service";

@Controller('messages')
export class MessagesController {
  constructor(private readonly msgService: MessagesService) {}

  // Dealer sends message
  @Post('dealer/:dealerId')
  sendDealerMessage(
    @Param('dealerId') dealerId: number,
    @Body('body') body: string,
    @Request() req
  ) {
    // req.user contains dealer info if using JWT
    return this.msgService.sendMessage(dealerId, req.user.id, 'dealer', body);
  }

  // Admin replies
  @Post('admin/:dealerId')
  sendAdminMessage(
    @Param('dealerId') dealerId: number,
    @Body('body') body: string,
    @Request() req
  ) {
    // req.user contains admin info
    return this.msgService.sendMessage(dealerId, req.user.id, 'admin', body);
  }

  // Dealer fetches their conversation
  @Get('dealer/:dealerId')
  getDealerConversation(@Param('dealerId') dealerId: number) {
    return this.msgService.getConversation(dealerId);
  }

  // Admin views all dealer conversations
  @Get('admin')
  getAllConversations() {
    return this.msgService.getAllConversations();
  }
}
