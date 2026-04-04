import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { test as setup, expect } from "@playwright/test";

import { readAuthFromIndexedDB } from "./helpers/viettuneIndexedDBAuth";

const storageStatePath = join(process.cwd(), "playwright", ".auth", "contributor.json");
const idbAuthPath = join(process.cwd(), "playwright", ".auth", "contributor-idb.json");

setup("authenticate contributor", async ({ page }) => {
  const email = process.env.E2E_CONTRIBUTOR_EMAIL?.trim();
  const password = process.env.E2E_CONTRIBUTOR_PASSWORD?.trim();
  /** CI smoke không bắt buộc secrets; khi skip, project phụ thuộc contributor-storage cũng bị bỏ qua. */
  if (!email || !password) {
    setup.skip(true, "Thiếu E2E_CONTRIBUTOR_EMAIL / E2E_CONTRIBUTOR_PASSWORD (đặt trong .env.local để chạy contributor E2E).");
    return;
  }

  await page.goto("/login");
  await page.getByPlaceholder("Email hoặc số điện thoại").fill(email);
  await page.getByPlaceholder("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });

  const { access_token, user } = await readAuthFromIndexedDB(page);
  expect(access_token, "access_token missing in IndexedDB after login").toBeTruthy();
  expect(user, "user missing in IndexedDB after login").toBeTruthy();

  mkdirSync(dirname(idbAuthPath), { recursive: true });
  writeFileSync(
    idbAuthPath,
    JSON.stringify({ access_token, user }, null, 2),
    "utf8",
  );

  await page.context().storageState({ path: storageStatePath });
});
