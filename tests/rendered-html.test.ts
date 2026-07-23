import { describe, expect, test } from "vitest";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return await worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

describe("rendered application", () => {
  test("renders the public invitation without starter metadata", async () => {
    const response = await render();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^text\/html/);
    expect(html).toContain("Baby in Bloom");
    expect(html).toContain("Gift Wishlist");
    expect(html).toContain("Kindly RSVP");
    expect(html).not.toContain("codex-preview");
    expect(html).not.toContain("Your site is taking shape");
  });

  test("renders the protected admin route", async () => {
    const response = await render("/admin");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Organizer Dashboard");
    expect(html).toContain("Opening dashboard");
  });
});
