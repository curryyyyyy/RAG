import { BasePage } from './BasePage';
import { userSelectors as s } from '../selectors/user.selectors';
import { commonSelectors } from '../selectors/common.selectors';

/**
 * 用户管理页对象。
 */
export class UserManagementPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: s.pageHeading, exact: true });
  // naive-ui 表头/数据体是两个 <table>，表头定位用第一个；数据行须跨两个表查询
  readonly table = this.page.locator(commonSelectors.mainTable).first();
  readonly searchInput = this.page.getByPlaceholder(s.searchPlaceholder);
  readonly orgTagFilter = this.page.getByText(s.orgTagFilterText).first();
  readonly statusFilter = this.page.getByText(s.statusFilterText).first();
  readonly todayMessages = this.page.getByText(s.todayMessagesText).first();
  readonly quota = this.page.getByText(s.quotaRegex).first();
  readonly pagination = this.page.locator(s.paginationSelector);

  get rows() {
    // 数据行在数据体 <table>（表头表无 tbody），跨全部 main table 查询
    return this.page.locator(commonSelectors.mainTable).locator('tbody tr');
  }

  userCell(username: string) {
    return this.page.getByText(username).first();
  }
}
