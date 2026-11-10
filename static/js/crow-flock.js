(() => {
    const flock = document.querySelector('[data-crow-flock]');
    if (!flock) return;
    const template = flock.querySelector('[data-crow-bird]');
    const zones = [...flock.querySelectorAll('[data-crow-zone]')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let birds = [], tracks = [], frame = 0, lastTime = 0, serial = 0, pointer = null;
    const random = (min, max) => min + Math.random() * (max - min);
    const draw = bird => {
        bird.element.style.transform = `translate(${bird.x}px, ${bird.y}px)`;
        bird.facing.style.transform = `scaleX(${bird.direction})`;
    };
    const clearTracks = () => { tracks.forEach(track => track.element.remove()); tracks = []; };
    const distance = (x, y, other) => Math.hypot(x - other.x, y - other.y);
    const chooseTarget = bird => {
        const radius = 180;
        for (let attempt = 0; attempt < 20; attempt++) {
            const x = Math.max(bird.minX, Math.min(bird.maxX, bird.x + random(-radius, radius)));
            const y = Math.max(bird.minY, Math.min(bird.maxY, bird.y + random(-radius, radius)));
            if (Math.hypot(x - bird.x, y - bird.y) < 12) continue;
            if (birds.some(other => other !== bird && other.zone === bird.zone && distance(x, y, other) < bird.spacing)) continue;
            bird.targetX = x; bird.targetY = y;
            return;
        }
        bird.targetX = bird.x; bird.targetY = bird.y;
        bird.waitIn = random(1, 2);
    };
    const flee = (bird, point) => {
        const centerX = bird.x + bird.size / 2, centerY = bird.y + bird.size / 2;
        const fromX = point.clientX + scrollX - bird.originX;
        const fromY = point.clientY + scrollY - bird.originY;
        const angle = Math.atan2(centerY - fromY, centerX - fromX);
        let target = null, bestDistance = Math.hypot(centerX - fromX, centerY - fromY);
        for (let attempt = 0; attempt < 24; attempt++) {
            const heading = angle + random(-1.3, 1.3);
            const x = Math.max(bird.minX, Math.min(bird.maxX, bird.x + Math.cos(heading) * 180));
            const y = Math.max(bird.minY, Math.min(bird.maxY, bird.y + Math.sin(heading) * 180));
            const away = Math.hypot(x + bird.size / 2 - fromX, y + bird.size / 2 - fromY);
            if (away <= bestDistance) continue;
            if (birds.some(other => other !== bird && other.zone === bird.zone && distance(x, y, other) < bird.spacing)) continue;
            target = {x, y}; bestDistance = away;
        }
        if (!target) return;
        if (bird.action) bird.element.classList.remove(`is-${bird.action}`);
        bird.action = null; bird.actionLeft = 0; bird.actionIn = random(4, 10);
        bird.waitIn = 0; bird.fleeLeft = 2.8; bird.turnIn = 4;
        bird.targetX = target.x; bird.targetY = target.y;
        bird.element.classList.remove('is-idle');
        bird.element.classList.add('is-fleeing');
    };
    const makeBird = (zone, index, count, width, height) => {
        const size = (width < 500 ? 48 : 60) * 1.12;
        const minX = 10, maxX = Math.max(minX, width - size - 12);
        const minY = 22, maxY = Math.max(minY, height - size * 70 / 64 - 8);
        const element = document.createElement('div');
        element.className = 'crow-wanderer';
        element.style.setProperty('--flock-width', `${size}px`);
        const facing = document.createElement('div');
        facing.className = 'crow-facing';
        const svg = template.content.firstElementChild.cloneNode(true);
        const id = `flock-bird-${++serial}-mask`;
        svg.querySelector('mask').id = id;
        svg.querySelector('[mask]').setAttribute('mask', `url(#${id})`);
        facing.append(svg); element.append(facing);
        const call = document.createElement('span');
        call.className = 'crow-call'; call.textContent = 'kraa';
        element.append(call); zone.append(element);
        const bird = {
            element, facing, zone, size, minX, maxX, minY, maxY,
            originX: zone.getBoundingClientRect().left + scrollX,
            originY: zone.getBoundingClientRect().top + scrollY, fleeLeft: 0,
            x: minX + (maxX - minX) * index / Math.max(1, count - 1),
            y: index === 0 ? minY + 4 : minY + (maxY - minY) * random(.3, .9),
            spacing: Math.min(150, (width - 24) / 3),
            targetX: 0, targetY: 0, vx: 1, vy: 0, turnIn: random(4, 10), waitIn: 0,
            direction: Math.random() < .5 ? -1 : 1, speed: random(8, 14),
            actionIn: random(2, 9), actionLeft: 0, action: null, nextAction: index === 1 ? 'calling' : 'pecking', stepIn: random(0, .6), foot: 0
        };
        // Synchronize each bird's gait to its travel speed; avoid a marching chorus.
        const stride = 12 / bird.speed;
        svg.querySelectorAll('.flock-motion').forEach(part => part.style.animationDuration = `${stride}s`);
        svg.querySelector('.flock-far').style.animationDelay = `${-stride / 2}s`;
        bird.body = svg.querySelector('.flock-body');
        draw(bird);
        return bird;
    };
    const layout = () => {
        cancelAnimationFrame(frame); frame = 0; lastTime = 0;
        birds.forEach(bird => bird.element.remove()); birds = []; clearTracks();
        flock.classList.add('is-ready');
        zones.forEach(zone => {
            const {width, height} = zone.getBoundingClientRect();
            if (!width || !height) return;
            const count = 3;
            for (let i = 0; i < count; i++) birds.push(makeBird(zone, i, count, width, height));
        });
        birds.forEach(chooseTarget);
        resume();
    };
    const stamp = bird => {
        const element = document.createElement('img');
        element.className = 'crow-track'; element.alt = ''; element.src = flock.dataset.footprint;
        const foot = bird.foot++ % 2 ? 2.5 : -2.5;
        const x = bird.x + bird.size * .5 - bird.vy * foot;
        const y = bird.y + bird.size - 4 + bird.vx * foot;
        element.style.left = `${x}px`; element.style.top = `${y}px`;
        element.style.transform = `rotate(${Math.atan2(bird.vy, bird.vx) * 180 / Math.PI + 90}deg)`;
        bird.zone.prepend(element); tracks.push({element, life: 8});
        if (tracks.length > 240) tracks.shift().element.remove();
    };
    const tick = time => {
        frame = 0;
        const dt = lastTime ? Math.min((time - lastTime) / 1000, .08) : 0;
        lastTime = time;
        for (const bird of birds) {
            bird.fleeLeft = Math.max(0, bird.fleeLeft - dt);
            if (!bird.fleeLeft) bird.element.classList.remove('is-fleeing');
            if (pointer && bird.fleeLeft < 1) {
                const dx = pointer.clientX + scrollX - (bird.originX + bird.x + bird.size / 2);
                const dy = pointer.clientY + scrollY - (bird.originY + bird.y + bird.size / 2);
                if (Math.hypot(dx, dy) < bird.size / 2 + 48) flee(bird, pointer);
            }
            if (bird.actionLeft > 0) {
                bird.actionLeft -= dt;
                if (bird.actionLeft <= 0) {
                    bird.element.classList.remove(`is-${bird.action}`);
                    bird.action = null;
                    bird.actionIn = random(5, 13);
                }
                continue;
            }
            bird.actionIn -= dt;
            if (bird.actionIn <= 0) {
                bird.action = bird.nextAction;
                bird.nextAction = Math.random() < .35 ? 'calling' : 'pecking';
                bird.actionLeft = bird.action === 'calling' ? 2.2 : 1.6;
                bird.element.classList.remove('is-idle');
                bird.element.classList.add(`is-${bird.action}`);
                bird.body.style.animationDuration = `${bird.actionLeft}s`;
                continue;
            }
            bird.body.style.animationDuration = `${12 / bird.speed}s`;
            if (bird.waitIn > 0) {
                bird.waitIn -= dt;
                bird.element.classList.add('is-idle');
                continue;
            }
            bird.turnIn -= dt;
            let dx = bird.targetX - bird.x, dy = bird.targetY - bird.y;
            let length = Math.hypot(dx, dy);
            if (length < 3 || bird.turnIn <= 0) {
                chooseTarget(bird); bird.turnIn = random(4, 12);
                dx = bird.targetX - bird.x; dy = bird.targetY - bird.y;
                length = Math.hypot(dx, dy);
            }
            if (length < 1) { bird.element.classList.add('is-idle'); continue; }
            bird.vx = dx / length; bird.vy = dy / length;
            const step = Math.min(length, bird.speed * (bird.fleeLeft ? 4.2 : 1) * dt);
            const x = bird.x + bird.vx * step, y = bird.y + bird.vy * step;
            if (birds.some(other => other !== bird && other.zone === bird.zone && distance(x, y, other) < bird.spacing)) {
                chooseTarget(bird);
                bird.element.classList.add('is-idle');
                continue;
            }
            bird.element.classList.remove('is-idle');
            bird.x = x; bird.y = y;
            if (Math.abs(bird.vx) > .1) bird.direction = bird.vx > 0 ? 1 : -1;
            bird.stepIn -= dt;
            if (bird.stepIn <= 0) { stamp(bird); bird.stepIn = 6 / (bird.speed * (bird.fleeLeft ? 4.2 : 1)); }
            draw(bird);
        }
        tracks = tracks.filter(track => {
            track.life -= dt;
            if (track.life <= 0) { track.element.remove(); return false; }
            return true;
        });
        frame = requestAnimationFrame(tick);
    };
    function resume() {
        cancelAnimationFrame(frame); frame = 0; lastTime = 0;
        flock.classList.toggle('is-sleeping', document.hidden);
        if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', resume);
    document.addEventListener('pointermove', event => {
        if (event.pointerType !== 'touch') pointer = {clientX: event.clientX, clientY: event.clientY};
    }, {passive: true});
    document.addEventListener('pointerleave', () => { pointer = null; });
    document.addEventListener('pointerdown', event => {
        if (reduced.matches) return;
        const point = {clientX: event.clientX, clientY: event.clientY};
        for (const bird of birds) {
            const dx = event.clientX + scrollX - (bird.originX + bird.x + bird.size / 2);
            const dy = event.clientY + scrollY - (bird.originY + bird.y + bird.size / 2);
            if (Math.hypot(dx, dy) < bird.size / 2 + 20) flee(bird, point);
        }
    }, {passive: true});
    let resizeFrame;
    const observer = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(layout);
    });
    zones.forEach(zone => observer.observe(zone));
    observer.observe(document.body);
    reduced.addEventListener('change', layout);
    layout();
})();
