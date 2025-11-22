import { Controller, Get, Param, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { SupabaseStorageService } from './supabase-storage.service';

/**
 * Controller that provides an image proxy service as a fallback for when signed URLs expire.
 * This ensures that dealer logos remain accessible long-term even if the initial signed URLs expire.
 * This is particularly important for images displayed in invoices and other documents that need
 * to remain accessible over extended periods.
 */

@Controller('images')
export class ImageProxyController {
  private readonly logger = new Logger(ImageProxyController.name);

  constructor(private readonly supabaseStorageService: SupabaseStorageService) {}

  @Get('dealer/*path')
  async getDealerImage(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Extract the path from the request URL by getting everything after /dealer/
      const urlParts = req.url.split('/dealer/');
      if (urlParts.length < 2) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid path format',
        });
        return;
      }

      const path = urlParts[1]; // Everything after /dealer/
      const filePath = `dealer/${decodeURIComponent(path)}`;

      // First, try to get the file content directly from Supabase
      const imageBuffer = await this.supabaseStorageService.downloadFile(filePath);

      // Set appropriate headers for the image
      const contentType = this.getContentType(filePath);

      res.set({
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });

      res.send(imageBuffer);
    } catch (error) {
      this.logger.error(`Error serving dealer image: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve image',
        message: error.message,
      });
    }
  }

  private getContentType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg'; // Default to jpeg for unknown types
    }
  }
}