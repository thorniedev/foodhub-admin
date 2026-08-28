import { describe, expect, it } from "vitest";
import {
  formatAuditTimestamp,
  formatIpAddress,
  formatRelativeTime,
  formatShortUuid,
  parseUserAgent,
} from "./audit-log-format";

describe("audit-log-format utilities", () => {
  describe("formatAuditTimestamp", () => {
    it("formats ISO timestamp correctly", () => {
      const result = formatAuditTimestamp("2026-08-26T14:30:00Z");
      expect(result).toContain("2026");
      expect(result).toContain("Aug");
    });

    it("handles invalid or empty timestamp", () => {
      expect(formatAuditTimestamp(null)).toBe("—");
      expect(formatAuditTimestamp("")).toBe("—");
      expect(formatAuditTimestamp("invalid-date")).toBe("invalid-date");
    });
  });

  describe("formatRelativeTime", () => {
    it("returns 'just now' for recent timestamps", () => {
      const now = new Date("2026-08-26T14:30:00Z");
      const past = "2026-08-26T14:29:45Z";
      expect(formatRelativeTime(past, now)).toBe("just now");
    });

    it("returns minutes ago correctly", () => {
      const now = new Date("2026-08-26T14:30:00Z");
      const past = "2026-08-26T14:20:00Z";
      expect(formatRelativeTime(past, now)).toBe("10 mins ago");
    });

    it("returns hours ago correctly", () => {
      const now = new Date("2026-08-26T14:30:00Z");
      const past = "2026-08-26T12:30:00Z";
      expect(formatRelativeTime(past, now)).toBe("2 hours ago");
    });
  });

  describe("formatShortUuid", () => {
    it("shortens UUID with prefix and suffix", () => {
      const uuid = "8e3c1532-6a4a-4ff1-88f5-48bcebc3a12a";
      expect(formatShortUuid(uuid)).toBe("8e3c15...a12a");
    });

    it("handles null or short strings", () => {
      expect(formatShortUuid(null)).toBe("—");
      expect(formatShortUuid("short")).toBe("short");
    });
  });

  describe("parseUserAgent", () => {
    it("identifies macOS and Chrome", () => {
      const ua =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const result = parseUserAgent(ua);
      expect(result.os).toBe("macOS");
      expect(result.browser).toBe("Google Chrome");
      expect(result.device).toBe("Desktop");
    });

    it("identifies Windows and Firefox", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0";
      const result = parseUserAgent(ua);
      expect(result.os).toBe("Windows");
      expect(result.browser).toBe("Mozilla Firefox");
    });

    it("identifies Postman client", () => {
      const ua = "PostmanRuntime/7.32.3";
      const result = parseUserAgent(ua);
      expect(result.device).toBe("Bot");
      expect(result.browser).toBe("Postman Client");
    });
  });

  describe("formatIpAddress", () => {
    it("formats standard IPv4", () => {
      const result = formatIpAddress("192.168.1.100");
      expect(result.display).toBe("192.168.1.100");
      expect(result.isLocal).toBe(true);
      expect(result.isV6).toBe(false);
    });

    it("formats public IPv4", () => {
      const result = formatIpAddress("203.0.113.195");
      expect(result.isLocal).toBe(false);
    });

    it("handles null/empty IP", () => {
      expect(formatIpAddress(null).display).toBe("—");
    });
  });
});
