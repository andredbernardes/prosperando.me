// Menu drawer mobile universal
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

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

function addDashboardMenuIfLoggedIn(loggedIn) {
  // Desktop
  const navbarMenu = document.querySelector('.navbar-menu');
  if (navbarMenu) {
    let dashboardLi = navbarMenu.querySelector('.menu-dashboard');
    if (dashboardLi) dashboardLi.remove();
    if (loggedIn) {
      dashboardLi = document.createElement('li');
      dashboardLi.className = 'menu-dashboard';
      dashboardLi.innerHTML = '<a href="/dashboard" class="navbar-link">📊 Dashboard</a>';
      navbarMenu.insertBefore(dashboardLi, navbarMenu.firstChild);
    }
  }
  // Drawer/mobile
  const drawerMenu = document.querySelector('.drawer-menu');
  if (drawerMenu) {
    let dashboardLi = drawerMenu.querySelector('.menu-dashboard');
    if (dashboardLi) dashboardLi.remove();
    if (loggedIn) {
      dashboardLi = document.createElement('li');
      dashboardLi.className = 'menu-dashboard';
      dashboardLi.innerHTML = '<a href="/dashboard" class="drawer-link">Dashboard</a>';
      drawerMenu.insertBefore(dashboardLi, drawerMenu.firstChild);
    }
  }
}

function renderUserMenu(user) {
  const navbarUser = document.getElementById('navbar-user-container');
  const drawerUser = document.getElementById('drawer-user-container');
  if (!navbarUser) return;
  navbarUser.innerHTML = '';
  drawerUser && (drawerUser.innerHTML = '');
  if (user) {
    // Dropdown desktop
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <button class="user-btn" type="button">🙏 ${user.displayName || user.email || 'Usuário'} ▼</button>
      <div class="user-dropdown-content">
        <a href="/perfil.html">Meu perfil</a>
        <a href="#" id="logout-link">Sair</a>
      </div>
    `;
    navbarUser.appendChild(dropdown);
    console.log('Dropdown inserido em:', dropdown.parentNode);
    // Clique para abrir/fechar
    const btn = dropdown.querySelector('.user-btn');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
    // Dropdown mobile
    if (drawerUser) {
      const drawerDropdown = document.createElement('div');
      drawerDropdown.className = 'user-dropdown';
      drawerDropdown.innerHTML = `
        <button class="user-btn" type="button">🙏 ${user.displayName || user.email || 'Usuário'} ▼</button>
        <div class="user-dropdown-content">
          <a href="/perfil.html">Meu perfil</a>
          <a href="#" id="logout-link-mobile">Sair</a>
        </div>
      `;
      drawerUser.appendChild(drawerDropdown);
      console.log('Dropdown mobile inserido em:', drawerDropdown.parentNode);
      const btnMobile = drawerDropdown.querySelector('.user-btn');
      btnMobile.addEventListener('click', function(e) {
        e.stopPropagation();
        drawerDropdown.classList.toggle('open');
      });
      document.addEventListener('click', function(e) {
        if (!drawerDropdown.contains(e.target)) drawerDropdown.classList.remove('open');
      });
    }
    // Logout
    setTimeout(() => {
      const logoutBtn = document.getElementById('logout-link');
      const logoutBtnMobile = document.getElementById('logout-link-mobile');
      if (logoutBtn) logoutBtn.onclick = logout;
      if (logoutBtnMobile) logoutBtnMobile.onclick = logout;
    }, 100);
  } else {
    // Botão Entrar
    const loginBtn = document.createElement('a');
    loginBtn.href = '/login';
    loginBtn.className = 'navbar-login';
    loginBtn.textContent = 'Entrar';
    navbarUser.appendChild(loginBtn);
    if (drawerUser) {
      const loginBtnMobile = document.createElement('a');
      loginBtnMobile.href = '/login';
      loginBtnMobile.className = 'drawer-login';
      loginBtnMobile.textContent = 'Entrar';
      drawerUser.appendChild(loginBtnMobile);
    }
  }
}

async function logout(e) {
  e.preventDefault();
  const { signOut } = await import('firebase/auth');
  const { auth } = await import('./firebase.js');
  await signOut(auth);
  window.location.href = '/login.html';
}

onAuthStateChanged(auth, (user) => {
  addDashboardMenuIfLoggedIn(!!user);
  renderUserMenu(user);
});

// Executa automaticamente ao importar
setupMenuMobile(); 