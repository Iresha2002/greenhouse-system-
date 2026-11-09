/**
 * Selenium WebDriver UI Automation Script (Page Object Model)
 * System Under Test: SmartGrow OS Frontend (http://localhost:5173)
 * Module: EC4206 - Section 3.6 Test Automation & CI/CD
 */

// Page Object Model (POM) for SmartGrow OS Login & Marketplace Page
class SmartGrowMarketplacePage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = 'http://localhost:5173';
    }

    async open(By) {
        await this.driver.get(this.baseUrl);
    }

    async login(By, email, password) {
        const emailInput = await this.driver.findElement(By.css('input[type="email"]'));
        const passwordInput = await this.driver.findElement(By.css('input[type="password"]'));
        const loginBtn = await this.driver.findElement(By.css('button[type="submit"]'));

        await emailInput.clear();
        await emailInput.sendKeys(email);
        await passwordInput.clear();
        await passwordInput.sendKeys(password);
        await loginBtn.click();
    }

    async searchCrop(By, cropName) {
        const searchInput = await this.driver.findElement(By.css('input[placeholder*="Search"]'));
        await searchInput.clear();
        await searchInput.sendKeys(cropName);
    }
}

module.exports = { SmartGrowMarketplacePage };
