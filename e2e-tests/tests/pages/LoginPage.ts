import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { loginSelectors as s } from '../selectors/login.selectors';
import { TEST_USER, TEST_PASS } from '../fixtures/credentials';

/**
 * 登录页对象。
 */
export class LoginPage extends BasePage {
  readonly usernameInput = this.page.getByPlaceholder(s.usernamePlaceholder);
  readonly passwordInput = this.page.getByPlaceholder(s.passwordPlaceholder);
  readonly loginButton = this.button(s.loginButtonName);
  readonly rememberCheckbox = this.page.getByRole('checkbox', { name: s.rememberCheckboxName });
  readonly logoutButton = this.button(s.logoutButtonRegex);
  readonly profileMenuItem = this.menuItem(s.profileMenuItemName);

  userButton(username: string) {
    return this.page.getByRole('button', { name: username });
  }

  /** 进入登录页（未登录状态）。 */
  async gotoLogin() {
    await this.goto('/');
    await this.page.waitForURL(s.urlLoginRegex, { timeout: 10000 });
  }

  async fillLoginForm(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async login(username: string, password: string) {
    await this.fillLoginForm(username, password);
    await this.loginButton.click();
  }

  /** 登录并断言成功跳转 + 欢迎语 + 用户按钮。 */
  async loginExpectSuccess(username: string, password: string) {
    await this.login(username, password);
    await this.page.waitForURL(s.urlChat, { timeout: 10000 });
    await expect(this.page.getByText(s.loginSuccessText)).toBeVisible();
    await expect(this.page.getByText(new RegExp(`${s.welcomePrefix}.*${username}`))).toBeVisible();
    await expect(this.userButton(username)).toBeVisible();
  }

  /**
   * 通过 UI 登录系统（带重试，应对并发时后端慢响应）。
   * 成功后 localStorage 中写入 PaiSmart_token。
   */
  async loginViaUI(username = TEST_USER, password = TEST_PASS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.doLogin(username, password);
      try {
        await this.assertToken(attempt === 0 ? 10000 : 20000);
        return; // 登录成功
      } catch {
        if (attempt === 0) {
          // 清除可能残留的状态后重试
          await this.page.evaluate(() => localStorage.clear());
        }
      }
    }
    // 最后一次机会
    await this.assertToken(25000);
  }

  private async doLogin(username: string, password: string) {
    await this.gotoLogin();
    await this.login(username, password);
    try {
      await this.page.waitForURL(s.urlChat, { timeout: 20000 });
    } catch {
      await this.page.waitForLoadState('networkidle');
    }
  }

  private async assertToken(timeout: number) {
    await expect(async () => {
      const token = await this.page.evaluate((key) => localStorage.getItem(key), s.tokenStorageKey);
      expect(token).toBeTruthy();
    }).toPass({ timeout });
  }
}
