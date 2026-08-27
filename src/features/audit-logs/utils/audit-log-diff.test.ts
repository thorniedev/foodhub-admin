import { describe, expect, it } from "vitest";
import {
  computeDataDiff,
  formatJsonPretty,
  isDeepEqual,
  parseJsonSafe,
} from "./audit-log-diff";

describe("audit-log-diff utilities", () => {
  describe("parseJsonSafe", () => {
    it("parses valid JSON string", () => {
      const result = parseJsonSafe('{"name":"Store A","active":true}');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ name: "Store A", active: true });
    });

    it("handles null and undefined gracefully", () => {
      expect(parseJsonSafe(null)).toEqual({ data: null, isValid: true });
      expect(parseJsonSafe(undefined)).toEqual({ data: null, isValid: true });
      expect(parseJsonSafe("")).toEqual({ data: null, isValid: true });
    });

    it("handles invalid JSON string", () => {
      const result = parseJsonSafe("not valid json");
      expect(result.isValid).toBe(false);
      expect(result.data).toBe("not valid json");
    });
  });

  describe("isDeepEqual", () => {
    it("correctly compares primitives and objects", () => {
      expect(isDeepEqual(1, 1)).toBe(true);
      expect(isDeepEqual("a", "a")).toBe(true);
      expect(isDeepEqual(null, null)).toBe(true);
      expect(isDeepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })).toBe(true);
      expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
    });
  });

  describe("formatJsonPretty", () => {
    it("formats objects and JSON strings into indented JSON", () => {
      const obj = { id: 1, name: "Test" };
      expect(formatJsonPretty(obj)).toBe(JSON.stringify(obj, null, 2));
      expect(formatJsonPretty('{"a":1}')).toBe('{\n  "a": 1\n}');
      expect(formatJsonPretty(null)).toBe("null");
    });
  });

  describe("computeDataDiff", () => {
    it("identifies added properties (e.g. from CREATE action)", () => {
      const before = null;
      const after = '{"name":"New Food","price":12.5}';
      const diffResult = computeDataDiff(before, after);

      expect(diffResult.hasChanges).toBe(true);
      expect(diffResult.addedCount).toBe(2);
      expect(diffResult.removedCount).toBe(0);
      expect(diffResult.modifiedCount).toBe(0);
    });

    it("identifies modified properties (e.g. name changed, price changed)", () => {
      const before = '{"name":"Khmer Amok Curry","isActive":true,"price":4.50}';
      const after = '{"name":"Royal Fish Amok","isActive":true,"price":5.50}';
      const diffResult = computeDataDiff(before, after);

      expect(diffResult.hasChanges).toBe(true);
      expect(diffResult.modifiedCount).toBe(2);
      expect(diffResult.unchangedCount).toBe(1);

      const nameDiff = diffResult.diffs.find((d) => d.key === "name");
      expect(nameDiff).toBeDefined();
      expect(nameDiff?.type).toBe("MODIFIED");
      expect(nameDiff?.beforeValue).toBe("Khmer Amok Curry");
      expect(nameDiff?.afterValue).toBe("Royal Fish Amok");
    });

    it("identifies removed properties (e.g. key deleted)", () => {
      const before = '{"description":"Old description","tags":["spicy"]}';
      const after = '{"tags":["spicy"]}';
      const diffResult = computeDataDiff(before, after);

      expect(diffResult.hasChanges).toBe(true);
      expect(diffResult.removedCount).toBe(1);
      expect(diffResult.unchangedCount).toBe(1);
      const descDiff = diffResult.diffs.find((d) => d.key === "description");
      expect(descDiff?.type).toBe("REMOVED");
    });

    it("handles identical before and after states", () => {
      const before = '{"status":"ACTIVE"}';
      const after = '{"status":"ACTIVE"}';
      const diffResult = computeDataDiff(before, after);

      expect(diffResult.hasChanges).toBe(false);
      expect(diffResult.unchangedCount).toBe(1);
    });
  });
});
