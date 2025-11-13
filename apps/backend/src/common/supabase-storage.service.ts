import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface CacheEntry {
  url: string;
  expiresAt: number;
}

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private readonly bucketName = 'dealer-uploads';
  private readonly urlCache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly URL_EXPIRY = 15 * 60; // 15 minutes in seconds

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.urlCache.entries()) {
      if (entry.expiresAt < now) {
        this.urlCache.delete(key);
      }
    }
  }

  /**
   * Create a signed upload URL for a dealer avatar
   * @param dealerId The dealer's ID
   * @param fileName Original file name with extension
   * @returns Signed upload URL and storage path
   */
  async createSignedUploadUrl(dealerId: number, fileName: string) {
    // Generate unique file path
    const fileExt = fileName.split('.').pop();
    const timestamp = Date.now();
    const filePath = `dealer/${dealerId}/avatar-${timestamp}.${fileExt}`;

    // Create signed upload URL with upsert enabled
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUploadUrl(filePath, {
        upsert: true, // Allow overwriting existing files
      });

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      fullPath: `${this.bucketName}/${data.path}`,
    };
  }

  /**
   * Get a signed URL for viewing/downloading a private file (with caching)
   * @param filePath Path to the file in storage
   * @param expiresIn Expiration time in seconds (default: 15 minutes)
   * @returns Signed URL (cached for 15 minutes)
   */
  async getSignedUrl(filePath: string, expiresIn = this.URL_EXPIRY) {
    const now = Date.now();

    // Check cache first
    const cached = this.urlCache.get(filePath);
    if (cached && cached.expiresAt > now) {
      return cached.url;
    }

    // Generate new signed URL
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    // Cache the URL (expires in 15 minutes)
    this.urlCache.set(filePath, {
      url: data.signedUrl,
      expiresAt: now + this.CACHE_DURATION,
    });

    return data.signedUrl;
  }

  /**
   * Get the public URL for a file (only works if bucket is public)
   * @param filePath Path to the file in storage
   * @returns Public URL
   */
  getPublicUrl(filePath: string) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete a file from storage
   * @param filePath Path to the file in storage
   */
  async deleteFile(filePath: string) {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    // Clear cache for this file
    this.urlCache.delete(filePath);

    return { success: true };
  }

  /**
   * Clear cached URL for a specific file path
   * @param filePath Path to the file in storage
   */
  clearCache(filePath: string) {
    this.urlCache.delete(filePath);
  }

  /**
   * Clear all cached URLs
   */
  clearAllCache() {
    this.urlCache.clear();
  }

  /**
   * Verify bucket exists and is configured
   */
  async verifyBucket() {
    const { data, error } = await this.supabase.storage.getBucket(
      this.bucketName,
    );

    if (error) {
      console.warn(
        `⚠️  Bucket '${this.bucketName}' not found or not accessible:`,
        error.message,
      );
      return false;
    }

    console.log(`✅ Supabase Storage bucket '${this.bucketName}' is ready`);
    console.log(`   - Public: ${data.public}`);
    console.log(`   - File size limit: ${data.file_size_limit || 'default'}`);
    return true;
  }
}
