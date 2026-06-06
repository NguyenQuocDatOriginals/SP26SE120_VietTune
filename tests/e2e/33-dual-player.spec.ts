import { expect, test } from "@playwright/test";

import { gotoAsResearcher, skipIfNoResearcherSession } from "./helpers/researcherSession";

test.describe("researcher — dual compare player (33)", () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeEach(async ({ page, baseURL }) => {
    skipIfNoResearcherSession();
    await gotoAsResearcher(page, baseURL!);
    await page.goto("/researcher");
  });

  test("tab So sánh: chọn 2 bản, A+B / A only / B only, Play/Pause, Reset (best-effort)", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "Kết quả tìm kiếm" })).toBeVisible({
      timeout: 60_000,
    });

    const summary = page.getByText(/Tìm thấy \d+ bản ghi đã kiểm duyệt/);
    await expect(summary).toBeVisible({ timeout: 60_000 });
    const summaryText = (await summary.textContent()) ?? "";
    const emptyMsg = page.getByText(/Không có bản thu nào khớp với bộ lọc/);
    const hasNoData =
      summaryText.includes("0 bản") || (await emptyMsg.isVisible().catch(() => false));
    test.skip(hasNoData, "Không có bản thu đã kiểm duyệt để so sánh.");

    await page.getByRole("button", { name: /So sánh phân tích/ }).click();
    await expect(page.getByRole("heading", { name: "So sánh phân tích" }).first()).toBeVisible();

    // Wizard bước 1: bộ lọc → Tiếp tục
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByRole("button", { name: "So sánh" })).toBeVisible({ timeout: 15_000 });

    const selectCards = page.getByRole("button", { name: "Chọn làm A" });
    const cardCount = await selectCards.count();
    test.skip(cardCount < 2, "Không đủ bản thu trong danh sách lọc để so sánh.");

    await selectCards.nth(0).click();
    await page.getByRole("button", { name: "Chọn làm B" }).nth(1).click();

    await page.getByRole("button", { name: "So sánh" }).click();
    await expect(page.getByText("Phát & phân tích âm thanh")).toBeVisible({ timeout: 15_000 });

    const videoNote = page.getByText(
      "Một trong hai bản thu là nguồn video. Chế độ đồng bộ hiện áp dụng cho audio",
    );
    const isVideoPair = await videoNote.isVisible().catch(() => false);
    test.skip(isVideoPair, "Cặp bản chọn là video — dual waveform không áp dụng.");

    const legacyHeading = page.getByRole("heading", { name: "Dual Audio Compare Player" });
    const sharedHeading = page.getByRole("heading", { name: "VietTune Shared Spectrogram Compare Engine" });
    const isShared = await sharedHeading.isVisible().catch(() => false);
    if (isShared) {
      await expect(sharedHeading).toBeVisible({ timeout: 45_000 });
      await expect(page.getByLabel(/Spectrogram compare surface/i)).toBeVisible({ timeout: 45_000 });
    } else {
      await expect(legacyHeading).toBeVisible({ timeout: 45_000 });
    }

    await page.getByRole("button", { name: "A+B" }).click();
    await expect(page.getByRole("button", { name: "A+B" })).toBeVisible();
    await page.getByRole("button", { name: "A only" }).click();
    await page.getByRole("button", { name: "B only" }).click();
    await page.getByRole("button", { name: "A+B" }).click();

    const playBtn = isShared
      ? page.getByRole("button", { name: "Play" })
      : page.getByRole("button", { name: "Play All" });
    const pauseBtn = isShared
      ? page.getByRole("button", { name: "Pause" })
      : page.getByRole("button", { name: "Pause All" });

    await expect(playBtn).toBeEnabled({ timeout: 30_000 });
    await playBtn.click();
    await expect(pauseBtn).toBeVisible({ timeout: 15_000 });
    await pauseBtn.click();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(playBtn).toBeVisible();
  });
});
