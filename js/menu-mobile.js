// Menu drawer mobile universal
export function setupMenuMobile() {
  document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('navbar-burger');
    const drawer = document.getElementById('navbar-drawer');
    const closeBtn = document.getElementById('drawer-close');
    const backdrop = document.getElementById('drawer-backdrop');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    if (burger && drawer && closeBtn && backdrop) {
      function openDrawer() {
        drawer.classList.add('open');
        backdrop.classList.add('show');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
      function closeDrawer() {
        drawer.classList.remove('open');
        backdrop.classList.remove('show');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      burger.addEventListener('click', openDrawer);
      closeBtn.addEventListener('click', closeDrawer);
      backdrop.addEventListener('click', closeDrawer);
      drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
      });
      // Acessibilidade
      burger.setAttribute('aria-controls', 'navbar-drawer');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
    }
  });
}
// Executa automaticamente ao importar
setupMenuMobile(); 