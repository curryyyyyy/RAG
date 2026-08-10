import { BasePage } from './BasePage';
import { knowledgeBaseSelectors as s } from '../selectors/knowledge-base.selectors';
import { commonSelectors } from '../selectors/common.selectors';

/**
 * 知识库页对象。
 */
export class KnowledgeBasePage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: s.pageHeading, exact: true });
  // naive-ui 数据表拆分表头/数据体为两个 <table>，须整体匹配（表头文本只在表头表出现，可安全命中）
  readonly table = this.page.locator(commonSelectors.mainTable);
  readonly dialog = this.page.locator(commonSelectors.dialog);
  readonly keywordInput = this.page.getByPlaceholder(s.keywordPlaceholder);
  readonly topKInput = this.page.getByPlaceholder(s.topKPlaceholder);

  /** 定位指定文件名的数据行（文件名唯一）。 */
  fileRow(name: string) {
    return this.page.getByText(name).first();
  }

  /** 定位指定文件行内的「预览」按钮。 */
  filePreviewButton(name: string) {
    return this.table
      .locator('tbody tr')
      .filter({ hasText: name })
      .getByRole('button', { name: s.buttonNames.preview });
  }

  /** 点击「刷新」并等待页面稳定。 */
  async refresh() {
    await this.button(s.buttonNames.refresh).click();
    await this.waitForStable();
  }

  /** 打开「检索知识库」弹窗。 */
  async openSearchDialog() {
    await this.button(s.buttonNames.searchKnowledge).click();
  }

  /** 通过右上角 close 图标关闭检索弹窗。 */
  async closeSearchDialog() {
    await this.dialog.getByRole('button', { name: commonSelectors.closeIconButton }).click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}
