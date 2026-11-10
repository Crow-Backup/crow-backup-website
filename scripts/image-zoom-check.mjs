import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch({channel: 'msedge', headless: true});
try {
 for (const width of [1440, 390]) {
  const context = await browser.newContext({viewport: {width, height: 900}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const url of ['/', '/en/', '/en/download/', '/style-guide/']) {
   await page.goto('http://localhost:1414' + url, {waitUntil: 'networkidle'});
   const gallery = page.locator('.product-gallery .image-zoom-trigger');
   const link = (await gallery.count() ? gallery : page.locator('.image-zoom-trigger')).first();
   await link.focus();
   await page.keyboard.press('Enter');
   const dialog = page.getByRole('dialog');
   await dialog.waitFor({state: 'visible'});
   const img = dialog.locator('img');
   await img.evaluate(el => el.decode());
   assert.equal(await img.getAttribute('src'), await link.evaluate(el => el.href));
   assert.equal(await page.locator('html').evaluate(el => el.scrollWidth > innerWidth), false);
   for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('.image-viewer')), true, 'Focus stays in modal');
   }
   const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
   assert.deepEqual(result.violations.map(v => v.id), [], `${url} ${width}: modal accessibility`);
   await dialog.getByRole('button').first().click();
   assert.equal(await img.evaluate(el => Math.round(el.getBoundingClientRect().width) === el.naturalWidth), true, 'Actual size uses source pixels');
   await page.keyboard.press('Escape');
   assert.equal(await link.evaluate(el => el === document.activeElement), true, 'Escape restores focus');
   await link.click();
   await dialog.getByRole('button').last().click();
   assert.equal(await link.evaluate(el => el === document.activeElement), true, 'Close restores focus');
   if (url === '/en/download/') assert.ok(!(await link.getAttribute('href')).includes('-1024x668'), 'Thumbnail links to original');
  }
  assert.deepEqual(errors, []);
  await context.close();
 }
 const context = await browser.newContext({javaScriptEnabled: false});
 const page = await context.newPage();
 await page.goto('http://localhost:1414/en/');
 const fallback = page.locator('[data-image-zoom]').first();
 assert.ok((await fallback.getAttribute('href')).endsWith('.png'));
 await fallback.click();
 assert.ok(page.url().endsWith('.png'), 'Gallery links work without JavaScript');
 await context.close();
 console.log('PASS: DE/EN galleries and inline images, mobile/desktop modal, native resolution, keyboard close/focus, axe and no-JS gallery fallback.');
} finally {
 await browser.close();
}
