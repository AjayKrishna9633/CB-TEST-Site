/* ============================================
   UserVault — Client-Side JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFlashMessages();
  initMobileNav();
  initDeleteConfirmation();
  initFormValidation();
  initActiveNavLink();
  initNavbarScroll();
});

/* ---------- Flash Message Auto-Dismiss ---------- */
function initFlashMessages() {
  const alerts = document.querySelectorAll('.alert');

  alerts.forEach((alert) => {
    // Extract message text (removing the icon and close button elements)
    const tempAlert = alert.cloneNode(true);
    const icon = tempAlert.querySelector('.alert-icon');
    const closeBtn = tempAlert.querySelector('.alert-close');
    if (icon) icon.remove();
    if (closeBtn) closeBtn.remove();
    const message = tempAlert.textContent.trim();
    if (message) {
      window.alert(message);
    }

    // Close button
    const closeBtnReal = alert.querySelector('.alert-close');
    if (closeBtnReal) {
      closeBtnReal.addEventListener('click', () => dismissAlert(alert));
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => dismissAlert(alert), 5000);
  });
}

function dismissAlert(alert) {
  if (alert.classList.contains('fade-out')) return;
  alert.classList.add('fade-out');
  alert.addEventListener('animationend', () => {
    alert.remove();
  }, { once: true });
}

/* ---------- Mobile Navigation Toggle ---------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

/* ---------- Delete Confirmation Modal ---------- */
function initDeleteConfirmation() {
  const deleteForms = document.querySelectorAll('.delete-form');

  if (deleteForms.length === 0) return;

  // Create modal once
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <span class="modal-icon">⚠️</span>
      <h3>Confirm Delete</h3>
      <p>Are you sure you want to delete this? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn btn-outline" id="modalCancel">Cancel</button>
        <button class="btn btn-danger" id="modalConfirm">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  let pendingForm = null;

  const cancelBtn = document.getElementById('modalCancel');
  const confirmBtn = document.getElementById('modalConfirm');

  function openModal(form) {
    pendingForm = form;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    pendingForm = null;
  }

  cancelBtn.addEventListener('click', closeModal);

  confirmBtn.addEventListener('click', () => {
    if (pendingForm) {
      pendingForm.submit();
    }
    closeModal();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  deleteForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      openModal(form);
    });
  });
}

/* ---------- Form Validation Visual Feedback ---------- */
function initFormValidation() {
  const forms = document.querySelectorAll('form:not(.delete-form):not(.search-form)');

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      let hasErrors = false;
      const inputs = form.querySelectorAll('.form-control[required]');

      inputs.forEach((input) => {
        input.classList.remove('is-invalid');

        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          hasErrors = true;
        }
      });

      // Check password confirmation
      const password = form.querySelector('input[name="password"]');
      const confirm = form.querySelector('input[name="confirmPassword"]');
      if (password && confirm && password.value !== confirm.value) {
        confirm.classList.add('is-invalid');
        hasErrors = true;
      }

      if (hasErrors) {
        e.preventDefault();
        // Focus first invalid
        const first = form.querySelector('.is-invalid');
        if (first) first.focus();
      }
    });

    // Clear invalid state on input
    form.querySelectorAll('.form-control').forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    });
  });
}

/* ---------- Active Nav Link ---------- */
function initActiveNavLink() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a:not(.btn)');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
}
