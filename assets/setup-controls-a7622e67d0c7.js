// Keep the original clock's saved preferences and audio gesture handling.
// Setup presents those same controls; the original React buttons stay mounted.
const root = document.getElementById('root');
const preferences = ['SOUND', 'MOTION'];

function originalButton(preference) {
  return [...root.querySelectorAll('.limit-tools .sig-btn')]
    .find(button => button.textContent.trim().startsWith(`${preference} `));
}

function syncSetupControls() {
  if (!preferences.every(originalButton)) return;
  document.documentElement.classList.add('setup-controls-ready');

  const dialog = root.querySelector('.setup-pop');
  if (!dialog) return;
  let group = dialog.querySelector('.setup-preferences');
  if (!group) {
    group = document.createElement('div');
    group.className = 'setup-preferences';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Sound and motion');
    for (const preference of preferences) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sig-btn';
      button.dataset.preference = preference;
      // Forward synchronously so browser audio unlocking keeps the user gesture.
      button.addEventListener('click', () => originalButton(preference)?.click());
      group.append(button);
    }
    dialog.querySelector('.setup-actions').before(group);
  }
  for (const button of group.children) {
    const original = originalButton(button.dataset.preference);
    const label = original.textContent.trim();
    const pressed = original.getAttribute('aria-pressed');
    if (button.textContent !== label) button.textContent = label;
    if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
  }
}

if (root) {
  // Ignore the fast-changing countdown text. Only mounting Setup or changing
  // a native preference can require a sync; inserted proxy buttons are ignored.
  new MutationObserver(records => {
    const relevant = records.some(record => record.type === 'attributes'
      ? record.target.matches('.limit-tools .sig-btn')
      : [...record.addedNodes].some(node => node.nodeType === Node.ELEMENT_NODE
        && (node.matches('.setup-pop, .limit-tools') || node.querySelector('.setup-pop, .limit-tools'))));
    if (relevant) syncSetupControls();
  }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
  syncSetupControls();
}
