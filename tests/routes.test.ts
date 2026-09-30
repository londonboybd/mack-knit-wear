import { describe, it } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import nextConfig from "../next.config";

describe("Routing, Sitemap, and Navigation Configuration", () => {
  it("generates a comprehensive sitemap including all public routes and products", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mackknitwear.com";
    const entries = await sitemap();

    assert.ok(Array.isArray(entries));
    const urls = entries.map((e) => e.url);

    // Verify core public routes are present
    assert.ok(urls.includes("https://mackknitwear.com"));
    assert.ok(urls.includes("https://mackknitwear.com/about"));
    assert.ok(urls.includes("https://mackknitwear.com/brands"));
    assert.ok(urls.includes("https://mackknitwear.com/brands/londonboy"));
    assert.ok(urls.includes("https://mackknitwear.com/brands/londonboy/socks"));
    assert.ok(urls.includes("https://mackknitwear.com/brands/londonboy/innerwear"));
    assert.ok(urls.includes("https://mackknitwear.com/products"));
    assert.ok(urls.includes("https://mackknitwear.com/associates"));
    assert.ok(urls.includes("https://mackknitwear.com/contact"));
    assert.ok(urls.includes("https://mackknitwear.com/privacy"));

    // Verify product routes
    assert.ok(
      urls.includes(
        "https://mackknitwear.com/products/structured-ribbed-crew-sock"
      )
    );
    assert.ok(
      urls.includes(
        "https://mackknitwear.com/products/combed-cotton-crew-undershirt"
      )
    );

    // Verify retired routes are excluded
    assert.ok(!urls.some((u) => u.includes("/admin")));
    assert.ok(!urls.some((u) => u.includes("/api")));
    assert.ok(!urls.some((u) => u.includes("/network")));

    // Verify no manufactured lastModified dates
    assert.ok(entries.every((e) => !e.lastModified));
  });

  it("handles empty NEXT_PUBLIC_SITE_URL in sitemap gracefully", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const entries = await sitemap();
    assert.ok(entries.length > 0);
    // When no base URL, relative paths are emitted cleanly
    assert.ok(entries.some((e) => e.url === "/about"));
  });

  it("configures robots.txt for public crawlability", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mackknitwear.com";
    const robotRules = robots();
    const rules = Array.isArray(robotRules.rules)
      ? robotRules.rules[0]
      : robotRules.rules;
    assert.equal(rules?.allow, "/");
    assert.equal(robotRules.sitemap, "https://mackknitwear.com/sitemap.xml");
  });

  it("configures a permanent redirect from /network to /associates in nextConfig", async () => {
    assert.ok(typeof nextConfig.redirects === "function");
    const redirects = await nextConfig.redirects();
    const networkRedirect = redirects.find((r) => r.source === "/network");

    assert.ok(networkRedirect, "Permanent redirect for /network must exist");
    assert.equal(networkRedirect.destination, "/associates");
    assert.equal(networkRedirect.permanent, true);
  });
});
