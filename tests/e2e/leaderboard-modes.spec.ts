import { test, expect } from "@playwright/test";

test.describe("Classement & Multi-Rendering Next.js (CSR, SSR, SSG, Web Vitals)", () => {
  test("Navigation et affichage du classement en mode CSR", async ({ page }) => {
    await page.goto("/leaderboard/csr");
    await expect(page).toHaveTitle(/LobbyGamer/);

    // Vérifier la présence du badge de mode CSR
    await expect(page.locator("text=Client-Side Rendering (CSR)")).toBeVisible();

    // Vérifier que le tableau de classement affiche des joueurs
    const table = page.locator("table[aria-label='Tableau du classement fair-play des joueurs']");
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).not.toHaveCount(0);
  });

  test("Accès direct au mode SSR (Server-Side Rendering)", async ({ page }) => {
    await page.goto("/leaderboard/ssr");

    // Vérifier le badge SSR
    await expect(page.locator("text=Server-Side Rendering (SSR)").first()).toBeVisible();

    // Vérifier que les lignes du tableau sont pré-générées
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  test("Accès direct au mode SSG (Static Site Generation)", async ({ page }) => {
    await page.goto("/leaderboard/ssg");

    // Vérifier le badge SSG
    await expect(page.locator("text=Static Site Generation (SSG)").first()).toBeVisible();

    // Vérifier la présence du tableau
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("Affichage du comparatif des Web Vitals", async ({ page }) => {
    await page.goto("/leaderboard/vitals");

    // Vérifier les indicateurs Core Web Vitals (TTFB, FCP, LCP, CLS, INP)
    await expect(page.locator("text=Comparatif Synthétique Web Vitals")).toBeVisible();
    await expect(page.locator("text=CSR (Client-Side)")).toBeVisible();
    await expect(page.locator("text=SSR (Server-Side)").first()).toBeVisible();
    await expect(page.locator("text=SSG (Static HTML)").first()).toBeVisible();
  });
});
