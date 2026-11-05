import { test, expect } from "@playwright/test";

test.describe("Accessibilité WCAG 2.2 & Lighthouse Audits", () => {
  test("Vérification des critères de base (Langue, Landmarks, Skip Link)", async ({ page }) => {
    await page.goto("/");

    // 1. SC 3.1.1 - Langue de la page définie sur 'fr'
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("fr");

    // 2. SC 2.4.1 - Lien d'évitement (Bypass Block / Skip Link)
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveText(/Passer directement au contenu principal/i);

    // Vérifier que le skip link devient visible lors du focus clavier (Tab)
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    // 3. Présence du point d'ancrage principal <main id="main-content">
    const mainContent = page.locator("main#main-content");
    await expect(mainContent).toBeVisible();

    // 4. SC 1.3.1 - Présence des landmarks accessibles
    const nav = page.locator("nav[aria-label='Rubriques']");
    await expect(nav).toBeAttached();

    const searchRegion = page.locator("[role='search']");
    await expect(searchRegion).toBeAttached();
  });

  test("SC 4.1.2 - Rôles ARIA et contrôle accessible de la recherche globale", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator("input[role='combobox']");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("aria-label", /Rechercher un salon ou un joueur/i);

    // Initialement fermé
    await expect(searchInput).toHaveAttribute("aria-expanded", "false");

    // Taper une recherche ouvre la liste
    await searchInput.fill("Alex");
    await expect(searchInput).toHaveAttribute("aria-expanded", "true");

    // Fermeture avec la touche Échap
    await page.keyboard.press("Escape");
    await expect(searchInput).toHaveAttribute("aria-expanded", "false");
  });

  test("SC 2.1.1 - Gestion modale accessible avec fermeture par touche Échap", async ({ page }) => {
    await page.goto("/");

    // Ouvrir la modale de création de ticket
    const openModalBtn = page.locator("button:has-text('CRÉER UN TICKET')").first();
    await openModalBtn.click();

    const modalDialog = page.locator("div[role='dialog'][aria-modal='true']");
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog).toHaveAttribute("aria-labelledby", "create-ticket-modal-title");

    // Fermer avec Échap
    await page.keyboard.press("Escape");
    await expect(modalDialog).not.toBeVisible();
  });
});
