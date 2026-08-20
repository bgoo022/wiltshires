const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navToggleLabel = navToggle?.querySelector('.sr-only');

function setNav(open) {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('is-open', open);
  if (navToggleLabel) navToggleLabel.textContent = open ? 'Close navigation' : 'Open navigation';
}

navToggle?.addEventListener('click', () => {
  setNav(navToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNav(false)));

const promiseItems = Array.from(document.querySelectorAll('.promise-list li'));
let promiseIndex = promiseItems.findIndex((item) => item.classList.contains('active'));
if (promiseIndex < 0) promiseIndex = 0;

if (promiseItems.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    promiseItems[promiseIndex]?.classList.remove('active');
    promiseIndex = (promiseIndex + 1) % promiseItems.length;
    promiseItems[promiseIndex]?.classList.add('active');
  }, 1750);
}

const loadViewerButton = document.querySelector('[data-load-viewer]');
const resetViewerButton = document.querySelector('[data-reset-view]');
const viewerStage = document.querySelector('[data-viewer-stage]');
const viewerStatus = document.querySelector('[data-viewer-status]');
let viewerStarted = false;

loadViewerButton?.addEventListener('click', async () => {
  if (viewerStarted) return;
  viewerStarted = true;
  loadViewerButton.disabled = true;
  loadViewerButton.textContent = 'Loading 3D…';
  if (viewerStatus) viewerStatus.textContent = 'Loading 3D preview…';

  try {
    const { startRamViewer } = await import('./ram-viewer.js');
    await startRamViewer();
    viewerStage?.classList.add('is-live');
    loadViewerButton.hidden = true;
    if (resetViewerButton) resetViewerButton.hidden = false;
  } catch (error) {
    console.warn('Could not start the 3D viewer', error);
    viewerStarted = false;
    loadViewerButton.disabled = false;
    loadViewerButton.textContent = 'Try 3D preview again';
    if (viewerStatus) viewerStatus.textContent = '3D preview unavailable — photo shown instead.';
  }
});

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
