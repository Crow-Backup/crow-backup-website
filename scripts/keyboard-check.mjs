import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const manifest=JSON.parse(await fs.readFile('data/routes.json','utf8'));
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const context=await browser.newContext({viewport:{width:320,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
await page.route('**/livereload.js*',route=>route.abort());
const issues=[];
for(const entry of manifest.pages){
 await page.goto('http://localhost:1414'+entry.url,{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))issues.push(`${entry.url}: horizontal page overflow at 320px`);
}
await page.goto('http://localhost:1414/');
await page.keyboard.press('Tab');
if(!await page.locator('.skip-link').evaluate(e=>e===document.activeElement))issues.push('Skip link is not the first keyboard target');
await page.keyboard.press('Enter');
if(!await page.locator('#main').evaluate(e=>e===document.activeElement))issues.push('Skip link does not move focus to the main content');
await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');
if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='true')issues.push('Mobile menu does not open with the keyboard');
await page.keyboard.press('Tab');await page.keyboard.press('Escape');
if(!await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement))issues.push('Closing mobile menu does not restore focus');
if(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)!=='auto')issues.push('Reduced motion is not respected');
await page.setViewportSize({width:1280,height:900});await page.goto('http://localhost:1414/');
await page.locator('.nav-group-toggle').focus();await page.keyboard.press('Enter');
if(await page.locator('.nav-group-toggle').getAttribute('aria-expanded')!=='true')issues.push('Documentation dropdown does not open with the keyboard');
await page.keyboard.press('Tab');
if(!await page.locator('#docs-menu a').first().evaluate(e=>e===document.activeElement))issues.push('Documentation dropdown items are not reachable with Tab');
await page.keyboard.press('Escape');
if(await page.locator('.nav-group-toggle').getAttribute('aria-expanded')!=='false'||!await page.locator('.nav-group-toggle').evaluate(e=>e===document.activeElement))issues.push('Escape does not close the documentation dropdown and restore focus');
await page.goto('http://localhost:1414/funktionsweise/');
await page.locator('.diagram-controls button').nth(2).focus();await page.keyboard.press('Enter');
if(await page.locator('.connection-diagram').getAttribute('data-scenario')!=='letterbox'||await page.locator('.cd-caption[data-caption="letterbox"]').isHidden())issues.push('Connection diagram is not keyboard operable');
await page.setViewportSize({width:320,height:900});await page.goto('http://localhost:1414/');
await page.locator('details summary').first().focus();await page.keyboard.press('Enter');
if(!await page.locator('details').first().evaluate(e=>e.open))issues.push('FAQ is not keyboard operable');
for(const url of ['/style-guide/','/404.html','/en/404.html']){
 await page.goto('http://localhost:1414'+url);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();
 for(const violation of result.violations)issues.push(`${url}: ${violation.id}`);
}
await browser.close();
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`PASS: all ${manifest.pages.length} routes reflow at 320px, keyboard skip link/menu/dropdown/FAQ, focus restoration, reduced motion, style guide and 404 accessibility checks.`);
