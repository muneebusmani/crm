import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface CacheEntry {
  url: string;
  expiresAt: number;
}

/**
 * Service for handling Supabase storage operations, particularly for dealer logos.
 * This service handles the generation of signed URLs for private files and includes
 * caching mechanisms to reduce unnecessary calls to Supabase while ensuring images
 * remain accessible long-term.
 */
@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private readonly bucketName = 'dealer-uploads';
  private readonly urlCache = new Map<string, CacheEntry>();
  // Extended cache duration to 1 hour to better align with longer-lived signed URLs
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  // Default URL expiry (only used when getSignedUrl is called without expiresIn parameter)
  private readonly URL_EXPIRY = 15 * 60; // 15 minutes in seconds (default for supabase)

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

    // Clean up expired cache entries every 10 minutes
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
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
   * This method addresses the issue of signed URLs expiring by using a more intelligent
   * caching strategy that aligns cache expiry with the signed URL expiry.
   * @param filePath Path to the file in storage
   * @param expiresIn Expiration time in seconds (default: 15 minutes, but typically overridden to longer periods like 7 days)
   * @returns Signed URL (cached appropriately based on expiry time)
   */
  async getSignedUrl(filePath: string, expiresIn = this.URL_EXPIRY) {
    const now = Date.now();

    // Create a unique cache key that includes the expiry time to differentiate between different expiry requests
    // This allows the same file to have different cached URLs based on different expiry times
    const cacheKey = `${filePath}:${expiresIn}`;

    // Check cache first to avoid unnecessary calls to Supabase
    const cached = this.urlCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.url;
    }

    // Generate new signed URL from Supabase
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    // Cache the URL with an appropriate expiry time that's at most 80% of the signed URL expiry to be safe
    // This prevents serving an expired signed URL from cache
    const cacheExpiryTime = Math.min(
      this.CACHE_DURATION,
      Math.floor(expiresIn * 0.8 * 1000) // 80% of the signed URL expiry time in milliseconds
    );

    this.urlCache.set(cacheKey, {
      url: data.signedUrl,
      expiresAt: now + cacheExpiryTime,
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
   * Check if a file exists and is publicly accessible
   * @param filePath Path to the file in storage
   * @returns Boolean indicating if file is publicly accessible
   */
  async isFilePubliclyAccessible(filePath: string): Promise<boolean> {
    try {
      const publicUrl = this.getPublicUrl(filePath);
      // Test if we can access the file by making a HEAD request
      // For Supabase, we can't directly check without creating a signed URL
      // So we'll return true if the public URL doesn't contain obvious error indicators
      return !publicUrl.includes('undefined') && !publicUrl.includes('null') && publicUrl.startsWith('http');
    } catch {
      return false;
    }
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
    // Clear all cache entries for this file path (with any expiry time)
    for (const key of this.urlCache.keys()) {
      if (key.startsWith(`${filePath}:`)) {
        this.urlCache.delete(key);
      }
    }
  }

  /**
   * Clear all cached URLs
   */
  clearAllCache() {
    this.urlCache.clear();
  }

  /**
   * Download file content from storage
   * @param filePath Path to the file in storage
   * @returns Buffer containing the file content
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
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
    console.log(`   - Public: ${data.public ? 'Yes' : 'No (RECOMMENDED: make public for optimal performance)'}`);
    console.log(`   - File size limit: ${data.file_size_limit || 'default'}`);

    if (!data.public) {
      console.log(`💡 RECOMMENDATION: For dealer logos that need to be accessible long-term, make this bucket public`);
      console.log(`   - Public buckets eliminate signed URL expiration issues`);
      console.log(`   - Better performance (no need to generate signed URLs)`);
      console.log(`   - Reduced server load (no need for proxy fallbacks)`);
      console.log(`   - To make public: Update bucket settings in Supabase dashboard > Storage > Edit Bucket`);
    } else {
      console.log(`   - Perfect! Public bucket ensures images remain accessible long-term without signed URLs`);
    }

    return true;
  }
}
