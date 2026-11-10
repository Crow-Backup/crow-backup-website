import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({channel: 'msedge', headless: true});
const context = await browser.newContext({viewport: {width: 1920, height: 1000}});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/livereload.js*', route => route.abort());
const assert = (value, message) => { if (!value) throw Error(message); };
const position = bird => bird.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return {x: rect.left, y: rect.top, width: rect.width, height: rect.height, scroll: scrollY};
});
await page.goto('http://localhost:1414/style-guide/');
await page.waitForSelector('.crow-flock.is-ready');
assert(await page.locator('.crow-wanderer').count() === 3, 'Expected exactly three crows');
assert(await page.locator('.crow-side').count() === 0, 'Side crows should be removed');
assert(await page.locator('.crow-motion-toggle').count() === 0, 'Pause button should be removed');
assert(Math.abs((await position(page.locator('.crow-wanderer').first())).width - 67.2) < .1, 'Desktop crows should be 12% larger');
await page.locator('.crow-meadow').scrollIntoViewIfNeeded();
const bird = page.locator('.crow-wanderer').first();
const beforeScroll = await position(bird);
await page.evaluate(() => scrollBy({top: -200, behavior: 'instant'}));
await page.waitForTimeout(100);
const afterScroll = await position(bird);
assert(Math.abs(beforeScroll.y + beforeScroll.scroll - afterScroll.y - afterScroll.scroll) < 2, 'Crows should scroll with the page');
await page.locator('.crow-meadow').scrollIntoViewIfNeeded();
const placement = await page.evaluate(() => ({
    habitat: document.querySelector('.crow-bottom').getBoundingClientRect().top,
    meadow: document.querySelector('.crow-meadow').getBoundingClientRect().top,
    end: document.querySelector('.crow-meadow').getBoundingClientRect().bottom,
    footer: document.querySelector('.site-footer').getBoundingClientRect().top
}));
assert(placement.habitat < placement.meadow && placement.end <= placement.footer + 1, 'Crows should overlap preceding content above the footer');
const beforeFlee = await position(bird);
const pointer = {x: beforeFlee.x + beforeFlee.width / 2, y: beforeFlee.y + beforeFlee.height / 2};
await page.mouse.move(pointer.x, pointer.y);
await page.waitForFunction(() => document.querySelector('.is-fleeing'));
await page.waitForTimeout(400);
const afterFlee = await position(bird);
assert(Math.hypot(afterFlee.x - beforeFlee.x, afterFlee.y - beforeFlee.y) > 7, 'Crow should escape faster than normal walking');
// A real click beneath a bird must reach the underlying control.
const clickBird = await position(bird);
const point = {x: clickBird.x + clickBird.width / 2, y: clickBird.y + clickBird.height / 2};
await page.evaluate(point => {
    const button = document.createElement('button');
    button.id = 'crow-click-through-check'; button.textContent = 'Underlying control';
    Object.assign(button.style, {position: 'fixed', left: `${point.x - 35}px`, top: `${point.y - 35}px`, width: '70px', height: '70px', zIndex: '1'});
    button.onclick = () => button.dataset.clicked = 'yes';
    document.body.append(button);
}, point);
await page.mouse.click(point.x, point.y);
assert(await page.locator('#crow-click-through-check').getAttribute('data-clicked') === 'yes', 'Crows must not intercept content clicks');
await page.locator('#crow-click-through-check').evaluate(node => node.remove());
await page.mouse.move(960, 100);
await page.waitForFunction(() => document.querySelector('.is-calling'), null, {timeout: 30000});
assert(await page.locator('.is-calling .crow-call').first().textContent() === 'kraa', 'Only one kraa should appear per beat');
await page.waitForFunction(() => document.querySelector('.is-pecking'), null, {timeout: 30000});
const pecker = await page.locator('.is-pecking').first().elementHandle();
const peck = await pecker.evaluate(async node => {
    const transform = node.style.transform;
    await new Promise(resolve => setTimeout(resolve, 100));
    return {still: transform === node.style.transform, body: getComputedStyle(node.querySelector('.flock-body')).animationName};
});
assert(peck.still && peck.body === 'flock-peck-body', 'Pecking must pause travel');
await page.waitForFunction(node => !node.classList.contains('is-pecking'), pecker);
await page.waitForFunction(() => document.querySelectorAll('.crow-track').length > 0);
const track = await page.locator('.crow-track').first().elementHandle();
const opacity = await track.evaluate(node => Number(getComputedStyle(node).opacity));
assert(opacity > .24, 'Fresh footprints should be darker than the previous version');
await page.waitForTimeout(200);
assert(await track.evaluate(node => Number(getComputedStyle(node).opacity)) < opacity, 'Footprints should fade');
const transforms = () => page.locator('.crow-wanderer').evaluateAll(nodes => nodes.map(node => node.style.transform));
await page.goto('http://localhost:1414/en/');
for (const width of [1440, 390, 320]) {
    await page.setViewportSize({width, height: 900}); await page.waitForTimeout(150);
    assert(await page.locator('.crow-wanderer').count() === 3, `Three crows should remain at ${width}px`);
    if (width < 500) assert(Math.abs((await position(bird)).width - 53.76) < .1, 'Mobile crows should be 12% larger');
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow at ${width}px`);
}
await page.emulateMedia({reducedMotion: 'reduce'}); await page.waitForTimeout(150);
const reduced = JSON.stringify(await transforms()); await page.waitForTimeout(150);
assert(reduced === JSON.stringify(await transforms()), 'Reduced motion should stop travel');
assert(await page.locator('.flock-leg').first().evaluate(node => getComputedStyle(node).animationName) === 'none', 'Reduced motion should stop the gait');
await page.emulateMedia({reducedMotion: 'no-preference'});
await page.setViewportSize({width: 1920, height: 1000});
await page.locator('.crow-meadow').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
await fs.mkdir('.tools/screenshots', {recursive: true});
await page.screenshot({path: '.tools/screenshots/crow-bottom-flock.png'});
const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
assert(new Set(ids).size === ids.length, 'Crow SVGs should have unique IDs');
assert(!errors.length, errors.join('\n'));
await browser.close();
console.log('PASS: three bottom crows, 12% larger, page anchoring, overlap, click-through, faster escape, two-call text, pecking, darker fading tracks, no pause control, reduced motion and mobile reflow.');
