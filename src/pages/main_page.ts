import {Page, expect, Locator} from '@playwright/test';
export class MainPage {
  private page: Page;
  readonly getWeatherButton: Locator;
  readonly weatherLocationInput: Locator;
  readonly temperatureFarenheit: Locator;
  readonly temperatureCelsius: Locator;
  readonly weatherLocationTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getWeatherButton = this.page.locator('input[id="myfcst-submit"]');
    this.weatherLocationInput = this.page.locator('input[id="myfcst-location-input"]');
    this.temperatureFarenheit = this.page.locator('span[id="myfcst-tempf"]');
    this.temperatureCelsius = this.page.locator('span[id="myfcst-tempc"]');
    this.weatherLocationTitle = this.page.locator('span[id="myfcst-title"]')
  }
  async goto() {
    await this.page.goto('https://www.weather.gov/');
  }

  async enterGetWeatherLocation(location: string) {
    await this.weatherLocationInput.fill(location);
  }

  async clickGetWeatherButton() {
    await this.getWeatherButton.click();
  }

  async getWeatherLocationTitle(): Promise<string[]> {
    const title = await this.weatherLocationTitle.allTextContents() ?? '';
    return title;
  }

  async validateTemperatureIsDisplayed() 
  {
    await expect(this.temperatureFarenheit).toHaveText(/-?\d+(\.\d+)?\s*°F/);
    await expect(this.temperatureCelsius).toHaveText(/-?\d+(\.\d+)?\s*°C/);
  }
}
