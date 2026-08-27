/**
 * Date and Timestamp formatting for Audit Logs
 */
export function formatAuditTimestamp(
  dateString: string | null | undefined,
  locale = "en-US",
): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Calculates human-readable relative time (e.g. "2 hours ago", "just now").
 */
export function formatRelativeTime(
  dateString: string | null | undefined,
  nowDate: Date = new Date(),
): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const elapsedSeconds = Math.floor((nowDate.getTime() - date.getTime()) / 1000);

    if (elapsedSeconds < 0) {
      return "just now";
    }

    if (elapsedSeconds < 45) {
      return "just now";
    }

    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  } catch {
    return "";
  }
}

/**
 * Formats a long UUID into a shortened string: `7b6f...bb7b`.
 */
export function formatShortUuid(
  uuid: string | null | undefined,
  prefixLen = 6,
  suffixLen = 4,
): string {
  if (!uuid) return "—";
  const trimmed = uuid.trim();
  if (trimmed.length <= prefixLen + suffixLen + 3) return trimmed;
  return `${trimmed.slice(0, prefixLen)}...${trimmed.slice(-suffixLen)}`;
}

export interface ParsedUserAgent {
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
  iconType: "chrome" | "firefox" | "safari" | "edge" | "mobile" | "globe" | "bot";
  raw: string;
}

/**
 * Lightweight client-side User-Agent parser.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua || !ua.trim()) {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      device: "Unknown",
      iconType: "globe",
      raw: ua || "",
    };
  }

  const raw = ua.trim();
  const lower = raw.toLowerCase();

  // Detect Bots / Crawlers / Postman
  if (lower.includes("postman") || lower.includes("insomnia") || lower.includes("curl") || lower.includes("bot")) {
    return {
      browser: lower.includes("postman") ? "Postman Client" : lower.includes("curl") ? "cURL" : "Automated Client / Bot",
      os: "API Client",
      device: "Bot",
      iconType: "bot",
      raw,
    };
  }

  // OS Detection
  let os = "Unknown OS";
  if (lower.includes("mac os x") || lower.includes("macintosh")) {
    os = "macOS";
  } else if (lower.includes("windows nt 10.0") || lower.includes("windows nt 11.0") || lower.includes("windows")) {
    os = "Windows";
  } else if (lower.includes("android")) {
    os = "Android";
  } else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) {
    os = lower.includes("ipad") ? "iPadOS" : "iOS";
  } else if (lower.includes("linux")) {
    os = "Linux";
  }

  // Device Detection
  let device: ParsedUserAgent["device"] = "Desktop";
  if (lower.includes("ipad") || lower.includes("tablet")) {
    device = "Tablet";
  } else if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) {
    device = "Mobile";
  }

  // Browser Detection
  let browser = "Web Browser";
  let iconType: ParsedUserAgent["iconType"] = "globe";

  if (lower.includes("edg/")) {
    browser = "Microsoft Edge";
    iconType = "edge";
  } else if (lower.includes("chrome/") && !lower.includes("edg/")) {
    browser = "Google Chrome";
    iconType = "chrome";
  } else if (lower.includes("safari/") && !lower.includes("chrome/")) {
    browser = "Apple Safari";
    iconType = "safari";
  } else if (lower.includes("firefox/")) {
    browser = "Mozilla Firefox";
    iconType = "firefox";
  }

  if (device === "Mobile" && iconType === "globe") {
    iconType = "mobile";
  }

  return {
    browser,
    os,
    device,
    iconType,
    raw,
  };
}

/**
 * IP address display helper.
 */
export function formatIpAddress(ip: string | null | undefined): {
  display: string;
  isLocal: boolean;
  isV6: boolean;
} {
  if (!ip || !ip.trim()) {
    return { display: "—", isLocal: false, isV6: false };
  }

  const trimmed = ip.trim();
  const isLocal =
    trimmed === "127.0.0.1" ||
    trimmed === "::1" ||
    trimmed.startsWith("192.168.") ||
    trimmed.startsWith("10.") ||
    trimmed.startsWith("172.16.");

  const isV6 = trimmed.includes(":");

  return {
    display: trimmed,
    isLocal,
    isV6,
  };
}
