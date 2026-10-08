const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/login');
  await page.type('input[type="email"]', 'patient@mediflow.com');
  await page.type('input[type="password"]', 'patient123');
  await page.click('button[type="submit"]');
  // Wait for login to process and navigation to occur
  await new Promise(r => setTimeout(r, 2000));
  await page.goto('http://localhost:8080/appointments');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'appointments2.png'});
  await browser.close();
})().catch(console.error);
