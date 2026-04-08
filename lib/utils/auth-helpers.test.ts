import { describe, it } from "node:test";
import assert from "node:assert";
import { getSafeRedirectUrl } from "./auth-helpers";

describe("getSafeRedirectUrl", () => {
  it("should return /dashboard if no url is provided", () => {
    assert.strictEqual(getSafeRedirectUrl(null), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl(""), "/dashboard");
  });

  it("should return the url if it is a valid relative path starting with a single slash", () => {
    assert.strictEqual(getSafeRedirectUrl("/settings"), "/settings");
    assert.strictEqual(getSafeRedirectUrl("/dashboard/overview"), "/dashboard/overview");
  });

  it("should return /dashboard if the url is a protocol-relative path starting with two slashes", () => {
    assert.strictEqual(getSafeRedirectUrl("//example.com"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("//evil.com/path"), "/dashboard");
  });

  it("should return /dashboard if the url is an absolute URL", () => {
    assert.strictEqual(getSafeRedirectUrl("https://example.com"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("http://example.com"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("https://example.com/settings"), "/dashboard");
  });

  it("should return /dashboard if the url contains an invalid scheme", () => {
    assert.strictEqual(getSafeRedirectUrl("javascript:alert(1)"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("vbscript:msgbox(1)"), "/dashboard");
  });

  it("should return /dashboard if the url doesn't start with a slash", () => {
    assert.strictEqual(getSafeRedirectUrl("settings"), "/dashboard");
    assert.strictEqual(getSafeRedirectUrl("dashboard/overview"), "/dashboard");
  });
});
