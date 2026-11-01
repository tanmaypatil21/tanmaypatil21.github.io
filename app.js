/* Navigation and project routes work without JavaScript. */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    if (target) target.focus({ preventScroll: true });
  });
});
