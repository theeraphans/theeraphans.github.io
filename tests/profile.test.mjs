import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("mobile navigation cannot create horizontal page overflow", async () => {
  const css = await readFile(new URL("../css/profile.css", import.meta.url), "utf8");

  assert.match(
    css,
    /html\s*,\s*body\s*\{[^}]*overflow-x:\s*clip\s*;/s,
    "the document must clip the off-canvas navigation without disabling vertical scrolling",
  );
});
