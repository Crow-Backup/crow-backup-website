const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
}

menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
    }
});
navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
});
window.matchMedia('(min-width: 951px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
});
document.querySelectorAll('[data-details]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.faq-item').forEach(details => details.open = button.dataset.details === 'open');
}));
// Build-time links work without JavaScript; this refreshes them when releases change.
if (document.querySelector('[data-installer]')) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch('https://downloads.crowbackup.ch/v1/current-version.json', {signal: controller.signal})
        .then(response => {
            if (!response.ok) throw Error('Release unavailable');
            return response.json();
        })
        .then(release => {
            document.querySelectorAll('[data-installer]').forEach(link => {
                const value = release.installer?.[link.dataset.installer];
                if (value && new URL(value).origin === 'https://downloads.crowbackup.ch') link.href = value;
            });
            if (typeof release.version === 'string') document.querySelectorAll('[data-version]').forEach(element => element.textContent = release.version);
        }).catch(() => {/* Keep the usable build-time download links. */
    }).finally(() => clearTimeout(timeout));
}

// Full-size image links remain usable when the dialog API is unavailable.
const imageZoomLabels = document.documentElement.lang.startsWith('de')
    ? {open: 'Bild vergrössern', close: 'Schliessen', actual: 'Originalgrösse', fit: 'An Fenster anpassen', title: 'Bildansicht'}
    : {open: 'Enlarge image', close: 'Close', actual: 'Actual size', fit: 'Fit to window', title: 'Image viewer'};
const zoomLinks = [];
document.querySelectorAll('.prose img').forEach(img => {
    if (!img.alt || /\.svg(?:[?#]|$)/i.test(img.src)) return;
    let link = img.closest('a');
    if (link && !link.hasAttribute('data-image-zoom')) return;
    if (!link) {
        link = document.createElement('a');
        link.href = img.dataset.zoomSrc || img.currentSrc || img.src;
        img.before(link);
        link.append(img);
    }
    link.classList.add('image-zoom-trigger');
    link.dataset.zoomLabel = imageZoomLabels.open + ' ↗';
    link.setAttribute('aria-label', `${imageZoomLabels.open}: ${img.alt}`);
    zoomLinks.push(link);
});
if (zoomLinks.length && typeof HTMLDialogElement !== 'undefined') {
    const dialog = document.createElement('dialog');
    dialog.className = 'image-viewer';
    dialog.setAttribute('aria-label', imageZoomLabels.title);
    const toolbar = document.createElement('div');
    toolbar.className = 'image-viewer-toolbar';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = imageZoomLabels.actual;
    toggle.setAttribute('aria-pressed', 'false');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = imageZoomLabels.close;
    close.autofocus = true;
    const stage = document.createElement('div');
    stage.className = 'image-viewer-stage';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', imageZoomLabels.title);
    const enlarged = document.createElement('img');
    toolbar.append(toggle, close);
    dialog.append(toolbar, stage);
    document.body.append(dialog);
    let opener;
    zoomLinks.forEach(link => {
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            opener = link;
            stage.append(enlarged);
            enlarged.src = link.href;
            enlarged.alt = link.querySelector('img').alt;
            dialog.classList.remove('image-viewer-actual');
            toggle.textContent = imageZoomLabels.actual;
            toggle.setAttribute('aria-pressed', 'false');
            dialog.showModal();
            document.documentElement.classList.add('image-viewer-open');
            stage.scrollTo(0, 0);
        });
    });
    toggle.addEventListener('click', () => {
        const actual = dialog.classList.toggle('image-viewer-actual');
        toggle.textContent = actual ? imageZoomLabels.fit : imageZoomLabels.actual;
        toggle.setAttribute('aria-pressed', String(actual));
        stage.scrollTo(0, 0);
    });
    dialog.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        if (event.shiftKey && document.activeElement === toggle) {
            event.preventDefault();
            stage.focus();
        } else if (!event.shiftKey && document.activeElement === stage) {
            event.preventDefault();
            toggle.focus();
        }
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('image-viewer-open');
        opener?.focus({preventScroll: true});
        enlarged.remove();
        enlarged.removeAttribute('src');
    });
}
