/**
 * ConstructCalc Calculation History Drawer Component
 * Sliding sidebar showing persisted calculations with individual deletion and full CSV download.
 */
import { getHistory, deleteHistoryItem, clearAllHistory } from '../utils/storage.js';
import { generateCSV, downloadCSV, escapeHTML } from '../utils/formatters.js';
import { getTranslation } from '../data/i18n.js';

export class HistoryDrawer {
  constructor() {
    this.drawerEl = null;
    this.containerEl = null;
    this.isOpen = false;
  }

  init() {
    this.drawerEl = document.getElementById('history-drawer');
    this.containerEl = document.getElementById('history-items-container');
    
    // Close button
    const closeBtn = document.getElementById('close-history-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clear all button
    const clearBtn = document.getElementById('clear-all-history-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all calculation history?')) {
          clearAllHistory();
          this.render();
        }
      });
    }

    // Export all history button
    const exportBtn = document.getElementById('export-all-history-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAllCSV());
    }
  }

  open() {
    if (!this.drawerEl) this.init();
    this.render();
    this.drawerEl.classList.remove('translate-x-full');
    this.drawerEl.classList.remove('rtl:-translate-x-full');
    this.isOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  close() {
    if (!this.drawerEl) return;
    this.drawerEl.classList.add('translate-x-full');
    this.drawerEl.classList.add('rtl:-translate-x-full');
    this.isOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  render() {
    if (!this.containerEl) return;
    const history = getHistory();

    if (!history || history.length === 0) {
      this.containerEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-sm font-medium">${getTranslation('common.noHistory', 'No calculation history recorded yet.')}</p>
        </div>
      `;
      return;
    }

    let html = '';
    history.forEach(item => {
      const date = new Date(item.timestamp).toLocaleString();
      let resultsHtml = '';
      if (item.results) {
        Object.entries(item.results).forEach(([k, v]) => {
          const safeK = escapeHTML(k);
          const safeV = escapeHTML(v);
          resultsHtml += `<div class="flex justify-between text-xs py-0.5"><span class="text-slate-400">${safeK}:</span> <span class="font-semibold text-slate-200">${safeV}</span></div>`;
        });
      }

      const safeTitle = escapeHTML(item.toolTitle || item.toolId || '');
      const safeId = escapeHTML(item.id || '');
      const safeDate = escapeHTML(date);

      html += `
        <div class="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 transition-all hover:border-amber-500/50 relative group">
          <div class="flex items-start justify-between mb-2">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-amber-400">${safeTitle}</span>
              <p class="text-[11px] text-slate-400">${safeDate}</p>
            </div>
            <button class="delete-history-btn text-slate-500 hover:text-red-400 p-1 transition-colors" data-id="${safeId}" title="Delete item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
          <div class="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 space-y-1">
            ${resultsHtml}
          </div>
        </div>
      `;
    });

    this.containerEl.innerHTML = html;

    // Add event listeners to delete buttons
    this.containerEl.querySelectorAll('.delete-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        deleteHistoryItem(id);
        this.render();
      });
    });
  }

  exportAllCSV() {
    const history = getHistory();
    if (!history.length) return;
    
    const rows = [];
    history.forEach(item => {
      rows.push({ item: `--- ${item.toolTitle} (${item.timestamp}) ---`, value: '', note: '' });
      if (item.results) {
        Object.entries(item.results).forEach(([k, v]) => {
          rows.push({ item: k, value: v, note: item.toolTitle });
        });
      }
    });

    const csv = generateCSV('ConstructCalc - Calculation History', rows);
    downloadCSV('ConstructCalc_History.csv', csv);
  }
}

export const historyDrawer = new HistoryDrawer();
