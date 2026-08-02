import { test, expect } from '@playwright/test';

test('should register a new document successfully', async ({ page }) => {
    // Since the UI doesn't exist yet, this test serves as a blueprint.
    // We assume a page at `/documents/new` and data-testid attributes for elements.

    await page.goto('/documents/new');

    // Fill out the form
    await page.getByTestId('document-type-select').selectOption('INF');
    await page.getByTestId('area-hierarchy-select').selectOption({ label: 'Test Area' }); // Assuming the test DB is seeded with this
    await page.getByTestId('subject-input').fill('E2E Test Subject');
    await page.getByTestId('sender-input').fill('Playwright');
    await page.getByTestId('reception-date-input').fill('2024-08-15');

    // Handle file upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('attachment-input').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('this is a test pdf'),
    });

    // Submit the form
    await page.getByTestId('submit-button').click();

    // Assertions
    // Check for the success message
    await expect(page.getByTestId('success-message')).toBeVisible();
    // Check that the new tracking code is displayed
    await expect(page.getByTestId('tracking-code-display')).toContainText(/INF\/.*\/\d{5}-2024/);
});