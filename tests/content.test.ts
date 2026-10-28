import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductsByBrand,
  getRelatedProducts,
  getCategoryCounts,
  getAllBrands,
  getBrandBySlug,
  getAllAssociates,
  getSiteSettings,
  getHomeContent,
  getAboutContent,
} from "../lib/data/selectors";
import { productsList, associatesList } from "../lib/data/site-data";

describe("Typed Content Selectors & Model Integrity", () => {
  it("provides all active products through getAllProducts()", () => {
    const products = getAllProducts();
    assert.equal(products.length, 4);
    assert.ok(products.every((p) => p.id && p.slug && p.name && p.refCode));
  });

  it("finds a product by exact slug", () => {
    const sock = getProductBySlug("structured-ribbed-crew-sock");
    assert.ok(sock);
    assert.equal(sock.name, "Structured Ribbed Crew Sock");
    assert.equal(sock.category, "Socks");
    assert.equal(sock.categorySlug, "socks");
    assert.equal(sock.brand, "londonBoy");
  });

  it("returns undefined for unknown product slug", () => {
    const missing = getProductBySlug("non-existent-product-sku");
    assert.equal(missing, undefined);
  });

  it("filters products by category slug case-insensitively", () => {
    const socksLower = getProductsByCategory("socks");
    const socksUpper = getProductsByCategory("SOCKS");
    const innerwear = getProductsByCategory("innerwear");

    assert.equal(socksLower.length, 2);
    assert.equal(socksUpper.length, 2);
    assert.equal(innerwear.length, 2);
    assert.deepEqual(socksLower, socksUpper);
  });

  it("filters products by brand", () => {
    const londonBoyProducts = getProductsByBrand("londonBoy");
    assert.equal(londonBoyProducts.length, 4);
  });

  it("derives category counts dynamically from productsList", () => {
    const counts = getCategoryCounts();
    assert.equal(counts.all, productsList.length);
    assert.equal(counts.socks, 2);
    assert.equal(counts.innerwear, 2);
  });

  it("returns related products from the same category excluding current product", () => {
    const current = getProductBySlug("structured-ribbed-crew-sock");
    assert.ok(current);
    const related = getRelatedProducts(current, 2);
    assert.equal(related.length, 1);
    assert.notEqual(related[0].id, current.id);
    assert.equal(related[0].categorySlug, current.categorySlug);
  });

  it("finds confirmed brand londonBoy and handles invalid brand gracefully", () => {
    const brand = getBrandBySlug("londonboy");
    assert.ok(brand);
    assert.equal(brand.name, "londonBoy");
    assert.equal(brand.categories.length, 2);
    assert.ok(brand.scenes.socks);
    assert.ok(brand.scenes.innerwear);

    const unknown = getBrandBySlug("unknown-brand");
    assert.equal(unknown, undefined);
  });

  it("contains the three confirmed manufacturing associates with accurate URLs", () => {
    const associates = getAllAssociates();
    assert.equal(associates.length, 3);

    const sufia = associates.find((a) => a.number === "01");
    const umeda = associates.find((a) => a.number === "02");
    const alam = associates.find((a) => a.number === "03");

    assert.ok(sufia);
    assert.equal(sufia.name, "Sufia Hawlader Composite Ltd.");
    assert.equal(sufia.website, undefined, "Sufia should have no unconfirmed URL");

    assert.ok(umeda);
    assert.equal(umeda.name, "Umeda SB Industries Ltd.");
    assert.equal(umeda.website, "https://umedasb.com/");

    assert.ok(alam);
    assert.equal(alam.name, "Alam Garments");
    assert.equal(alam.website, "https://alamgarments.com/");
  });

  it("handles optional fields gracefully without throwing", () => {
    const settings = getSiteSettings();
    assert.ok(settings.title);
    assert.ok(settings.headerNav.length > 0);

    const home = getHomeContent();
    assert.ok(home.headline);
    assert.ok(home.londonBoyFeature.categories.length === 2);

    const about = getAboutContent();
    assert.ok(about.chapters.length >= 4);
  });
});
