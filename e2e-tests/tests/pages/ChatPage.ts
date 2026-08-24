import { BasePage } from './BasePage';
import { chatSelectors as s } from '../selectors/chat.selectors';
import { commonSelectors } from '../selectors/common.selectors';

/**
 * 聊天助手页对象。
 */
export class ChatPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: s.pageHeading });
  readonly connectionStatus = this.page.getByText(s.connectionStatusLabel);
  readonly connectedStatus = this.page.getByText(s.connectedRegex);
  readonly messageInput = this.page.getByPlaceholder(s.messageInputPlaceholderRegex);
  readonly mainRegion = this.page.locator(commonSelectors.mainRegion);
  readonly dateFilter = this.page.locator(s.dateFilterClassRegex).first();
  readonly sendButton = this.mainRegion.locator(s.sendButtonSelector).first();

  /** 进入聊天页（默认路由 /chat）。 */
  async gotoChat() {
    await this.goto('/');
    await this.waitForStable();
  }
}
