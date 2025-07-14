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
  // Limpa ambos sempre
  navbarUser.innerHTML = '';
  drawerUser && (drawerUser.innerHTML = '');
  // Função para criar dropdown
  function createDropdown(target, isMobile) {
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <button class="user-btn" type="button">🙏 ${user.displayName || user.email || 'Usuário'} </button>
      <div class="user-dropdown-content">
        <a href="./perfil.html">Meu perfil</a>
        <a href="#" id="logout-link${isMobile ? '-mobile' : ''}">Sair</a>
      </div>
    `;
    target.appendChild(dropdown);
    const btn = dropdown.querySelector('.user-btn');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  }
  // Decide onde renderizar baseado na largura da tela
  function renderByScreen() {
    navbarUser.innerHTML = '';
    drawerUser && (drawerUser.innerHTML = '');
    if (user) {
      if (window.innerWidth > 900) {
        // Desktop: só no topo
        createDropdown(navbarUser, false);
      } else {
        // Mobile: só no drawer
        if (drawerUser) createDropdown(drawerUser, true);
      }
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
      if (window.innerWidth > 900) {
        navbarUser.appendChild(loginBtn);
      } else if (drawerUser) {
        drawerUser.appendChild(loginBtn);
      }
    }
  }
  renderByScreen();
  // Atualiza ao redimensionar
  window.addEventListener('resize', renderByScreen);
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