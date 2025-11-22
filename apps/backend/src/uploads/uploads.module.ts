import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { ImageProxyController } from '../common/image-proxy.controller';
import { SupabaseStorageService } from '../common/supabase-storage.service';

@Module({
  controllers: [UploadsController, ImageProxyController],
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class UploadsModule {}
