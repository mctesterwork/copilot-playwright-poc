import {test} from '../fixtures/my-test';
import {expect} from '@playwright/test';
import {testLocation} from '../helpers/fakeData';

test.describe('Example UI Test', () => {
    test('should load the main page and perform a search', async ({ mainPage }) => {
        console.log('Using test state: ', testLocation.state);
        await mainPage.enterGetWeatherLocation(testLocation.state);
        await mainPage.clickGetWeatherButton();
        const weatherTitle = await mainPage.getWeatherLocationTitle();
        expect(weatherTitle).toContain('More than one location matched your submission')
    });

    test('should perform a search and display results', async ({ searchPage }) => {
        // Perform a search action
        await searchPage.goto();
        await searchPage.search('Playwright');
    });
});