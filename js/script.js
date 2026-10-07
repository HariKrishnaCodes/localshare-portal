/**
 * LS Mobile Application - Portal Interactions & Google Play Compliance Logic
 * Vanilla JavaScript (Zero external dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFaqAccordion();
  initAccountDeletionForm();
  initContactForm();
  initPolicyScrollSpy();
  initCopyButtons();
  highlightActiveNavLink();
});

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * FAQ Accordion with smooth toggle
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Optional: Close others for accordion style
      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });

      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Account Deletion Form with Google Play compliance & mailto fallback
 */
function initAccountDeletionForm() {
  const form = document.getElementById('deletion-request-form');
  if (!form) return;

  const resultBox = document.getElementById('deletion-result-box');
  const resultPreview = document.getElementById('deletion-preview-text');
  const copyBtn = document.getElementById('copy-deletion-details-btn');
  const mailtoLinkBtn = document.getElementById('open-email-client-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullNameInput = form.querySelector('#full-name');
    const emailInput = form.querySelector('#account-email');
    const accountIdInput = form.querySelector('#account-id');
    const reasonInput = form.querySelector('#deletion-reason');
    const confirmCheckbox = form.querySelector('#confirm-deletion');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const accountId = accountIdInput ? accountIdInput.value.trim() : '';
    const reason = reasonInput ? reasonInput.value.trim() : 'No reason provided';
    const isConfirmed = confirmCheckbox ? confirmCheckbox.checked : false;

    // Basic Validation
    if (!fullName) {
      alert('Please enter your full name.');
      fullNameInput && fullNameInput.focus();
      return;
    }

    if (!email || !validateEmail(email)) {
      alert('Please provide a valid registered email address.');
      emailInput && emailInput.focus();
      return;
    }

    if (!accountId) {
      alert('Please enter your Username or Account ID.');
      accountIdInput && accountIdInput.focus();
      return;
    }

    if (!isConfirmed) {
      alert('Please confirm that you understand account deletion may permanently remove your account and associated data.');
      confirmCheckbox && confirmCheckbox.focus();
      return;
    }

    const submissionDate = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // Format plain text request details
    const requestDetails = [
      '====================================================',
      '        DATA & ACCOUNT DELETION REQUEST',
      '====================================================',
      `Full Name: ${fullName}`,
      `Account Email: ${email}`,
      `Username / Account ID: ${accountId}`,
      `Reason for Deletion: ${reason || 'Not specified'}`,
      `User Acknowledgment: Yes, deletion confirmed by user`,
      `Requested Timestamp: ${submissionDate}`,
      '====================================================',
      'Please verify this request and initiate the deletion of my',
      'account and associated personal data per Google Play policies.'
    ].join('\n');

    // Create Mailto Link
    const targetSupportEmail = 'support@localshare.infotechs.co.in';
    const emailSubject = encodeURIComponent(`[Account Deletion Request] - ${accountId}`);
    const emailBody = encodeURIComponent(requestDetails);
    const mailtoUrl = `mailto:${targetSupportEmail}?subject=${emailSubject}&body=${emailBody}`;

    // Display formatted results on page
    if (resultPreview) {
      resultPreview.textContent = requestDetails;
    }

    if (mailtoLinkBtn) {
      mailtoLinkBtn.setAttribute('href', mailtoUrl);
    }

    if (resultBox) {
      resultBox.classList.add('visible');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Trigger user mail client
    try {
      window.location.href = mailtoUrl;
    } catch (err) {
      console.warn('Unable to directly launch mail client:', err);
    }

    showToast('Deletion request prepared! Check your email client or copy details below.');
  });

  if (copyBtn && resultPreview) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = resultPreview.textContent || '';
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Request details copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Request details copied to clipboard!');
      });
    });
  }
}

/**
 * Contact Support Form handler with mailto fallback
 */
function initContactForm() {
  const form = document.getElementById('contact-support-form');
  if (!form) return;

  const resultBox = document.getElementById('contact-result-box');
  const resultPreview = document.getElementById('contact-preview-text');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const subjectInput = form.querySelector('#contact-subject');
    const messageInput = form.querySelector('#contact-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : 'General Inquiry';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name) {
      alert('Please enter your name.');
      nameInput && nameInput.focus();
      return;
    }

    if (!email || !validateEmail(email)) {
      alert('Please enter a valid email address.');
      emailInput && emailInput.focus();
      return;
    }

    if (!message) {
      alert('Please write your message or issue description.');
      messageInput && messageInput.focus();
      return;
    }

    const contactBody = [
      `From: ${name} (${email})`,
      `Subject: ${subject}`,
      '----------------------------------------',
      'Message:',
      message
    ].join('\n');

    const targetEmail = 'support@localshare.infotechs.co.in';
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent('[Support] ' + subject)}&body=${encodeURIComponent(contactBody)}`;

    if (resultPreview) {
      resultPreview.textContent = contactBody;
    }

    if (resultBox) {
      resultBox.classList.add('visible');
    }

    try {
      window.location.href = mailtoUrl;
    } catch (err) {
      console.warn('Mail launch failed', err);
    }

    showToast('Support email prepared! Launching your mail client...');
  });
}

/**
 * Scroll spy & smooth scroll for Privacy Policy Table of Contents
 */
function initPolicyScrollSpy() {
  const navLinks = document.querySelectorAll('.policy-nav-link');
  const sections = document.querySelectorAll('.policy-section');

  if (!navLinks.length || !sections.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/**
 * Copy button helper
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      const copyText = targetEl ? (targetEl.innerText || targetEl.textContent) : btn.getAttribute('data-copy-text');

      if (copyText) {
        navigator.clipboard.writeText(copyText.trim()).then(() => {
          showToast('Copied to clipboard!');
        }).catch(() => {
          showToast('Unable to copy automatically.');
        });
      }
    });
  });
}

/**
 * Active navigation link highlighter
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-links .nav-link');

  allNavLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href === currentPath ||
      (currentPath === '' && (href === 'index.html' || href === './' || href === '/')) ||
      (currentPath === 'index.html' && (href === 'index.html' || href === './'))
    ) {
      link.classList.add('active');
    }
  });
}

/**
 * Utility: Email validator
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Utility: Toast notifications
 */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D0481A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
