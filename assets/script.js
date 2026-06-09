/**
 * Plumb5 Healthcare Custom Core Interactions Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons on DOM ready
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Bind event listeners
  initScrollHandler();
  initTimelineInteractivity();
  initFormValidation();
  initFAQAccordion();
  initScrollReveal();
  initCountUp();
});

// Fallback: re-run icon creation after all assets fully loaded
// (catches icons inside dynamically positioned or deferred elements)
window.addEventListener('load', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/**
 * 1. Viewport Scroll Handlers (Progress bar + Demo Toast Notification)
 */
function initScrollHandler() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const demoToast = document.getElementById('demo-notification');
  const closeToastBtn = document.getElementById('close-toast-btn');
  const mainHeader = document.getElementById('main-header');

  let hasTriggeredNotify = false;

  window.addEventListener('scroll', () => {
    // A. Viewport Scroll Progress Calculation
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const progressPercent = (window.scrollY / totalScroll) * 100;
      if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
      }
    }

    // B. Header scroll-shrink toggle
    if (mainHeader) {
      if (window.scrollY > 20) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    }

    // C. Trigger Automation Demonstration Notification after scroll exceeds 540 pixels
    if (window.scrollY > 540 && !hasTriggeredNotify) {
      hasTriggeredNotify = true;
      setTimeout(() => {
        if (demoToast) {
          demoToast.classList.add('show');
        }
      }, 1200);
    }
  }, { passive: true });

  // Dismiss toast button
  if (closeToastBtn && demoToast) {
    closeToastBtn.addEventListener('click', () => {
      demoToast.classList.remove('show');
    });
  }
}

/**
 * 2. Connected Patient Journey (Timeline Nodes)
 */
function initTimelineInteractivity() {
  const desktopNodes = document.querySelectorAll('.timeline-node-btn');
  const mobileNodes = document.querySelectorAll('.timeline-vertical-node');
  const progressBar = document.getElementById('timeline-progress-bar');

  // Multi-step core progress indicator
  function updateTimelineState(activeStep) {
    // A. Desktop view synchronization
    desktopNodes.forEach((node) => {
      const stepId = parseInt(node.getAttribute('data-step') || '1', 10);
      const tag = node.querySelector('.node-channel-tag');

      node.classList.remove('active-node', 'completed-node');

      if (stepId === activeStep) {
        node.classList.add('active-node');
        if (tag) {
          tag.classList.add('text-primary');
          tag.classList.remove('text-slate-400');
        }
      } else if (stepId < activeStep) {
        node.classList.add('completed-node');
        if (tag) {
          tag.classList.add('text-primary');
          tag.classList.remove('text-slate-400');
        }
      } else {
        if (tag) {
          tag.classList.remove('text-primary');
          tag.classList.add('text-slate-400');
        }
      }
    });

    // Update Desktop progress line
    if (progressBar) {
      const progressPercent = ((activeStep - 1) / 4) * 80;
      progressBar.style.width = `${progressPercent}%`;
    }

    // B. Mobile vertical view synchronization
    mobileNodes.forEach((node) => {
      const stepId = parseInt(node.getAttribute('data-step') || '1', 10);
      const tag = node.querySelector('.tag-v-channel');

      node.classList.remove('active-v-node', 'completed-v-node');

      if (stepId === activeStep) {
        node.classList.add('active-v-node');
        if (tag) {
          tag.classList.add('text-primary');
          tag.classList.remove('text-slate-400');
        }
      } else if (stepId < activeStep) {
        node.classList.add('completed-v-node');
        if (tag) {
          tag.classList.add('text-primary');
          tag.classList.remove('text-slate-400');
        }
      } else {
        if (tag) {
          tag.classList.remove('text-primary');
          tag.classList.add('text-slate-400');
        }
      }
    });
  }

  // Desktop nodes clicks listener
  desktopNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const stepId = parseInt(node.getAttribute('data-step') || '1', 10);
      updateTimelineState(stepId);
    });
  });

  // Mobile nodes clicks listener
  mobileNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const stepId = parseInt(node.getAttribute('data-step') || '1', 10);
      updateTimelineState(stepId);
    });
  });

  // Default to step 2 as active (same as initial React state!)
  updateTimelineState(2);
}

/**
 * 3. High Converting Lead Form Action and Validity Controls
 */
function initFormValidation() {
  const form = document.getElementById('lead-generation-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnIcon = document.getElementById('btn-icon');

  const formContainer = document.getElementById('form-container');
  const successContainer = document.getElementById('success-container');
  const resetBtn = document.getElementById('book-another-btn');

  // Input fields
  const fields = [
    'fullName',
    'businessEmail',
    'orgName',
    'websiteUrl',
    'segment',
    'locations',
    'marketingSpend',
    'biggestChallenge'
  ];

  if (!form) return;

  // Clear errors dynamically on input
  fields.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => {
        clearFieldError(fieldId);
      });
      input.addEventListener('change', () => {
        clearFieldError(fieldId);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const errorsToFocus = [];

    // Validations logic
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/;

    fields.forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (!input) return;

      const val = input.value.trim();

      if (!val) {
        isValid = false;
        showFieldError(fieldId);
        errorsToFocus.push(input);
      } else if (fieldId === 'businessEmail' && !emailPattern.test(val)) {
        isValid = false;
        showFieldError(fieldId, 'Please enter a valid email address');
        errorsToFocus.push(input);
      } else if (fieldId === 'websiteUrl' && !urlPattern.test(val)) {
        isValid = false;
        showFieldError(fieldId, 'Please enter a valid website URL');
        errorsToFocus.push(input);
      } else {
        clearFieldError(fieldId);
      }
    });

    if (!isValid) {
      if (errorsToFocus.length > 0) {
        errorsToFocus[0].focus();
      }
      return;
    }

    // Process Valid Submissions
    setSubmittingState(true);

    const formData = {
      fullName: document.getElementById('fullName').value.trim(),
      businessEmail: document.getElementById('businessEmail').value.trim(),
      orgName: document.getElementById('orgName').value.trim(),
      websiteUrl: document.getElementById('websiteUrl').value.trim(),
      segment: document.getElementById('segment').value,
      locations: document.getElementById('locations').value,
      marketingSpend: document.getElementById('marketingSpend').value,
      biggestChallenge: document.getElementById('biggestChallenge').value.trim()
    };

    // Simulate 1.2s delay for remote persistence scheduler
    setTimeout(() => {
      saveLeadToLocal(formData);
      renderSuccessState(formData);
      setSubmittingState(false);
    }, 1200);
  });

  // Field error visual helpers
  function showFieldError(fieldId, customText) {
    const errorSpan = document.getElementById(`err-${fieldId}`);
    const input = document.getElementById(fieldId);

    if (errorSpan) {
      if (customText) {
        errorSpan.innerText = customText;
      }
      errorSpan.classList.remove('d-none');
    }
    if (input) {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
    }
  }

  function clearFieldError(fieldId) {
    const errorSpan = document.getElementById(`err-${fieldId}`);
    const input = document.getElementById(fieldId);

    if (errorSpan) {
      errorSpan.classList.add('d-none');
    }
    if (input) {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }
  }

  function setSubmittingState(isSubmitting) {
    if (isSubmitting) {
      submitBtn.disabled = true;
      btnText.innerText = 'Scheduling Consultation...';
      btnIcon.setAttribute('data-lucide', 'loader-2');
      btnIcon.classList.add('spinner-loader');
    } else {
      submitBtn.disabled = false;
      btnText.innerText = 'Book My Consultation';
      btnIcon.setAttribute('data-lucide', 'arrow-right');
      btnIcon.classList.remove('spinner-loader');
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function saveLeadToLocal(lead) {
    try {
      const savedLeads = JSON.parse(localStorage.getItem('plumb5_leads') || '[]');
      savedLeads.unshift({
        ...lead,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString()
      });
      localStorage.setItem('plumb5_leads', JSON.stringify(savedLeads));
    } catch (e) {
      console.warn('LocalStorage persistence bypassed:', e);
    }
  }

  function renderSuccessState(lead) {
    // Populate variables inline
    document.getElementById('success-client-name').innerText = lead.fullName;
    document.getElementById('success-org-name').innerText = lead.orgName;
    document.getElementById('success-website-url').innerText = lead.websiteUrl;
    document.getElementById('success-segment').innerText = lead.segment;
    document.getElementById('success-email').innerText = lead.businessEmail;

    // Switch view containers
    if (formContainer) formContainer.classList.add('d-none');
    if (successContainer) successContainer.classList.remove('d-none');

    // Scroll to top of the lead card smoothly
    const leadSection = document.getElementById('lead-form-section');
    if (leadSection) {
      const offsetPos = leadSection.getBoundingClientRect().top + window.scrollY - 85;
      window.scrollTo({ top: offsetPos, behavior: 'smooth' });
    }
  }

  // Restore form handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      fields.forEach((fid) => clearFieldError(fid));

      if (successContainer) successContainer.classList.add('d-none');
      if (formContainer) formContainer.classList.remove('d-none');
    });
  }
}

/**
 * 4. Custom FAQ Accordion Toggler
 */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all other items first (accordion standard layout)
        faqItems.forEach((sibling) => {
          sibling.classList.remove('open');
        });

        // Toggle state of current item
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // Default expand the first item initially
  if (faqItems.length > 0) {
    faqItems[0].classList.add('open');
  }
}

/**
 * 5. Smooth Scroll Offset Anchors helper
 */
window.scrollToSection = function (id) {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 82; // Height of the sticky layout navbar
    const itemPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: itemPosition - headerOffset,
      behavior: 'smooth'
    });
  }
};

/**
 * 6. Scroll Reveal Animations
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .pain-card, .premium-glass-card, .quote-card, .matrix-box, .step-icon-btn, .standard-icon-box');
  const scaleElements = document.querySelectorAll('img:not(.header-logo-img):not(.bg-image-hero):not(.bg-image-cta)');

  revealElements.forEach(el => {
    // Exclude elements that already have animation classes that might conflict
    if (!el.classList.contains('animate-float-slow') && !el.classList.contains('animate-float-delayed')) {
      el.classList.add('reveal-up');
    }
  });

  scaleElements.forEach(el => el.classList.add('reveal-scale'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => observer.observe(el));
}

/**
 * 7. Metrics Count-Up Animation
 */
function initCountUp() {
  const targets = document.querySelectorAll('span, .badge, p, h1, h2, h3, h4, h5, h6');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCountUp(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => {
    // Check if element has no child elements (only text) to avoid destroying HTML inside
    if (el.children.length === 0 && /(\+?)(\b\d+)([%x])/.test(el.innerText)) {
      observer.observe(el);
    }
  });

  function startCountUp(el) {
    const text = el.innerText;
    const match = text.match(/(\+?)(\b\d+)([%x])/);
    if (!match) return;

    const prefix = match[1] || '';
    const end = parseInt(match[2], 10);
    const suffix = match[3];
    const fullMatch = match[0];
    const duration = 1500;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.floor(easeProgress * end);

      el.innerText = text.replace(fullMatch, `${prefix}${currentVal}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.innerText = text;
      }
    };
    window.requestAnimationFrame(step);
  }
}

