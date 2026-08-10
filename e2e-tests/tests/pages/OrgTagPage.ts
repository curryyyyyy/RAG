import { BasePage } from './BasePage';
import { orgTagSelectors as s } from '../selectors/org-tag.selectors';
import { commonSelectors } from '../selectors/common.selectors';

/**
 * 组织标签页对象。
 */
export class OrgTagPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: s.pageHeading, exact: true });
  readonly table = this.page.locator(commonSelectors.mainTable).first();
  readonly dialog = this.page.locator(commonSelectors.dialog);
  readonly popconfirm = this.page.locator(s.popconfirmSelector);
  readonly pagination = this.page.locator(s.paginationSelector);

  tagCell(tagName: string) {
    return this.page.getByText(tagName).first();
  }

  /** 点击「刷新」并等待页面稳定。 */
  async refresh() {
    await this.button(s.buttonNames.refresh).click();
    await this.waitForStable();
  }
}
