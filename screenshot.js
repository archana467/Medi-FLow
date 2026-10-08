const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/login');
  await page.type('input[type="email"]', 'patient@mediflow.com');
  await page.type('input[type="password"]', 'patient123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  await page.goto('http://localhost:8080/appointments');
  await page.screenshot({path: 'appointments.png'});
  await browser.close();
})();
