/**
 * ConstructCalc Accessible Modal Controller
 * Handles Search, Embed, and E-E-A-T Legal Compliance Modals
 */

export class ModalController {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    // Backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.closeAll();
      }
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeAll();
      }
    });
  }

  open(modalId) {
    this.closeAll();
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    this.activeModal = modal;
    
    // Focus first interactive element or close button
    setTimeout(() => {
      const focusable = modal.querySelector('input, button:not([disabled])');
      if (focusable) focusable.focus();
    }, 50);
  }

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (this.activeModal === modal) {
      this.activeModal = null;
      document.body.classList.remove('overflow-hidden');
    }
  }

  closeAll() {
    document.querySelectorAll('.app-modal').forEach(modal => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });
    this.activeModal = null;
    document.body.classList.remove('overflow-hidden');
  }
}

export const modalManager = new ModalController();
