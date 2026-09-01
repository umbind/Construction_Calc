/**
 * Plan & BuildMetric - Main Application Orchestrator
 * Exclusively Supporting All 11 Major Indian Regional Languages + English (India)
 * Pure client-side ES Modules architecture with Zero-Eval Security.
 */

// Import Data & Config
import { translations, languageGroups, getTranslation, getLocalizedText, setLanguage, getLanguage, initLanguage, applyLanguageDirection } from './data/i18n.js';
import { currencies, setCurrency, getCurrency, getCurrencyCode, initCurrency, formatCurrency } from './data/currencies.js';
import { contextualResources } from './data/resources.js';
import { searchIndex } from './data/search-index.js';

// Import Utilities
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores, copyToClipboard, downloadCSV, generateCSV } from './utils/formatters.js';
import { getHistory, saveHistoryItem, getFavorites, toggleFavorite, isFavorite, getTheme, setTheme, toggleTheme, applyTheme } from './utils/storage.js';

// Import Components
import { modalManager } from './components/modal.js';
import { historyDrawer } from './components/drawer.js';
import { embedManager } from './components/embed.js';

// Import All 11 Calculators
import { concreteCalculator } from './calculators/concrete.js';
import { drywallCalculator } from './calculators/drywall.js';
import { flooringCalculator } from './calculators/flooring.js';
import { framingCalculator } from './calculators/framing.js';
import { paintCalculator } from './calculators/paint.js';
import { roofingCalculator } from './calculators/roofing.js';
import { caprateCalculator } from './calculators/caprate.js';
import { brrrrCalculator } from './calculators/brrrr.js';
import { fixflipCalculator } from './calculators/fixflip.js';
import { hardmoneyCalculator } from './calculators/hardmoney.js';
import { hvacCalculator } from './calculators/hvac.js';

export class App {
  constructor() {
    this.calculators = {
      concrete: concreteCalculator,
      drywall: drywallCalculator,
      flooring: flooringCalculator,
      framing: framingCalculator,
      paint: paintCalculator,
      roofing: roofingCalculator,
      caprate: caprateCalculator,
      brrrr: brrrrCalculator,
      fixflip: fixflipCalculator,
      hardmoney: hardmoneyCalculator,
      hvac: hvacCalculator
    };

    this.toolIcons = {
      concrete: '🧱',
      drywall: '📐',
      flooring: '🪨',
      framing: '🏗️',
      paint: '🎨',
      roofing: '🏠',
      caprate: '📈',
      brrrr: '🏦',
      fixflip: '🔄',
      hardmoney: '💰',
      hvac: '❄️'
    };

    this.activeToolId = 'concrete';
    this.activeCategory = 'all';
    this.currentInputs = {};
    this.latestCalculation = null;
  }

  init() {
    // 1. Initialize State
    initLanguage();
    initCurrency();
    applyTheme(getTheme());

    // 2. Bind Core Event Handlers
    this.bindHeaderControls();
    this.bindLanguageControls();
    this.bindSearchModal();
    this.bindCategoryFilters();
    this.bindLegalModals();
    this.bindNewsletter();
    this.bindHashRouting();

    // 3. Initial Render
    this.handleRoute();
    this.updateActiveLanguageDisplay(getLanguage());
    this.updateAllUIText();

    // 4. Initialize Subcomponents
    historyDrawer.init();
    embedManager.init();
  }

  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 dark:bg-slate-900 border border-amber-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-medium toast-animate-in';
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('toast-animate-in');
      toast.classList.add('toast-animate-out');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  bindHeaderControls() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = toggleTheme();
        this.updateThemeIcons(newTheme);
        this.showToast(`Theme switched to ${newTheme} mode`);
      });
      this.updateThemeIcons(getTheme());
    }

    // Currency Select (if present)
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.value = getCurrencyCode();
      currencySelect.addEventListener('change', (e) => {
        setCurrency(e.target.value);
        this.renderActiveCalculator();
        this.showToast(`Currency set to ${e.target.value}`);
      });
    }

    // History Drawer Toggle
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        historyDrawer.toggle();
      });
    }
  }

  updateThemeIcons(theme) {
    const darkIcon = document.getElementById('theme-icon-dark');
    const lightIcon = document.getElementById('theme-icon-light');
    if (theme === 'light') {
      if (darkIcon) darkIcon.classList.add('hidden');
      if (lightIcon) lightIcon.classList.remove('hidden');
    } else {
      if (darkIcon) darkIcon.classList.remove('hidden');
      if (lightIcon) lightIcon.classList.add('hidden');
    }
  }

  bindLanguageControls() {
    const triggerBtn = document.getElementById('lang-trigger-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        this.renderLanguageModal();
        modalManager.open('language-modal');
      });
    }

    // Synchronized Native Select (for automated testing if present)
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
      langSelect.value = getLanguage();
      langSelect.addEventListener('change', (e) => {
        this.applyLanguageSelection(e.target.value);
      });
    }
  }

  renderLanguageModal() {
    const grid = document.getElementById('language-options-grid');
    if (!grid) return;

    const current = getLanguage();
    const languages = languageGroups.indian || [];

    let html = '';
    languages.forEach(lang => {
      const isActive = lang.code === current;
      html += `
        <button data-lang-code="${lang.code}" class="lang-option-card flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
          isActive
            ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10 font-bold scale-[1.02]'
            : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/80 text-slate-200 hover:border-slate-600'
        }">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">${lang.flag || '🇮🇳'}</span>
              <span class="text-sm font-bold text-white">${lang.native}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-medium ml-6">${lang.name}</span>
          </div>
          ${isActive ? '<span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></span>' : ''}
        </button>
      `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.lang-option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-lang-code');
        this.applyLanguageSelection(code);
        modalManager.close('language-modal');
      });
    });
  }

  applyLanguageSelection(langCode) {
    setLanguage(langCode);
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = langCode;

    this.updateActiveLanguageDisplay(langCode);
    this.updateAllUIText();
    this.renderQuickToolSwitcher();
    this.renderCategoryPills();
    this.renderFavoritesBar();
    this.renderToolCardsGrid();
    this.renderActiveCalculator();
    this.updateBreadcrumbs();
    this.renderGuideModal();
    this.renderAuthorityResources();

    const selectedLang = (languageGroups.indian || []).find(l => l.code === langCode);
    const langName = selectedLang ? selectedLang.native : langCode;
    this.showToast(`Language: ${langName}`);
  }

  updateActiveLanguageDisplay(langCode) {
    const label = document.getElementById('active-lang-label');
    const selectedLang = (languageGroups.indian || []).find(l => l.code === langCode);
    if (label && selectedLang) {
      label.textContent = selectedLang.native;
    }
  }

  renderQuickToolSwitcher() {
    const bar = document.getElementById('calculator-tabs-bar');
    if (!bar) return;

    let html = '';
    Object.keys(this.calculators).forEach(id => {
      const isActive = this.activeToolId === id;
      const title = getTranslation(`tools.${id}.shortTitle`, id);
      const icon = this.toolIcons[id] || '⚡';

      html += `
        <a href="/calculators/${id}/" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
          isActive
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold scale-[1.03] ring-1 ring-amber-400'
            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800/90 hover:border-slate-700'
        }">
          <span class="text-xs">${icon}</span>
          <span>${title}</span>
        </a>
      `;
    });

    bar.innerHTML = html;
  }

  bindSearchModal() {
    const searchBtn = document.getElementById('search-trigger-btn');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const searchInput = document.getElementById('search-modal-input');
    const closeSearchBtn = document.getElementById('close-search-btn');

    const openSearch = () => {
      modalManager.open('search-modal');
      if (searchInput) {
        searchInput.value = '';
        this.renderSearchResults('');
        setTimeout(() => searchInput.focus(), 50);
      }
    };

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', () => modalManager.close('search-modal'));

    // Ctrl+K / Cmd+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderSearchResults(e.target.value);
      });
    }
  }

  renderSearchResults(query) {
    const searchResults = document.getElementById('search-modal-results');
    if (!searchResults) return;

    const q = (query || '').trim().toLowerCase();
    let matches = [];

    if (!q) {
      matches = searchIndex;
    } else {
      matches = searchIndex.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(q) || item.shortTitle.toLowerCase().includes(q);
        const kwMatch = item.keywords.some(k => k.toLowerCase().includes(q));
        return titleMatch || kwMatch;
      });
    }

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <p>${getTranslation('searchNoResults', 'No calculators found matching your query.')}</p>
        </div>
      `;
      return;
    }

    let html = '<div class="space-y-2">';
    matches.forEach(item => {
      const typeBadge = item.type ? `<span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">${item.type}</span>` : '';
      const categoryName = getTranslation(`categories.${item.category}`, item.category);
      const title = getTranslation(`tools.${item.id}.title`, item.title);
      const desc = getTranslation(`tools.${item.id}.desc`, item.description || '');
      const icon = this.toolIcons[item.id] || (item.type === 'GUIDE' ? '📘' : item.type === 'STANDARD' ? '📜' : item.type === 'TOPIC' ? '🏛️' : '💡');
      const targetUrl = item.url || `/calculators/${item.id}/`;

      html += `
        <a href="${targetUrl}" class="search-result-item flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 hover:border-amber-500/50 transition-all group cursor-pointer" data-tool="${item.id}">
          <div class="flex items-center gap-3">
            <span class="text-lg p-2 rounded-xl bg-slate-900 border border-slate-800">${icon}</span>
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                ${typeBadge}
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 border border-slate-600">${categoryName}</span>
                <h4 class="font-bold text-slate-100 group-hover:text-amber-400 transition-colors text-xs sm:text-sm">${title}</h4>
              </div>
              <p class="text-xs text-slate-400 line-clamp-1 leading-relaxed">${desc}</p>
            </div>
          </div>
          <svg class="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      `;
    });
    html += '</div>';

    searchResults.innerHTML = html;

    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        modalManager.close('search-modal');
      });
    });
  }

  bindCategoryFilters() {
    const container = document.getElementById('category-filter-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const button = e.target.closest('[data-category]');
      if (!button) return;

      const cat = button.getAttribute('data-category');
      this.activeCategory = cat;
      this.renderCategoryPills();
      this.renderToolCardsGrid();
    });
  }

  renderCategoryPills() {
    const container = document.getElementById('category-filter-container');
    if (!container) return;

    const categories = [
      { id: 'all', label: getTranslation('categories.all', 'All Tools (11)') },
      { id: 'materials', label: getTranslation('categories.materials', '🏗️ Materials (IS 456)') },
      { id: 'renovation', label: getTranslation('categories.renovation', '🏠 Finishes & Ceilings') },
      { id: 'realestate', label: getTranslation('categories.realestate', '💰 Real Estate & Taxes') },
      { id: 'mechanical', label: getTranslation('categories.mechanical', '❄️ MEP & AC Tonnage') }
    ];

    let html = '';
    categories.forEach(cat => {
      const isActive = this.activeCategory === cat.id;
      html += `
        <button data-category="${cat.id}" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
          isActive 
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold scale-[1.02]' 
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
        }">
          ${cat.label}
        </button>
      `;
    });

    container.innerHTML = html;
  }

  renderToolCardsGrid() {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;

    let toolKeys = Object.keys(this.calculators);
    if (this.activeCategory !== 'all') {
      toolKeys = toolKeys.filter(id => this.calculators[id].category === this.activeCategory);
    }

    let html = '';
    toolKeys.forEach(id => {
      const tool = this.calculators[id];
      const title = getTranslation(`tools.${id}.title`, tool.id);
      const shortTitle = getTranslation(`tools.${id}.shortTitle`, tool.id);
      const desc = getTranslation(`tools.${id}.desc`, '');
      const catLabel = getTranslation(`categories.${tool.category}`, tool.category);
      const icon = this.toolIcons[id] || '⚡';
      const isFav = isFavorite(id);
      const isActive = this.activeToolId === id;

      html += `
        <div class="tool-card group bg-slate-900/90 hover:bg-slate-850 border ${
          isActive ? 'border-amber-500/90 shadow-xl shadow-amber-500/10 scale-[1.01]' : 'border-slate-800 hover:border-slate-700'
        } rounded-3xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
          
          ${isActive ? '<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-400"></div>' : ''}

          <div>
            <!-- Card Header: Category & Actions -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5">
                <span class="text-base">${icon}</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700/80">
                  ${catLabel}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button data-tool-id="${id}" class="favorite-toggle-card-btn p-2 rounded-xl text-slate-500 hover:text-amber-400 transition-colors" title="Bookmark Calculator">
                  <svg class="w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </button>
                <button data-tool-id="${id}" class="embed-tool-card-btn p-2 rounded-xl text-slate-500 hover:text-slate-200 transition-colors text-xs font-mono font-bold" title="Embed Widget">
                  &lt;&gt;
                </button>
              </div>
            </div>

            <!-- Card Title & Description -->
            <a href="/calculators/${id}/" class="block group-hover:text-amber-400 transition-colors">
              <h3 class="font-extrabold text-slate-100 text-sm tracking-tight mb-1.5 line-clamp-1">${title}</h3>
              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${desc}</p>
            </a>
          </div>

          <!-- Card Footer Action -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-[11px] font-mono font-semibold text-slate-500">IS 456 / RERA</span>
            <a href="/calculators/${id}/" class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>${getTranslation('ui.openTool', 'Open Tool')}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Attach card event listeners
    grid.querySelectorAll('.favorite-toggle-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toolId = btn.getAttribute('data-tool-id');
        const state = toggleFavorite(toolId);
        this.renderFavoritesBar();
        this.renderToolCardsGrid();
        this.showToast(state ? `Added to favorites` : `Removed from favorites`);
      });
    });

    grid.querySelectorAll('.embed-tool-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toolId = btn.getAttribute('data-tool-id');
        embedManager.openForTool(toolId);
      });
    });
  }

  bindHashRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  handleRoute() {
    // 1. Check path-based route first
    const path = window.location.pathname.toLowerCase();
    const sectionEl = document.getElementById('active-calculator-section');
    const initialTool = sectionEl ? sectionEl.getAttribute('data-initial-tool') : null;

    let matchedTool = null;

    if (initialTool && this.calculators[initialTool]) {
      matchedTool = initialTool;
    } else {
      const match = path.match(/\/calculators\/([a-z0-9_-]+)/);
      if (match && this.calculators[match[1]]) {
        matchedTool = match[1];
      }
    }

    // 2. Fallback to hash-based route for backward compatibility
    if (!matchedTool) {
      const rawHash = window.location.hash.replace('#', '').trim();
      if (rawHash && this.calculators[rawHash]) {
        matchedTool = rawHash;
      }
    }

    this.activeToolId = matchedTool || 'concrete';

    this.renderQuickToolSwitcher();
    this.renderCategoryPills();
    this.renderToolCardsGrid();
    this.renderActiveCalculator();
    this.renderFavoritesBar();
    this.updateBreadcrumbs();
    this.renderGuideModal();
    this.renderAuthorityResources();

    const calcSection = document.getElementById('active-calculator-section');
    if (calcSection && window.location.hash) {
      calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateBreadcrumbs() {
    const breadcrumbContainer = document.getElementById('breadcrumbs-bar');
    if (!breadcrumbContainer) return;

    const tool = this.calculators[this.activeToolId];
    const catName = getTranslation(`categories.${tool.category}`, tool.category);
    const toolTitle = getTranslation(`tools.${this.activeToolId}.shortTitle`, this.activeToolId);

    breadcrumbContainer.innerHTML = `
      <ol class="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <li><a href="#" class="hover:text-amber-400 transition-colors">${getTranslation('ui.home', 'Home')}</a></li>
        <li class="text-slate-600">/</li>
        <li><span class="text-slate-400">${catName}</span></li>
        <li class="text-slate-600">/</li>
        <li class="text-amber-400 font-semibold">${toolTitle}</li>
      </ol>
    `;
  }

  renderActiveCalculator() {
    const container = document.getElementById('active-calculator-container');
    if (!container) return;

    const tool = this.calculators[this.activeToolId];
    const title = getTranslation(`tools.${this.activeToolId}.title`, tool.id);
    const desc = getTranslation(`tools.${this.activeToolId}.desc`, '');
    const isFav = isFavorite(this.activeToolId);

    if (!this.currentInputs[this.activeToolId]) {
      this.currentInputs[this.activeToolId] = Object.assign({}, tool.presets[0].values);
    }

    const inputs = this.currentInputs[this.activeToolId];
    this.latestCalculation = tool.calculate(inputs);

    // Render presets buttons with localization
    let presetsHtml = '';
    tool.presets.forEach((preset, idx) => {
      const presetLabel = getLocalizedText(preset.label) || preset.label;
      presetsHtml += `
        <button type="button" data-preset-idx="${idx}" class="preset-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-400 border border-slate-700/80 transition-all whitespace-nowrap cursor-pointer shadow-sm hover:border-slate-600">
          ${presetLabel}
        </button>
      `;
    });

    // Render Primary Metrics Cards with localization
    let metricsHtml = '';
    this.latestCalculation.primaryMetrics.forEach(metric => {
      const metricLabel = getLocalizedText(metric.label);
      const metricValue = getLocalizedText(metric.value);
      const metricSubtext = getLocalizedText(metric.subtext);
      metricsHtml += `
        <div class="metric-card bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-xs font-semibold text-slate-400 line-clamp-1">${metricLabel}</span>
            <button class="copy-metric-btn text-slate-600 hover:text-amber-400 transition-colors p-1 rounded" data-value="${metricValue}" title="Copy value">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl sm:text-2xl font-mono font-black text-amber-400 tracking-tight">${metricValue}</span>
          </div>
          ${metricSubtext ? `<p class="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">${metricSubtext}</p>` : ''}
        </div>
      `;
    });

    // Render Breakdown Rows with localization
    let breakdownRowsHtml = '';
    (this.latestCalculation.breakdown || []).forEach(row => {
      const paramLabel = getLocalizedText(row.item || row.parameter || '');
      const valLabel = getLocalizedText(row.value || '');
      const notesLabel = getLocalizedText(row.note || row.notes || '');
      breakdownRowsHtml += `
        <tr class="border-b border-slate-800/60 text-xs hover:bg-slate-800/30 transition-colors">
          <td class="py-2.5 px-3 font-medium text-slate-300">${paramLabel}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-amber-400">${valLabel}</td>
          <td class="py-2.5 px-3 text-slate-400 leading-relaxed">${notesLabel}</td>
        </tr>
      `;
    });

    // Render Material Takeoff Order List with localization & correct cost mapping
    let materialRowsHtml = '';
    (this.latestCalculation.materialList || []).forEach(item => {
      const specName = getLocalizedText(item.material || item.name || '');
      const unitName = getLocalizedText(item.unit || '');
      const costVal = item.estCost || item.cost || item.totalCost || '—';
      materialRowsHtml += `
        <tr class="border-b border-slate-800/60 text-xs hover:bg-slate-800/30 transition-colors">
          <td class="py-2.5 px-3 font-semibold text-slate-200">${specName}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-amber-400">${item.quantity} ${unitName}</td>
          <td class="py-2.5 px-3 font-mono text-slate-300 font-semibold">${costVal}</td>
        </tr>
      `;
    });

    // Render Inputs HTML
    const inputControlsHtml = this.renderInputControls(tool.id, inputs);

    // Build the Entire Active Calculator View
    container.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        
        <!-- Calculator Header: Title, Category Badge, Bookmark & Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-5">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                ${getTranslation(`categories.${tool.category}`, tool.category)}
              </span>
              <span class="text-xs text-slate-400 font-semibold">IS 456 / RERA Grounded</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">${title}</h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">${desc}</p>
          </div>

          <!-- Utility Action Buttons for this Calculator -->
          <div class="flex items-center gap-2 self-start sm:self-center">
            <button id="favorite-toggle-btn" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer" title="Pin / Bookmark">
              <svg class="w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              <span id="fav-btn-label" class="hidden sm:inline">${isFav ? 'Pinned' : 'Pin'}</span>
            </button>

            <button id="copy-summary-btn" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer" title="Copy calculation summary">
              <svg id="copy-summary-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              <span id="copy-summary-label">${getTranslation('ui.copySummary', 'Copy')}</span>
            </button>

            <button id="export-csv-btn" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer" title="Export Takeoff to CSV">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>${getTranslation('ui.exportCsv', 'CSV')}</span>
            </button>

            <button id="embed-calculator-btn" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors text-xs font-mono font-bold cursor-pointer" title="Embed Widget">
              &lt;&gt;
            </button>
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="mb-5 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">${getTranslation('ui.presetsLabel', 'Presets:')}</span>
          <div class="flex items-center gap-1.5 flex-nowrap">
            ${presetsHtml}
          </div>
        </div>

        <!-- Main Form & Results Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column: Inputs Form -->
          <div class="lg:col-span-6 space-y-4">
            <form id="calculator-form" onsubmit="return false;">
              ${inputControlsHtml}

              <div class="flex items-center gap-2.5 pt-4 border-t border-slate-800/80 mt-4">
                <button id="save-history-btn" type="button" class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95">
                  <svg id="save-history-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                  <span id="save-history-label">${getTranslation('ui.saveCalc', 'Save Calculation')}</span>
                </button>
                <button id="reset-inputs-btn" type="button" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-3 rounded-xl border border-slate-700 text-xs transition-all cursor-pointer">
                  ${getTranslation('ui.resetInputs', 'Reset')}
                </button>
              </div>
            </form>
          </div>

          <!-- Right Column: Results & Breakdown -->
          <div class="lg:col-span-6 space-y-4">
            <!-- Results Header -->
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>${getTranslation('ui.calcOutput', 'Calculation Output')}</span>
                <span class="live-indicator inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              </h3>
            </div>

            <!-- Primary Metrics Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${metricsHtml}
            </div>

            <!-- Material Order Takeoff Table -->
            <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 overflow-hidden">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">${getTranslation('ui.materialOrderTitle', 'Material Purchase Order')}</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                      <th class="py-2 px-3">${getTranslation('ui.materialHeader', 'Material Spec')}</th>
                      <th class="py-2 px-3">${getTranslation('ui.qtyHeader', 'Quantity Needed')}</th>
                      <th class="py-2 px-3">${getTranslation('ui.costHeader', 'Est. Cost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${materialRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Collapsible Detailed Technical Breakdown Accordion -->
            <details class="group bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden">
              <summary class="p-3 text-xs font-semibold text-slate-400 cursor-pointer flex items-center justify-between hover:text-amber-400 transition-colors select-none">
                <span>${getTranslation('ui.breakdownTitle', '🔍 Detailed Engineering Breakdown & Steps')}</span>
                <svg class="w-4 h-4 transition-transform group-open:rotate-180 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div class="p-3.5 pt-1 overflow-x-auto border-t border-slate-800/60">
                <table class="w-full text-left">
                  <thead>
                    <tr class="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                      <th class="py-2 px-3">${getTranslation('ui.paramHeader', 'Parameter')}</th>
                      <th class="py-2 px-3">${getTranslation('ui.valueHeader', 'Value')}</th>
                      <th class="py-2 px-3">${getTranslation('ui.notesHeader', 'Notes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${breakdownRowsHtml}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      </div>
    `;

    this.bindCalculatorEvents(container, tool);
  }

  renderInputControls(toolId, inputs) {
    const t = (str) => getLocalizedText(str);

    switch (toolId) {
      case 'concrete':
        return `
          <div class="space-y-4">
            <div class="flex gap-3 p-1 bg-slate-800 rounded-2xl border border-slate-700/80">
              <label class="flex-1 text-center py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${inputs.shape !== 'cylinder' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white'}">
                <input type="radio" name="shape" value="slab" ${inputs.shape !== 'cylinder' ? 'checked' : ''} class="hidden calc-input"> ${t('Slab / Beam / Footing')}
              </label>
              <label class="flex-1 text-center py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${inputs.shape === 'cylinder' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white'}">
                <input type="radio" name="shape" value="cylinder" ${inputs.shape === 'cylinder' ? 'checked' : ''} class="hidden calc-input"> ${t('Round RCC Column / Pile')}
              </label>
            </div>

            ${inputs.shape === 'cylinder' ? `
              <div class="grid grid-cols-2 gap-4">
                ${this.renderSliderControl('diameter', t('Column Diameter (Feet)'), inputs.diameter || 1.5, 0.5, 10, 0.25, t('ft'))}
                ${this.renderSliderControl('depth', t('Height / Depth (Feet)'), inputs.depth || 10, 1, 50, 0.5, t('ft'))}
              </div>
              ${this.renderSliderControl('quantity', t('Number of Columns'), inputs.quantity || 6, 1, 100, 1, t('nos'))}
            ` : `
              <div class="grid grid-cols-2 gap-4">
                ${this.renderSliderControl('length', t('Length (Feet)'), inputs.length || 40, 1, 200, 1, t('ft'))}
                ${this.renderSliderControl('width', t('Width (Feet)'), inputs.width || 25, 1, 200, 1, t('ft'))}
              </div>
              <div class="grid grid-cols-2 gap-4">
                ${this.renderSliderControl('thickness', t('Slab Thickness (Inches)'), inputs.thickness || 5, 2, 24, 0.5, t('in'))}
                ${this.renderSliderControl('quantity', t('Quantity (Nos)'), inputs.quantity || 1, 1, 50, 1, t('nos'))}
              </div>
            `}

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${t('IS 456:2000 Concrete Mix Grade')}</label>
              <select name="mixGrade" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                <option value="M20" ${inputs.mixGrade === 'M20' || !inputs.mixGrade ? 'selected' : ''}>${t('M20 (1 : 1.5 : 3) — Standard RCC Slab, Beams & Columns')}</option>
                <option value="M25" ${inputs.mixGrade === 'M25' ? 'selected' : ''}>${t('M25 (1 : 1 : 2) — Heavy Load RCC Foundations & Pillars')}</option>
                <option value="M15" ${inputs.mixGrade === 'M15' ? 'selected' : ''}>${t('M15 (1 : 2 : 4) — Flooring Bed, Pathways & Plinth Base')}</option>
                <option value="M7.5" ${inputs.mixGrade === 'M7.5' ? 'selected' : ''}>${t('M7.5 (1 : 4 : 8) — Plain Cement Concrete (PCC) Sub-base')}</option>
              </select>
            </div>

            ${this.renderSliderControl('waste', t('Waste Allowance (%)'), inputs.waste || 5, 0, 20, 1, '%')}

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Cement (₹/50kg)')}</label>
                <input type="number" name="priceCement" value="${inputs.priceCement || 380}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('M-Sand (₹/Brass)')}</label>
                <input type="number" name="priceSand" value="${inputs.priceSand || 4500}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Gitti (₹/Brass)')}</label>
                <input type="number" name="priceAggregate" value="${inputs.priceAggregate || 3800}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>
          </div>
        `;

      case 'drywall':
        return `
          <div class="space-y-4">
            <div class="flex gap-3 p-1 bg-slate-800 rounded-2xl border border-slate-700/80">
              <label class="flex-1 text-center py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${inputs.mode !== 'plaster' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white'}">
                <input type="radio" name="mode" value="ceiling" ${inputs.mode !== 'plaster' ? 'checked' : ''} class="hidden calc-input"> ${t('Gyproc 6x4 ft Gypsum Boards')}
              </label>
              <label class="flex-1 text-center py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${inputs.mode === 'plaster' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:text-white'}">
                <input type="radio" name="mode" value="plaster" ${inputs.mode === 'plaster' ? 'checked' : ''} class="hidden calc-input"> ${t('50kg Cement (Plaster)')}
              </label>
            </div>

            ${inputs.mode === 'plaster' ? `
              ${this.renderSliderControl('length', t('Length (Feet)'), inputs.length || 40, 4, 150, 1, t('ft'))}
              ${this.renderSliderControl('width', t('Height / Depth (Feet)'), inputs.width || 20, 4, 50, 1, t('ft'))}
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Plaster Volume')}</label>
                  <select name="plasterThickness" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                    <option value="12" ${inputs.plasterThickness == 12 || !inputs.plasterThickness ? 'selected' : ''}>12mm (Internal Single Coat)</option>
                    <option value="20" ${inputs.plasterThickness == 20 ? 'selected' : ''}>20mm (External Double Coat)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Mortar Mix</label>
                  <select name="mixRatio" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                    <option value="1:4" ${inputs.mixRatio === '1:4' || !inputs.mixRatio ? 'selected' : ''}>1:4 (Standard Rich Plaster)</option>
                    <option value="1:6" ${inputs.mixRatio === '1:6' ? 'selected' : ''}>1:6 (Internal Lean Plaster)</option>
                  </select>
                </div>
              </div>
            ` : `
              ${this.renderSliderControl('length', t('Length (Feet)'), inputs.length || 20, 4, 100, 1, t('ft'))}
              ${this.renderSliderControl('width', t('Width (Feet)'), inputs.width || 15, 4, 100, 1, t('ft'))}
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Gyproc 6x4 ft Gypsum Boards')} (₹)</label>
                  <input type="number" name="priceSheet" value="${inputs.priceSheet || 340}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Jointing Compound (25kg)')} (₹)</label>
                  <input type="number" name="priceCompoundBag" value="${inputs.priceCompoundBag || 420}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
              </div>
            `}

            ${this.renderSliderControl('waste', t('Waste Allowance (%)'), inputs.waste || 10, 5, 25, 1, '%')}
          </div>
        `;

      case 'flooring':
        return `
          <div class="space-y-4">
            ${this.renderSliderControl('length', t('Length (Feet)'), inputs.length || 30, 2, 150, 1, t('ft'))}
            ${this.renderSliderControl('width', t('Width (Feet)'), inputs.width || 25, 2, 150, 1, t('ft'))}
            
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${t('Vitrified Floor Tiles (Boxes)')}</label>
              <select name="tileFormat" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                <option value="600x1200" ${inputs.tileFormat === '600x1200' || !inputs.tileFormat ? 'selected' : ''}>600 x 1200 mm (2x4 ft GVT Slab - 2 pcs/box)</option>
                <option value="600x600" ${inputs.tileFormat === '600x600' ? 'selected' : ''}>600 x 600 mm (2x2 ft Vitrified - 4 pcs/box)</option>
                <option value="1200x1200" ${inputs.tileFormat === '1200x1200' ? 'selected' : ''}>1200 x 1200 mm (4x4 ft Large Format - 2 pcs/box)</option>
                <option value="300x450" ${inputs.tileFormat === '300x450' ? 'selected' : ''}>300 x 450 mm (1x1.5 ft Wall Dado - 6 pcs/box)</option>
                <option value="300x300" ${inputs.tileFormat === '300x300' ? 'selected' : ''}>300 x 300 mm (1x1 ft Anti-Skid - 9 pcs/box)</option>
              </select>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span class="text-xs font-bold text-slate-300">${t('4" Skirting Tiles')}</span>
              <input type="checkbox" name="includeSkirting" ${inputs.includeSkirting !== false && inputs.includeSkirting !== 'false' ? 'checked' : ''} class="calc-input w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer">
            </div>

            ${this.renderSliderControl('waste', t('Waste Allowance (%)'), inputs.waste || 8, 5, 20, 1, '%')}

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Tile (₹/sq.ft)</label>
                <input type="number" name="priceSqFt" value="${inputs.priceSqFt || 65}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Adhesive (₹/20kg)</label>
                <input type="number" name="priceAdhesiveBag" value="${inputs.priceAdhesiveBag || 380}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Grout (₹/kg)</label>
                <input type="number" name="priceGroutKg" value="${inputs.priceGroutKg || 80}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>
          </div>
        `;

      case 'framing':
        return `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Masonry / Structural</label>
              <select name="wallType" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                <option value="brick_9" ${inputs.wallType === 'brick_9' || !inputs.wallType ? 'selected' : ''}>9" External Red Brick Wall (1:6 Mortar)</option>
                <option value="brick_4" ${inputs.wallType === 'brick_4' ? 'selected' : ''}>4.5" Internal Brick Partition (1:4 Mortar)</option>
                <option value="aac_150" ${inputs.wallType === 'aac_150' ? 'selected' : ''}>AAC Lightweight Blocks (600x200x150mm)</option>
                <option value="rcc_steel" ${inputs.wallType === 'rcc_steel' ? 'selected' : ''}>RCC Slab Fe 500D TMT Steel Reinforcement</option>
              </select>
            </div>

            ${inputs.wallType === 'rcc_steel' ? `
              ${this.renderSliderControl('slabAreaSqFt', t('RCC Roof Concrete'), inputs.slabAreaSqFt || 1000, 100, 10000, 50, t('sq.ft'))}
              ${this.renderSliderControl('slabThicknessInches', t('Slab Thickness (Inches)'), inputs.slabThicknessInches || 5, 4, 12, 0.5, t('in'))}
              ${this.renderSliderControl('steelRatioKgCuM', t('Fe 500D Steel Weight'), inputs.steelRatioKgCuM || 80, 60, 160, 5, 'kg/m³')}
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Fe 500D TMT Rebar (kg)')} (₹/kg)</label>
                <input type="number" name="priceSteelKg" value="${inputs.priceSteelKg || 68}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            ` : `
              ${this.renderSliderControl('wallLength', t('Length (Feet)'), inputs.wallLength || 100, 10, 500, 5, t('ft'))}
              ${this.renderSliderControl('wallHeight', t('Height / Depth (Feet)'), inputs.wallHeight || 10, 7, 20, 0.5, t('ft'))}
              ${this.renderSliderControl('openingsArea', 'Door / Window Deduction (Sq.Ft)', inputs.openingsArea || 80, 0, 500, 5, t('sq.ft'))}
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Red Clay Modular Bricks')} (₹/pc)</label>
                  <input type="number" name="priceUnit" value="${inputs.priceUnit || (inputs.wallType === 'aac_150' ? 65 : 9)}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('50kg Cement (Masonry Mortar)')} (₹/bag)</label>
                  <input type="number" name="priceCementBag" value="${inputs.priceCementBag || 380}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
              </div>
            `}

            ${this.renderSliderControl('waste', t('Waste Allowance (%)'), inputs.waste || 5, 0, 15, 1, '%')}
          </div>
        `;

      case 'paint':
        return `
          <div class="space-y-4">
            ${this.renderSliderControl('wallAreaSqFt', t('Total Paint Volume'), inputs.wallAreaSqFt || 2200, 100, 10000, 50, t('sq.ft'))}
            ${this.renderSliderControl('ceilingAreaSqFt', t('Gyproc 6x4 Sheets'), inputs.ceilingAreaSqFt || 600, 0, 5000, 50, t('sq.ft'))}

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Coats</label>
                <select name="coats" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                  <option value="2" ${inputs.coats == 2 || !inputs.coats ? 'selected' : ''}>2 Coats (Standard Fresh Painting)</option>
                  <option value="1" ${inputs.coats == 1 ? 'selected' : ''}>1 Coat (Maintenance Repaint)</option>
                  <option value="3" ${inputs.coats == 3 ? 'selected' : ''}>3 Coats (Dark to Light Shade Shift)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Premium Interior Emulsion Paint')} (₹/L)</label>
                <input type="number" name="pricePaintLitre" value="${inputs.pricePaintLitre || 380}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span class="text-xs font-bold text-slate-300">${t('40kg Wall Putty Bags')}</span>
                <input type="checkbox" name="includePutty" ${inputs.includePutty === true || inputs.includePutty === 'true' ? 'checked' : ''} class="calc-input w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer">
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span class="text-xs font-bold text-slate-300">${t('Acrylic Wall Primer')}</span>
                <input type="checkbox" name="includePrimer" ${inputs.includePrimer === true || inputs.includePrimer === 'true' ? 'checked' : ''} class="calc-input w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('40kg Putty Bags')} (₹)</label>
                <input type="number" name="pricePuttyBag40kg" value="${inputs.pricePuttyBag40kg || 780}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Acrylic Primer')} (₹)</label>
                <input type="number" name="pricePrimerLitre" value="${inputs.pricePrimerLitre || 160}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>
          </div>
        `;

      case 'roofing':
        return `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Roofing System Mode</label>
              <select name="mode" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                <option value="rcc_slab" ${inputs.mode === 'rcc_slab' || !inputs.mode ? 'selected' : ''}>RCC Roof Slab Casting (IS 456 M20 Concrete + TMT Steel)</option>
                <option value="waterproofing" ${inputs.mode === 'waterproofing' ? 'selected' : ''}>Terrace Waterproofing (Dr. Fixit / Liquid Membrane)</option>
                <option value="profile_sheets" ${inputs.mode === 'profile_sheets' ? 'selected' : ''}>Industrial Profile Sheets (JSW Colouron+ / Tata Shaktee)</option>
              </select>
            </div>

            ${inputs.mode === 'waterproofing' ? `
              ${this.renderSliderControl('terraceAreaSqFt', t('Waterproofing Chemical'), inputs.terraceAreaSqFt || 1200, 200, 10000, 50, t('sq.ft'))}
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Dr. Fixit Fastflex Liquid Membrane')} (₹/L)</label>
                <input type="number" name="priceWaterproofLitre" value="${inputs.priceWaterproofLitre || 320}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            ` : inputs.mode === 'profile_sheets' ? `
              ${this.renderSliderControl('shedAreaSqFt', t('JSW Profile Sheets'), inputs.shedAreaSqFt || 2400, 200, 20000, 100, t('sq.ft'))}
              ${this.renderSliderControl('sheetLengthFt', t('Length (Feet)'), inputs.sheetLengthFt || 12, 8, 24, 1, t('ft'))}
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('JSW Profile Sheets (Colouron+)')} (₹/sq.ft)</label>
                  <input type="number" name="priceSheetSqFt" value="${inputs.priceSheetSqFt || 52}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Self-Drilling Metal Screws')} (₹/pc)</label>
                  <input type="number" name="priceSelfDrillingScrew" value="${inputs.priceSelfDrillingScrew || 3.5}" step="0.5" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
              </div>
            ` : `
              ${this.renderSliderControl('slabAreaSqFt', t('RCC Roof Concrete'), inputs.slabAreaSqFt || 1200, 200, 10000, 50, t('sq.ft'))}
              ${this.renderSliderControl('slabThicknessInches', t('Slab Thickness (Inches)'), inputs.slabThicknessInches || 5, 4, 10, 0.5, t('in'))}
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('50kg Cement (Roof Slab)')} (₹/bag)</label>
                  <input type="number" name="priceCementBag" value="${inputs.priceCementBag || 380}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">${t('Fe 500D TMT Rebar (kg)')} (₹/kg)</label>
                  <input type="number" name="priceSteelKg" value="${inputs.priceSteelKg || 68}" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
                </div>
              </div>
            `}

            ${this.renderSliderControl('waste', t('Waste Allowance (%)'), inputs.waste || 5, 0, 15, 1, '%')}
          </div>
        `;

      case 'caprate':
        return `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">${t('Purchase')} / Market Price (₹)</label>
              <input type="number" name="purchasePrice" value="${inputs.purchasePrice || 12500000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black text-amber-400 focus-ring">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Rent')} (₹/mo)</label>
                <input type="number" name="monthlyRent" value="${inputs.monthlyRent || 42000}" step="1000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Maintenance (₹/mo)</label>
                <input type="number" name="societyMaintenanceMonthly" value="${inputs.societyMaintenanceMonthly || 5000}" step="500" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Tax (₹/yr)</label>
                <input type="number" name="municipalTaxAnnual" value="${inputs.municipalTaxAnnual || 18000}" step="1000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Insurance (₹/yr)</label>
                <input type="number" name="insuranceAnnual" value="${inputs.insuranceAnnual || 8000}" step="500" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus-ring">
              </div>
            </div>

            ${this.renderSliderControl('vacancyRate', 'Vacancy (%)', inputs.vacancyRate || 4, 0, 15, 0.5, '%')}
            ${this.renderSliderControl('repairRate', 'Reserve (%)', inputs.repairRate || 4, 0, 15, 0.5, '%')}
          </div>
        `;

      case 'brrrr':
        return `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Property Value (₹)</label>
                <input type="number" name="propertyValue" value="${inputs.propertyValue || 7500000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black focus-ring">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Borrowing')} (₹)</label>
                <input type="number" name="loanAmount" value="${inputs.loanAmount || 6000000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black text-amber-400 focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Total Loan Interest')} (%)</label>
                <input type="number" name="interestRate" value="${inputs.interestRate || 8.5}" step="0.1" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold text-amber-400 focus-ring">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Years')}</label>
                <input type="number" name="tenureYears" value="${inputs.tenureYears || 20}" step="1" min="5" max="30" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Rent')} (₹/mo)</label>
                <input type="number" name="monthlyRent" value="${inputs.monthlyRent || 32000}" step="1000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Total Tax Deduction')} (%)</label>
                <select name="taxBracket" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-semibold focus-ring">
                  <option value="30" ${inputs.taxBracket == 30 || !inputs.taxBracket ? 'selected' : ''}>30% Slab (Sec 24b / 80C Tax Benefit)</option>
                  <option value="20" ${inputs.taxBracket == 20 ? 'selected' : ''}>20% Slab</option>
                  <option value="10" ${inputs.taxBracket == 10 ? 'selected' : ''}>10% Slab</option>
                </select>
              </div>
            </div>
          </div>
        `;

      case 'fixflip':
        return `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Purchase')} (₹)</label>
                <input type="number" name="purchasePrice" value="${inputs.purchasePrice || 6000000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black focus-ring">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Exit Price (₹)</label>
                <input type="number" name="resalePrice" value="${inputs.resalePrice || 8200000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black text-amber-400 focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Renovation (₹)</label>
                <input type="number" name="renovationCost" value="${inputs.renovationCost || 800000}" step="50000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Months')}</label>
                <input type="number" name="holdingMonths" value="${inputs.holdingMonths || 14}" step="1" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus-ring">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Stamp Duty (%)</label>
                <input type="number" name="stampDutyRate" value="${inputs.stampDutyRate || 6.0}" step="0.5" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Brokerage (%)</label>
                <input type="number" name="brokerageRate" value="${inputs.brokerageRate || 1.5}" step="0.25" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus-ring">
              </div>
            </div>
          </div>
        `;

      case 'hardmoney':
        return `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">${t('Credit')} Facility (₹)</label>
              <input type="number" name="totalLoan" value="${inputs.totalLoan || 4500000}" step="100000" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-black text-amber-400 focus-ring">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Total Draw Interest')} (%)</label>
                <input type="number" name="interestRate" value="${inputs.interestRate || 12.5}" step="0.25" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">${t('Months')}</label>
                <input type="number" name="tenureMonths" value="${inputs.tenureMonths || 14}" step="1" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus-ring">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">${t('Processing Fee')} (%)</label>
              <input type="number" name="processingFeeRate" value="${inputs.processingFeeRate || 1.0}" step="0.25" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus-ring">
            </div>
          </div>
        `;

      case 'hvac':
        return `
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              ${this.renderSliderControl('roomLength', t('Length (Feet)'), inputs.roomLength || 15, 8, 40, 1, t('ft'))}
              ${this.renderSliderControl('roomWidth', t('Width (Feet)'), inputs.roomWidth || 10, 8, 40, 1, t('ft'))}
            </div>

            ${this.renderSliderControl('ceilingHeight', t('Height / Depth (Feet)'), inputs.ceilingHeight || 10, 8, 16, 0.5, t('ft'))}

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Indian Climate Zone (NBC 2016)</label>
              <select name="climateZone" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold focus-ring">
                <option value="warm_humid" ${inputs.climateZone === 'warm_humid' || !inputs.climateZone ? 'selected' : ''}>Warm & Humid (Mumbai, Chennai, Kolkata, Kochi)</option>
                <option value="hot_dry" ${inputs.climateZone === 'hot_dry' ? 'selected' : ''}>Hot & Dry (Delhi-NCR, Rajasthan, Ahmedabad)</option>
                <option value="composite" ${inputs.climateZone === 'composite' ? 'selected' : ''}>Composite (UP, Bihar, Punjab, MP)</option>
                <option value="temperate" ${inputs.climateZone === 'temperate' ? 'selected' : ''}>Temperate (Bengaluru, Pune, Hyderabad)</option>
                <option value="cold" ${inputs.climateZone === 'cold' ? 'selected' : ''}>Cold (Shimla, Dehradun, Srinagar)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span class="text-xs font-bold text-slate-300">Top Floor</span>
                <input type="checkbox" name="isTopFloor" ${inputs.isTopFloor === true || inputs.isTopFloor === 'true' ? 'checked' : ''} class="calc-input w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer">
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span class="text-xs font-bold text-slate-300">Glass Window</span>
                <input type="checkbox" name="hasGlassWindow" ${inputs.hasGlassWindow === true || inputs.hasGlassWindow === 'true' ? 'checked' : ''} class="calc-input w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Hours/Day</label>
                <input type="number" name="dailyUsageHours" value="${inputs.dailyUsageHours || 8}" step="1" min="1" max="24" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1">Tariff (₹/Unit)</label>
                <input type="number" name="electricityTariff" value="${inputs.electricityTariff || 8.0}" step="0.5" class="calc-input w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold focus-ring">
              </div>
            </div>
          </div>
        `;

      default:
        return '<p class="text-slate-400 text-sm">Select a calculator above.</p>';
    }
  }

  renderSliderControl(name, label, value, min, max, step, unit) {
    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-slate-300">${label}</label>
          <div class="flex items-center gap-1">
            <input type="number" name="${name}" value="${value}" min="${min}" max="${max}" step="${step}" class="calc-input sync-number-input w-24 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-right text-xs font-mono font-bold text-amber-400 focus-ring">
            <span class="text-xs text-slate-400 font-semibold">${unit}</span>
          </div>
        </div>
        <input type="range" name="${name}" value="${value}" min="${min}" max="${max}" step="${step}" class="calc-input sync-slider-input w-full">
      </div>
    `;
  }

  bindCalculatorEvents(container, tool) {
    // 2-Way Sync between Sliders and Number Inputs
    container.querySelectorAll('.sync-slider-input').forEach(slider => {
      const name = slider.getAttribute('name');
      const numInput = container.querySelector(`.sync-number-input[name="${name}"]`);
      
      slider.addEventListener('input', (e) => {
        if (numInput) numInput.value = e.target.value;
        this.updateCalculation(tool);
      });

      if (numInput) {
        numInput.addEventListener('input', (e) => {
          slider.value = e.target.value;
          this.updateCalculation(tool);
        });
      }
    });

    // General calc inputs
    container.querySelectorAll('.calc-input').forEach(input => {
      input.addEventListener('change', () => this.updateCalculation(tool));
    });

    // Presets Buttons
    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-preset-idx'));
        const preset = tool.presets[idx];
        if (preset) {
          this.currentInputs[this.activeToolId] = Object.assign({}, preset.values);
          this.renderActiveCalculator();
          const presetLabel = getLocalizedText(preset.label) || preset.label;
          this.showToast(`Applied preset: ${presetLabel}`);
        }
      });
    });

    // Save to History Button with visual micro-feedback
    const saveHistBtn = container.querySelector('#save-history-btn');
    if (saveHistBtn) {
      saveHistBtn.addEventListener('click', () => {
        const summaryObj = {};
        this.latestCalculation.primaryMetrics.forEach(m => {
          summaryObj[m.label] = `${m.value} ${m.unit || ''}`.trim();
        });

        saveHistoryItem({
          toolId: this.activeToolId,
          toolTitle: getTranslation(`tools.${this.activeToolId}.title`, this.activeToolId),
          category: tool.category,
          inputs: Object.assign({}, this.currentInputs[this.activeToolId]),
          resultsSummary: summaryObj
        });

        // Tactile button micro-feedback
        const labelEl = container.querySelector('#save-history-label');
        if (labelEl) {
          const orig = labelEl.textContent;
          labelEl.textContent = '✓ Saved!';
          setTimeout(() => { labelEl.textContent = orig; }, 1500);
        }

        this.showToast(getTranslation('ui.toastSaved', 'Calculation saved to history drawer'));
      });
    }

    // Reset Inputs Button
    const resetBtn = container.querySelector('#reset-inputs-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.currentInputs[this.activeToolId] = Object.assign({}, tool.presets[0].values);
        this.renderActiveCalculator();
        this.showToast(getTranslation('ui.toastReset', 'Inputs reset to default values'));
      });
    }

    // Export CSV Button
    const exportCsvBtn = container.querySelector('#export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const title = `${getTranslation(`tools.${this.activeToolId}.title`, this.activeToolId)} - Material Takeoff`;
        const rows = (this.latestCalculation.materialList || []).map(item => [
          item.material || item.name,
          `${item.quantity} ${item.unit}`,
          item.estCost || item.cost || item.totalCost || ''
        ]);
        const csvContent = generateCSV(title, [['Material Spec', 'Quantity Needed', 'Est. Cost'], ...rows]);
        downloadCSV(csvContent, `${this.activeToolId}-takeoff.csv`);
        this.showToast('Material Takeoff CSV exported');
      });
    }

    // Copy Summary Button with visual micro-feedback
    const copySummaryBtn = container.querySelector('#copy-summary-btn');
    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', async () => {
        let text = `Plan & BuildMetric - ${getTranslation(`tools.${this.activeToolId}.title`, this.activeToolId)}\n`;
        this.latestCalculation.primaryMetrics.forEach(m => {
          text += `• ${getLocalizedText(m.label)}: ${getLocalizedText(m.value)}\n`;
        });
        text += `\nCalculated at: https://planandbuildmetric.netlify.app/calculators/${this.activeToolId}/`;
        const success = await copyToClipboard(text);

        const labelEl = container.querySelector('#copy-summary-label');
        if (labelEl && success) {
          const orig = labelEl.textContent;
          labelEl.textContent = '✓ Copied';
          setTimeout(() => { labelEl.textContent = orig; }, 1500);
        }

        this.showToast(success ? getTranslation('ui.toastCopied', 'Summary copied to clipboard!') : 'Failed to copy summary');
      });
    }

    // Copy Individual Metric Buttons
    container.querySelectorAll('.copy-metric-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const val = btn.getAttribute('data-value');
        const success = await copyToClipboard(val);
        this.showToast(success ? `Copied: ${val}` : 'Failed to copy');
      });
    });

    // Favorite Toggle Button
    const favBtn = container.querySelector('#favorite-toggle-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        const state = toggleFavorite(this.activeToolId);
        this.renderFavoritesBar();
        this.renderToolCardsGrid();
        this.renderActiveCalculator();
        this.showToast(state ? 'Pinned to top favorites' : 'Removed from favorites');
      });
    }

    // Embed Calculator Button
    const embedBtn = container.querySelector('#embed-calculator-btn');
    if (embedBtn) {
      embedBtn.addEventListener('click', () => {
        embedManager.openForTool(this.activeToolId);
      });
    }
  }

  updateCalculation(tool) {
    const form = document.getElementById('calculator-form');
    if (!form) return;

    const formData = new FormData(form);
    const updatedInputs = {};

    formData.forEach((val, key) => {
      updatedInputs[key] = isNaN(Number(val)) ? val : Number(val);
    });

    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      updatedInputs[cb.name] = cb.checked;
    });

    this.currentInputs[this.activeToolId] = updatedInputs;
    this.renderActiveCalculator();
  }

  renderFavoritesBar() {
    const bar = document.getElementById('pinned-favorites-bar');
    if (!bar) return;

    const favs = getFavorites();
    if (favs.length === 0) {
      bar.innerHTML = '';
      return;
    }

    let html = `<span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-2">${getTranslation('ui.pinnedLabel', '⭐ Pinned:')}</span>`;
    favs.forEach(id => {
      if (this.calculators[id]) {
        const title = getTranslation(`tools.${id}.shortTitle`, id);
        const isActive = this.activeToolId === id;
        html += `
          <a href="/calculators/${id}/" class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all mr-1.5 ${
            isActive
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
          }">
            <span>${title}</span>
          </a>
        `;
      }
    });

    bar.innerHTML = html;
  }

  renderAuthorityResources() {
    const container = document.getElementById('authority-resources-container');
    const grid = document.getElementById('authority-cards-grid');
    if (!container || !grid) return;

    const resources = contextualResources[this.activeToolId] || contextualResources.concrete;
    if (!resources || !resources.length) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    let html = '';
    resources.forEach(res => {
      html += `
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">${res.authority}</span>
              <h4 class="text-xs font-bold text-slate-200">${res.title}</h4>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">${res.summary}</p>
          </div>
          <p class="text-[10px] text-amber-400/80 font-mono font-semibold mt-2.5">${res.standardRef}</p>
        </div>
      `;
    });

    grid.innerHTML = html;
  }


  renderGuideModal() {
    const titleEl = document.getElementById('guide-modal-title');
    const bodyEl = document.getElementById('guide-modal-body');
    const linkEl = document.getElementById('guide-github-link');
    if (!bodyEl) return;

    const lang = getLanguage();
    const guides = {
      en: {
        title: "How to Use Plan & BuildMetric India",
        file: "HOW_TO_USE.md",
        steps: [
          ["🚀 1. Switch Between 11 Calculators in 1 Click", "Use the Quick Calculator Switcher Bar directly above the form to jump instantly between Concrete, Drywall/Plaster, Vitrified Tiles, Brickwork/Steel, Painting, Roofing, Rental Yield, Home Loan EMI, Capital Gains Tax, and HVAC Tonnage."],
          ["⚡ 2. Instant Scenario Presets", "Click any preset pill (e.g. Standard 1000 sq.ft 5\" Roof Slab, 2 BHK Flat Painting) to pre-fill standard Indian dimensions and IS 456 mix specifications automatically."],
          ["🌐 3. All 11 Indian Regional Languages", "Tap the 🌐 Language button in the top header to instantly switch between English, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ, and ଓଡ଼ିଆ."],
          ["📋 4. Copy Summary & Export CSV Takeoff", "Tap Copy to copy formatted text ready for WhatsApp/Client proposals, or tap CSV to download an itemized procurement takeoff spreadsheet."],
          ["📱 5. Works 100% Offline (PWA)", "Tap your browser menu and choose \"Add to Home Screen\" or \"Install App\". You can calculate on remote construction sites with zero internet connection."]
        ]
      },
      hi: {
        title: "प्लान एंड बिल्डमैट्रिक उपयोग निर्देशिका",
        file: "docs/HOW_TO_USE_hi.md",
        steps: [
          ["🚀 1. 1-क्लिक कैलकुलेटर स्विचिंग", "फॉर्म के ठीक ऊपर 'क्विक कैलकुलेटर स्विचर बार' का उपयोग करके किसी भी कैलकुलेटर पर तुरंत जाएं।"],
          ["⚡ 2. भारतीय परिदृश्य प्रीसेट", "मानक भारतीय आयामों (जैसे 1000 वर्ग फुट 5 इंच छत स्लैब, 2 BHK फ्लैट पेंटिंग) को स्वतः भरने के लिए प्रीसेट पर क्लिक करें।"],
          ["🌐 3. 11 भारतीय क्षेत्रीय भाषाएं", "हेडर में '🌐 भाषा' बटन दबाकर अपनी पसंदीदा क्षेत्रीय भाषा चुनें।"],
          ["📋 4. सारांश कॉपी करें और CSV एक्सपोर्ट करें", "व्हाट्सएप पर शेयर करने के लिए 'Copy' दबाएं या एक्सेल के लिए 'CSV' फाइल डाउनलोड करें।"],
          ["📱 5. 100% ऑफलाइन PWA क्षमता", "ब्राउज़र मेनू में 'Add to Home Screen' चुनें। निर्माण स्थल पर बिना इंटरनेट के भी पूरा काम करता है।"]
        ]
      },
      bn: {
        title: "ব্যবহার নির্দেশিকা — প্ল্যান অ্যান্ড বিল্ডমেট্রিক",
        file: "docs/HOW_TO_USE_bn.md",
        steps: [
          ["🚀 ১. এক ক্লিকে ক্যালকুলেটর পরিবর্তন", "টপ বারের কুইক সুইচার ব্যবহার করে নিমেষেই অন্য টুলে যান।"],
          ["⚡ ২. ইন্ডিয়ান প্রিসেট", "স্ট্যান্ডার্ড মাপ অটো-ফিল করতে প্রিসেটে ক্লিক করুন।"],
          ["🌐 ৩. ১১টি ভারতীয় আঞ্চলিক ভাষা", "🌐 ভাষা বোতামে ক্লিক করে যে কোনো ভাষা নির্বাচন করুন।"],
          ["📋 ৪. কপি ও CSV এক্সপোর্ট", "হোয়াটসঅ্যাপে পাঠাতে Copy করুন বা এক্সেল CSV ডাউনলোড করুন।"],
          ["📱 ৫. ১০০% অফলাইন PWA", "হোম স্ক্রিনে ইনস্টল করে ইন্টারনেট ছাড়াই সাইটে ব্যবহার করুন।"]
        ]
      },
      te: {
        title: "వినియోగదారు గైడ్ — ప్లాన్ & బిల్డ్‌మెట్రిక్",
        file: "docs/HOW_TO_USE_te.md",
        steps: [
          ["🚀 1. ఒక్క క్లిక్‌తో కాలిక్యులేటర్ మార్చడం", "క్విక్ స్విచ్చర్ బార్ ఉపయోగించి సులభంగా మారండి."],
          ["⚡ 2. భారతీయ దృశ్యాల ప్రీసెట్లు", "ప్రామాణిక కొలతలను నింపడానికి ప్రీసెట్లను నొక్కండి."],
          ["🌐 3. 11 భారతీయ ప్రాంతీయ భాషలు", "🌐 భాష బటన్ నొక్కి కావలసిన భాషను ఎంచుకోండి."],
          ["📋 4. కాపీ & CSV ఎగుమతి", "వాట్సాప్ కోసం కాపీ చేయండి లేదా ఎక్సెల్ CSV డౌన్‌లోడ్ చేసుకోండి."],
          ["📱 5. 100% ఆఫ్‌లైన్ PWA", "ఇంటర్నెట్ లేకుండా నేరుగా సైట్‌లో ఉపయోగించుకోండి."]
        ]
      },
      mr: {
        title: "वापरकर्ता मार्गदर्शिका — प्लॅन अँड बिल्डमेट्रिक",
        file: "docs/HOW_TO_USE_mr.md",
        steps: [
          ["🚀 १. एका क्लिकवर कॅल्क्युलेटर बदला", "वरिल क्विक स्विचरने त्वरित दुसऱ्या टूलवर जा."],
          ["⚡ २. भारतीय प्रीसेट्स", "स्टँडर्ड मोजमाप भरण्यासाठी प्रीसेटवर क्लिक करा."],
          ["🌐 ३. ११ भारतीय प्रादेशिक भाषा", "🌐 भाषा बटणावर क्लिक करून हवी ती भाषा निवडा."],
          ["📋 ४. कॉपी आणि CSV एक्सपोर्ट", "व्हॉट्सअ‍ॅपवर पाठवण्यासाठी कॉपी करा किंवा एक्सेल CSV डाऊनलोड करा."],
          ["📱 ५. १००% ऑफलाइन PWA", "इंटरनेटशिवाय बांधकाम जागेवर थेट वापरा."]
        ]
      },
      ta: {
        title: "பயனர் வழிகாட்டி — பிளான் & பில்ட்மெட்ரிக்",
        file: "docs/HOW_TO_USE_ta.md",
        steps: [
          ["🚀 1. ஒரே கிளிக்கில் மாற்றுதல்", "குவிக் ஸ்விட்சர் பார் மூலம் எளிதாக மாறலாம்."],
          ["⚡ 2. இந்திய அளவீட்டு ப்ரீசெட்கள்", "நிலையான அளவுகளை நிரப்ப ப்ரீசெட்டைத் தட்டவும்."],
          ["🌐 3. 11 இந்திய பிராந்திய மொழிகள்", "🌐 மொழி பொத்தானை அழுத்தி உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்."],
          ["📋 4. காப்பி & CSV பதிவிறக்கம்", "வாட்ஸ்அப்பில் பகிர காப்பி செய்யவும் அல்லது எக்செல் CSV பதிவிறக்கவும்."],
          ["📱 5. 100% ஆஃப்லைன் PWA", "இணையம் இல்லாமலும் கட்டுமான தளத்தில் பயன்படுத்தலாம்."]
        ]
      },
      gu: {
        title: "યુઝર ગાઈડ — પ્લાન એન્ડ બિલ્ડમેટ્રિક",
        file: "docs/HOW_TO_USE_gu.md",
        steps: [
          ["🚀 ૧. એક ક્લિકમાં કેલ્ક્યુલેટર બદલો", "ટોચના ક્વિક સ્વિચરથી સરળતાથી ટૂલ બદલો."],
          ["⚡ ૨. ભારતીય પ્રીસેટ્સ", "સ્ટાન્ડર્ડ માપ આપમેળે ભરવા પ્રીસેટ પર ક્લિક કરો."],
          ["🌐 ૩. ૧૧ ભારતીય પ્રાદેશિક ભાષાઓ", "🌐 ભાષા બટન પર ક્લિક કરીને ભાષા પસંદ કરો."],
          ["📋 ૪. કોપી અને CSV એક્સપોર્ટ", "વોટ્સએપ માટે કોપી કરો અથવા એક્સેલ CSV ડાઉનલોડ કરો."],
          ["📱 ૫. ૧૦૦% ઓફલાઇન PWA", "ઇન્ટરનેટ વિના પણ કન્સ્ટ્રક્શન સાઇટ પર વાપરો."]
        ]
      },
      kn: {
        title: "ಬಳಕೆದಾರರ ಕೈಪಿಡಿ — ಪ್ಲಾನ್ & ಬಿಲ್ಡ್‌ಮೆಟ್ರಿಕ್",
        file: "docs/HOW_TO_USE_kn.md",
        steps: [
          ["🚀 1. ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಬದಲಾವಣೆ", "ಮೇಲಿನ ಕ್ವಿಕ್ ಸ್ವಿಚರ್ ಬಳಸಿ ಸುಲಭವಾಗಿ ಬದಲಾಯಿಸಿ."],
          ["⚡ 2. ಭಾರತೀಯ ಪ್ರಿಸೆಟ್‌ಗಳು", "ಪ್ರಮಾಣಿತ ಅಳತೆಗಳನ್ನು ತುಂಬಲು ಪ್ರಿಸೆಟ್ ಒತ್ತಿರಿ."],
          ["🌐 3. 11 ಭಾರತೀಯ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳು", "🌐 ಭಾಷೆ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಭಾಷೆ ಆರಿಸಿ."],
          ["📋 4. ಕಾಪಿ & CSV ಡೌನ್‌ಲೋಡ್", "ವಾಟ್ಸಾಪ್‌ಗೆ ಕಾಪಿ ಮಾಡಿ ಅಥವಾ ಎಕ್ಸೆಲ್ CSV ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ."],
          ["📱 5. 100% ಆಫ್‌ಲೈನ್ PWA", "ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ನಿರ್ಮಾಣ ಸ್ಥಳದಲ್ಲಿ ಬಳಸಿ."]
        ]
      },
      ml: {
        title: "ഉപയോക്തൃ ഗൈഡ് — പ്ലാൻ & ബിൽഡ്മെട്രിക്",
        file: "docs/HOW_TO_USE_ml.md",
        steps: [
          ["🚀 1. ഒറ്റ ക്ലിക്കിൽ മാറ്റാം", "മുകളിലെ ക്വിക്ക് സ്വിച്ചർ ഉപയോഗിച്ച് ഉടൻ മാറുക."],
          ["⚡ 2. ഇന്ത്യൻ പ്രീസെറ്റുകൾ", "സ്റ്റാൻഡേർഡ് അളവുകൾക്കായി പ്രീസെറ്റുകൾ ക്ലിക്ക് ചെയ്യുക."],
          ["🌐 3. 11 ഇന്ത്യൻ പ്രാദേശിക ഭാഷകൾ", "🌐 ഭാഷ ബട്ടൺ ക്ലിക്ക് ചെയ്ത് ഭാഷ തിരഞ്ഞെടുക്കുക."],
          ["📋 4. കോപ്പി & CSV എക്സ്പോർട്ട്", "വാട്ട്സാപ്പിൽ അയക്കാൻ കോപ്പി ചെയ്യുക അല്ലെങ്കിൽ CSV ഡൗൺലോഡ് ചെയ്യുക."],
          ["📱 5. 100% ഓഫ്‌ലൈൻ PWA", "ഇന്റർനെറ്റ് ഇല്ലാതെ നിർമ്മാണ സൈറ്റുകളിൽ നേരിട്ട് ഉപയോഗിക്കുക."]
        ]
      },
      pa: {
        title: "ਯੂਜ਼ਰ ਗਾਈਡ — ਪਲਾਨ ਐਂਡ ਬਿਲਡਮੈਟ੍ਰਿਕ",
        file: "docs/HOW_TO_USE_pa.md",
        steps: [
          ["🚀 1. ਇੱਕ ਕਲਿੱਕ ਨਾਲ ਬਦਲੋ", "ਕਵਿੱਕ ਸਵਿੱਚਰ ਬਾਰ ਨਾਲ ਤੁਰੰਤ ਟੂਲ ਬਦਲੋ।"],
          ["⚡ 2. ਭਾਰਤੀ ਪ੍ਰੀਸੈੱਟ", "ਸਟੈਂਡਰਡ ਮਾਪ ਭਰਨ ਲਈ ਪ੍ਰੀਸੈੱਟ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।"],
          ["🌐 3. 11 ਭਾਰਤੀ ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ", "🌐 ਭਾਸ਼ਾ ਬਟਨ ਦਬਾ ਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ।"],
          ["📋 4. ਕਾਪੀ ਅਤੇ CSV ਐਕਸਪੋਰਟ", "ਵ੍ਹਟਸਐਪ ਲਈ ਕਾਪੀ ਕਰੋ ਜਾਂ ਐਕਸਲ CSV ਡਾਊਨਲੋਡ ਕਰੋ।"],
          ["📱 5. 100% ਔਫਲਾਈਨ PWA", "ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਦੇ ਕੰਸਟ੍ਰਕਸ਼ਨ ਸਾਈਟ 'ਤੇ ਵਰਤੋਂ।"]
        ]
      },
      or: {
        title: "ବ୍ୟବହାରକାରୀ ମାର୍ଗଦର୍ଶିକା — ପ୍ଲାନ ଆଣ୍ଡ ବିଲ୍ଡମେଟ୍ରିକ",
        file: "docs/HOW_TO_USE_or.md",
        steps: [
          ["🚀 ୧. ଗୋଟିଏ କ୍ଲିକରେ କାଲକୁଲେଟର ପରିବର୍ତ୍ତନ", "ଉପରେ ଥିବା କୁଇକ୍ ସୁଇଚର୍ ବ୍ୟବହାର କରି ସହଜରେ ବଦଳାନ୍ତୁ।"],
          ["⚡ ୨. ଭାରତୀୟ ପ୍ରିସେଟ୍", "ପ୍ରାମାଣିକ ମାପ ପାଇଁ ପ୍ରିସେଟ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ।"],
          ["🌐 ୩. ୧୧ଟି ଭାରତୀୟ ଆଞ୍ଚଳିକ ଭାଷା", "🌐 ଭାଷା ବଟନ୍ ଦବାଇ ନିଜ ପସନ୍ଦର ଭାଷା ଚୟନ କରନ୍ତୁ।"],
          ["📋 ୪. କପି ଏବଂ CSV ଏକ୍ସପୋର୍ଟ", "ହ୍ୱାଟ୍ସଆପ୍ ପାଇଁ କପି କରନ୍ତୁ କିମ୍ବା ଏକ୍ସେଲ୍ CSV ଡାଉନଲୋଡ୍ କରନ୍ତୁ।"],
          ["📱 ୫. ୧୦୦% ଅଫଲାଇନ୍ PWA", "ଇଣ୍ଟରନେଟ୍ ବିନା ନିର୍ମାଣ ସ୍ଥଳରେ ବ୍ୟବହାର କରନ୍ତୁ।"]
        ]
      }
    };

    const g = guides[lang] || guides.en;
    if (titleEl) titleEl.textContent = g.title;

    let html = '';
    g.steps.forEach(([stTitle, stDesc]) => {
      html += `
        <div class="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
          <h4 class="font-bold text-amber-400 mb-1 text-xs">${stTitle}</h4>
          <p class="text-slate-300 leading-relaxed">${stDesc}</p>
        </div>
      `;
    });
    bodyEl.innerHTML = html;

    if (linkEl) {
      linkEl.setAttribute('href', `https://github.com/umbind/Construction_Calc/blob/main/${g.file}`);
    }
  }

  bindLegalModals() {
    const modalTriggers = {
      'open-guide-modal': 'guide-modal',
      'open-about-modal': 'about-modal',
      'open-privacy-modal': 'privacy-modal',
      'open-disclaimer-modal': 'disclaimer-modal'
    };

    Object.entries(modalTriggers).forEach(([btnId, modalId]) => {
      document.querySelectorAll(`.${btnId}`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          modalManager.open(modalId);
        });
      });
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalManager.closeAll();
      });
    });

    const purgeBtn = document.getElementById('purge-local-data-btn');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to purge all locally saved calculation history and favorites?')) {
          try {
            localStorage.removeItem('buildmetric_history');
            localStorage.removeItem('buildmetric_favorites');
            localStorage.removeItem('constructcalc_history');
            localStorage.removeItem('constructcalc_favorites');
          } catch (e) {}
          modalManager.closeAll();
          this.renderFavoritesBar();
          this.showToast('All local calculation data successfully purged (DPDP Right to Erasure)');
        }
      });
    }
  }

  bindNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const email = emailInput.value.trim();
        try {
          const subs = JSON.parse(localStorage.getItem('buildmetric_subscribers') || '[]');
          subs.push({ email, timestamp: new Date().toISOString() });
          localStorage.setItem('buildmetric_subscribers', JSON.stringify(subs));
        } catch (err) {}

        emailInput.value = '';
        this.showToast('Thank you for subscribing to Plan & BuildMetric updates!');
      }
    });
  }

  updateAllUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = getTranslation(key, el.textContent);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', getTranslation(key, el.getAttribute('placeholder')));
    });
  }
}

// Instantiate and boot app safely whether DOMContentLoaded has already fired or not
function bootApp() {
  if (!window.buildMetricApp) {
    try {
      window.buildMetricApp = new App();
      window.buildMetricApp.init();
    } catch (err) {
      console.error('Fatal initialization error:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
