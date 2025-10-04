import { Body, Controller, Get, Param, Post, Req, Request, UseGuards } from "@nestjs/common";
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
  @Post('dealer')
  async sendDealerMessage(
    @Body('body') body: string,
    @Request() req
  ) : Promise<ApiResponse<DealerMessageReposne>> {
    // req.user contains dealer info if using JWT
    const result = await  this.msgService.sendMessage(req.user.id, 'dealer', body);
    return await this.buildResponse(result);
  }

  // Admin replies
  @UseGuards(JwtAuthGuard)
  @Post('admin/:dealerId')
  async sendAdminMessage(
    @Param('dealerId') dealerId: number,
    @Body('body') body: string
  ) : Promise<ApiResponse<DealerMessageReposne>>  {
    // req.user contains admin info
    const result = await this.msgService.sendMessage(dealerId, 'admin', body);
    return await this.buildResponse(result);
  }

  // Dealer fetches their conversation
  @Get('admin/:dealerId')
  getDealerAdminConversation(@Param('dealerId') dealerId: number) {
    return this.msgService.getConversation(dealerId);
  }
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('dealer')
  getDealerConversation(@Req() req) {
    const dealerId = req.user.id;;
    return this.msgService.getConversation(dealerId);
  }

  // Admin views all dealer conversations
  @Get('admin')
  getAllConversations() {
    return this.msgService.getAllConversations();
  }
}
