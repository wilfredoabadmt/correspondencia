import { test, expect } from '@playwright/test';

test.describe('Middleware Authorization', () => {
    test('should redirect unauthenticated user to /login', async ({ page }) => {
        // Attempt to access a protected route
        await page.goto('/dashboard');

        // Assert that the URL is now the login page
        await expect(page).toHaveURL(/.*login/);
    });

    test('should allow OPERADOR to access dashboard but not settings', async ({
        page,
        context,
    }) => {
        // Set the session cookie for an OPERADOR
        await context.addCookies([
            {
                name: 'session_token',
                value: 'OPERADOR',
                domain: 'localhost',
                path: '/',
            },
        ]);

        // Access a general protected route
        await page.goto('/dashboard');
        // Assert that the user stays on the dashboard
        await expect(page).toHaveURL(/.*dashboard/);

        // Attempt to access an admin-only route
        await page.goto('/settings');
        // Assert that the user is redirected away from the admin route
        // (to /dashboard as per middleware logic)
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should allow ADMINISTRADOR to access both dashboard and settings', async ({
        page,
        context,
    }) => {
        // Set the session cookie for an ADMINISTRADOR
        await context.addCookies([
            {
                name: 'session_token',
                value: 'ADMINISTRADOR',
                domain: 'localhost',
                path: '/',
            },
        ]);

        // Access a general protected route
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);

        // Access an admin-only route
        await page.goto('/settings');
        await expect(page).toHaveURL(/.*settings/);
    });
});