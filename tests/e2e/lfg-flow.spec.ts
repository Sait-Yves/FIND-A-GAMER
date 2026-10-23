import { test, expect } from "@playwright/test";

test.describe("LobbyGamer — Parcours critique LFG & Matchmaking", () => {
  test("Accès au hub d'exploration et navigation vers un salon de jeu", async ({
    page,
  }) => {
    // 1. Accès à la page d'accueil (Hub LFG)
    await page.goto("/");
    await expect(page).toHaveTitle(/LobbyGamer/);

    // Vérification de la présence des éléments clés de la marque et de la navbar
    await expect(page.locator("text=LOBBYGAMER")).toBeVisible();
    await expect(page.locator("text=LIVE")).toBeVisible();
    await expect(page.locator("text=Radar de Recherche")).toBeVisible();

    // 2. Sélection d'un jeu dans la barre de filtres (ex: Valorant)
    const valorantPill = page.locator("button:has-text('Valorant')");
    await expect(valorantPill).toBeVisible();
    await valorantPill.click();

    // 3. Navigation vers le salon Apex Legends
    const joinButton = page.locator("text=Rejoindre le Lobby").first();
    await expect(joinButton).toBeVisible();
    await joinButton.click();

    // 4. Vérification de l'arrivée dans le salon du ticket
    await page.waitForURL("**/tickets/**");
    await expect(page.locator("h1")).toContainText("TRIO RANKED");
    await expect(page.locator("text=Composition de l'Escouade")).toBeVisible();
    await expect(page.locator("text=Chat d'Escouade")).toBeVisible();

    // 5. Interaction : Bascule de l'état "JE SUIS PRÊT"
    const readyButton = page.locator("button:has-text('JE SUIS PRÊT')");
    await expect(readyButton).toBeVisible();
    await readyButton.click();
    await expect(page.locator("button:has-text('PAS PRÊT')")).toBeVisible();

    // 6. Interaction : Envoi d'un ping rapide dans le chat
    const quickPing = page.locator("button:has-text('Prêt à drop')");
    await expect(quickPing).toBeVisible();
    await quickPing.click();

    // Vérifier que le message a été ajouté au fil de discussion
    await expect(page.locator("text=Prêt à drop !")).toBeVisible();
  });
});
