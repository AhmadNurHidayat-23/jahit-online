import { test, expect, type Page } from "@playwright/test";
async function login(p: Page) {
    await p.goto("/masuk");
    await p.getByLabel("Email", { exact: true }).fill("petugas@example.test");
    await p
        .getByLabel("Kata sandi", { exact: true })
        .fill(process.env.E2E_PASSWORD!);
    await p.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(p).toHaveURL(/pesanan/);
}
async function noOverflow(p: Page) {
    expect(
        await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
    ).toBe(true);
}
test("Pemesanan, ukuran, referensi privat, penawaran, produksi, pembayaran dan invoice", async ({
    page,
    browser,
}) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/masuk");
    await page
        .getByRole("button", { name: "Belum punya akun? Daftar" })
        .click();
    await page.getByLabel("Nama lengkap").fill("Pelanggan Jahit");
    await page
        .getByLabel("Email", { exact: true })
        .fill("pelanggan@example.test");
    await page
        .getByLabel("Kata sandi", { exact: true })
        .fill(process.env.E2E_PASSWORD!);
    await page.getByLabel("Ulangi kata sandi").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Buat akun pelanggan" }).click();
    await expect(page).toHaveURL(/pesanan/);
    await page.goto("/pesan/1");
    for (const [label, value] of Object.entries({
        "Lingkar dada (cm)": "90",
        "Lingkar pinggang (cm)": "75",
        "Lingkar pinggul (cm)": "95",
        "Lebar bahu (cm)": "40",
        "Panjang lengan (cm)": "60",
        "Panjang pakaian (cm)": "70",
    }))
        await page.getByLabel(label, { exact: true }).fill(value);
    await page
        .getByLabel("Bahan kain", { exact: true })
        .selectOption("atelier");
    await page
        .getByLabel("Detail desain", { exact: true })
        .selectOption("detailed");
    await page
        .locator("input[type=file]")
        .setInputFiles("public/images/shirt.jpg");
    await page
        .getByLabel("Catatan desain")
        .fill("Kemeja lengan panjang, potongan reguler.");
    await page.getByRole("button", { name: "Kirim permintaan jahit" }).click();
    await expect(page).toHaveURL(/pesanan\/\d+$/);
    const orderUrl = new URL(page.url()).pathname;
    await expect(page.locator(".price-summary")).toContainText("460.000");
    await expect(page.locator(".reference img")).toBeVisible();
    await page.locator('.reference img').evaluate(async (img:HTMLImageElement)=>{await img.decode();});
    const context = await browser.newContext();
    const staff = await context.newPage();
    staff.on("pageerror", (e) => errors.push(e.message));
    await login(staff);
    await staff
        .locator(".order-row")
        .filter({ hasText: "Pelanggan Jahit" })
        .click();
    await staff.getByLabel("Harga total final (Rp)").fill("475000");
    await staff
        .getByLabel("Rincian penawaran")
        .fill("Kain atelier dan detail manset personal.");
    await staff.getByRole("button", { name: "Kirim penawaran final" }).click();
    await expect(staff.locator(".price-summary")).toContainText("475.000");
    await page.reload();
    await page.getByRole("button", { name: "Saya setujui penawaran" }).click();
    await expect(page.locator(".section-heading .badge")).toContainText(
        "Disepakati",
    );
    await staff.reload();
    for (const name of [
        "Lanjut: Pemotongan kain",
        "Lanjut: Penjahitan",
        "Lanjut: Fitting akhir",
    ]) {
        await staff.getByRole("button", { name, exact: true }).click();
    }
    await expect(
        staff.getByRole("button", { name: "Lanjut: Selesai", exact: true }),
    ).toBeDisabled();
    await staff
        .getByRole("button", { name: "Konfirmasi pembayaran", exact: true })
        .click();
    await staff
        .getByRole("button", { name: "Ya, pembayaran diterima" })
        .click();
    await staff
        .getByRole("button", { name: "Lanjut: Selesai", exact: true })
        .click();
    await expect(staff.locator(".section-heading .badge")).toContainText(
        "Selesai",
    );
    await page.goto(orderUrl + "/invoice");
    await expect(page.locator(".invoice")).toContainText("475.000");
    await expect(page.locator(".invoice")).toContainText("Lunas");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header")).toBeHidden();
    await page.emulateMedia({ media: "screen" });
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(orderUrl);
        await noOverflow(page);
        await page.screenshot({
            path: "test-results/order-" + width + ".png",
            fullPage: true,
        });
        await page.goto(orderUrl + "/invoice");
        await noOverflow(page);
    }
    const stranger = await browser.newContext();
    const denied = await stranger.newPage();
    const response = await denied.goto(orderUrl + "/referensi");
    expect(response?.url()).toContain("/masuk");
    await stranger.close();
    expect(errors).toEqual([]);
    await context.close();
});
test("Katalog responsif dan gambar dimuat", async ({ page }) => {
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(
            page.getByRole("heading", { name: "Pas di tubuh. Dekat di hati." }),
        ).toBeVisible();
        await noOverflow(page);
        await page.locator("img").evaluateAll(async (imgs) => {
            await Promise.all(
                imgs.map((img) => (img as HTMLImageElement).decode()),
            );
        });
        await page.screenshot({
            path: "test-results/home-" + width + ".png",
            fullPage: true,
        });
    }
});

