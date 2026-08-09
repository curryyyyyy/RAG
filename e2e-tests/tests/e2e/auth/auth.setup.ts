import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const authFile = 'auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginViaUI();
  await page.context().storageState({ path: authFile });
});
