import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SupabaseStorageService } from '../common/supabase-storage.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post('dealer-avatar-signed-url')
  async createDealerAvatarSignedUrl(
    @Request() req,
    @Body() body: { fileName: string; contentType: string },
  ) {
    const userId = req.user.id;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(body.contentType)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    // Validate file name
    if (!body.fileName || body.fileName.length === 0) {
      throw new BadRequestException('File name is required');
    }

    try {
      // Get dealer ID from user
      // Note: Adjust this based on your user-dealer relationship
      const dealerId = userId; // or fetch from database if needed

      const result = await this.supabaseStorageService.createSignedUploadUrl(
        dealerId,
        body.fileName,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }
  }
}
