/**
 * Utility functions for device information parsing and normalization
 */

/**
 * Parse User-Agent string into a friendly device name.
 * Example: "Mozilla/5.0 (X11; Linux x86_64) ...Firefox/144.0" -> "Firefox 144 on Linux"
 */
export function parseUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Unknown Device';

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let browserVersion = '';

  // Detect browser
  if (userAgent.includes('Firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = 'Firefox';
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Edg/')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = 'Edge';
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Chrome/')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = 'Chrome';
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = 'Safari';
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
    const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/);
    browser = 'Opera';
    browserVersion = match ? match[1] : '';
  }

  // Detect OS
  if (userAgent.includes('Windows NT 10')) {
    os = 'Windows 10/11';
  } else if (userAgent.includes('Windows NT 6.3')) {
    os = 'Windows 8.1';
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows 8';
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows 7';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux') && userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('iPhone')) {
    os = 'iPhone';
  } else if (userAgent.includes('iPad')) {
    os = 'iPad';
  } else if (userAgent.includes('iOS')) {
    os = 'iOS';
  }

  const fullBrowser = browserVersion ? `${browser} ${browserVersion}` : browser;
  return `${fullBrowser} on ${os}`;
}

/**
 * Normalize IP address:
 * - Convert IPv4-mapped IPv6 (::ffff:127.0.0.1) to IPv4 (127.0.0.1)
 * - Handle other common formats
 */
export function normalizeIpAddress(ip: string | null | undefined): string {
  if (!ip) return 'Unknown';

  // Handle IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
  const ipv4MappedMatch = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (ipv4MappedMatch) {
    return ipv4MappedMatch[1];
  }

  // Handle ::1 (localhost IPv6)
  if (ip === '::1') {
    return '127.0.0.1';
  }

  // Handle localhost variants
  if (ip === '127.0.0.1' || ip === 'localhost') {
    return '127.0.0.1';
  }

  return ip;
}

/**
 * Detect platform from User-Agent
 */
export function detectPlatform(
  userAgent: string | null | undefined,
): 'web' | 'android' | 'ios' {
  if (!userAgent) return 'web';

  if (userAgent.includes('Android')) {
    return 'android';
  }
  if (
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad') ||
    userAgent.includes('iOS')
  ) {
    return 'ios';
  }

  return 'web';
}

export interface GeoLocation {
  city: string | null;
  country: string | null;
  region: string | null;
}

/**
 * Get geolocation from IP address using free ip-api.com service.
 * Note: ip-api.com is free for non-commercial use and has rate limits.
 * For production with high traffic, consider using ipinfo.io or similar paid services.
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  const normalizedIp = normalizeIpAddress(ip);

  // Skip lookup for localhost/private IPs
  if (
    normalizedIp === '127.0.0.1' ||
    normalizedIp.startsWith('192.168.') ||
    normalizedIp.startsWith('10.') ||
    normalizedIp.startsWith('172.') ||
    normalizedIp === 'Unknown'
  ) {
    return { city: 'Local', country: null, region: null };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${normalizedIp}?fields=status,city,country,regionName`,
      { signal: AbortSignal.timeout(3000) }, // 3 second timeout
    );

    if (!response.ok) {
      console.warn('[GeoLocation] API request failed:', response.status);
      return { city: null, country: null, region: null };
    }

    const data = await response.json();

    if (data.status === 'success') {
      return {
        city: data.city || null,
        country: data.country || null,
        region: data.regionName || null,
      };
    }

    return { city: null, country: null, region: null };
  } catch (error) {
    console.warn('[GeoLocation] Failed to get location:', error);
    return { city: null, country: null, region: null };
  }
}

/**
 * Format location string from geolocation data
 */
export function formatLocation(geo: GeoLocation): string | null {
  if (!geo.city && !geo.country) return null;

  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.join(', ');
}
