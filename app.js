const buttons = Array.from(document.querySelectorAll('[data-filter]'));
const projects = Array.from(document.querySelectorAll('.project-card'));
const count = document.getElementById('project-count');
buttons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  buttons.forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  let visible = 0;
  projects.forEach(project => {
    const match = filter === 'All' || project.dataset.categories.split(' ').includes(filter);
    project.hidden = !match;
    if (match) visible += 1;
  });
  count.textContent = `${String(visible).padStart(2, '0')} project${visible === 1 ? '' : 's'}`;
  document.getElementById('supporting-work').hidden = !projects.some(project => project.classList.contains('supporting-card') && !project.hidden);
}));
