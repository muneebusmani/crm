import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { MessagesService } from "./message.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { DealerGuard } from "src/auth/guards/dealer.guard";
import { ApiResponse, DealerMessageReposne } from "@crm/types";
import { CustomError } from "src/common/custom-error";

@Controller('messages')
export class MessagesController {
  constructor(private readonly msgService: MessagesService) {}
   private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
      try {
        return { data, success: true };
      } catch (error) {
        const message =
          error instanceof CustomError ? error.message : 'Internal server error';
        return { error: message, success: false };
      }
    }
  // Dealer sends message
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post('dealer/:dealerId')
  sendDealerMessage(
    @Body('body') body: string,
    @Request() req
  ) : Promise<DealerMessageReposne> {
    // req.user contains dealer info if using JWT
    return this.msgService.sendMessage(req.user.id, 'dealer', body);
  }

  // Admin replies
  @Post('admin/:dealerId')
  sendAdminMessage(
    @Param('dealerId') dealerId: number,
    @Body('body') body: string,
    @Request() req
  ) {
    // req.user contains admin info
    return this.msgService.sendMessage(req.user.id, 'admin', body);
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
