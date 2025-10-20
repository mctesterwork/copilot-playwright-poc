import {test as base} from '@playwright/test';
import {MainPage} from '@src/pages/main_page';
import {SearchPage} from '@src/pages/search_page';

type MyFixtures = {
  mainPage: MainPage;
  searchPage: SearchPage;
};

export const test = base.extend<MyFixtures>({
  mainPage: async ({page}, use) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();
    await use(mainPage);
  },
  searchPage: async ({page}, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },
});
