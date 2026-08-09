import { Page } from '@playwright/test';
import { commonSelectors } from '../selectors/common.selectors';

/**
 * 页面对象基类：封装跨模块公共导航与等待操作。
 */
export class BasePage {
  constructor(public readonly page: Page) {}

  /** 定位按钮（按 role 名，支持 exact 匹配与正则）。 */
  button(name: string | RegExp, exact = false) {
    return this.page.getByRole('button', { name, exact });
  }

  /** 定位侧边栏菜单项。 */
  menuItem(name: string) {
    return this.page.getByRole('menuitem', { name });
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  /** 等待页面稳定：网络空闲且 loading 隐藏。 */
  async waitForStable() {
    await this.page.waitForLoadState('networkidle');
    const spinner = this.page.locator(commonSelectors.spinner);
    if (await spinner.isVisible().catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }

  /** 导航到指定菜单项。 */
  async navigateTo(menuLabel: string) {
    await this.menuItem(menuLabel).click();
    await this.waitForStable();
  }

  /** 关闭当前打开的对话框。 */
  async closeDialog() {
    const dialog = this.page.locator(commonSelectors.dialog);
    if (await dialog.isVisible().catch(() => false)) {
      await dialog.getByRole('button', { name: commonSelectors.closeIconButton }).click();
      await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }
  }
}
