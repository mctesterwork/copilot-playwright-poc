import {Page, Locator} from '@playwright/test';
export class SearchPage {
  private page: Page;
  readonly queryInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.queryInput = page.locator('input#query[size="30"]');
  }
  async goto() {
    await this.page.goto('https://www.weather.gov/search/');
  }

  async search(query: string) {
    await this.queryInput.fill(query);
    await this.queryInput.press('Enter');
  }
}
