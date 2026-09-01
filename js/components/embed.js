/**
 * BuildMetric Embed Widget Generator Modal
 * Produces clean, responsive <iframe> embed codes for bloggers, contractors, and real estate sites.
 */
import { copyToClipboard } from '../utils/formatters.js';

export class EmbedManager {
  constructor() {
    this.currentToolId = 'concrete';
    this.modalEl = null;
    this.codeEl = null;
    this.previewEl = null;
  }

  init() {
    this.modalEl = document.getElementById('embed-modal');
    this.codeEl = document.getElementById('embed-code-textarea');
    this.previewEl = document.getElementById('embed-preview-container');

    const copyBtn = document.getElementById('copy-embed-btn');
    if (copyBtn && this.codeEl) {
      copyBtn.addEventListener('click', async () => {
        const success = await copyToClipboard(this.codeEl.value);
        if (success) {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Embed Code';
          }, 2000);
        }
      });
    }

    const widthInput = document.getElementById('embed-width-select');
    const themeInput = document.getElementById('embed-theme-select');
    if (widthInput) widthInput.addEventListener('change', () => this.updateCode());
    if (themeInput) themeInput.addEventListener('change', () => this.updateCode());
  }

  openForTool(toolId) {
    this.currentToolId = toolId;
    if (!this.codeEl) this.init();
    this.updateCode();
    
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      this.modalEl.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    }
  }

  updateCode() {
    if (!this.codeEl) return;
    const width = document.getElementById('embed-width-select')?.value || '100%';
    const theme = document.getElementById('embed-theme-select')?.value || 'dark';
    const baseUrl = 'https://planandbuildmetric.netlify.app';
    const embedUrl = `${baseUrl}/calculators/${this.currentToolId}/?embed=true&theme=${theme}`;
    
    const iframeSnippet = `<iframe src="${embedUrl}" width="${width}" height="700" style="border:1px solid #334155;border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);overflow:hidden;" title="Plan &amp; BuildMetric - ${this.currentToolId}" loading="lazy" frameborder="0"></iframe>\n<div style="font-size:12px;color:#64748b;margin-top:6px;font-family:sans-serif;">Powered by <a href="${baseUrl}/" target="_blank" rel="noopener" style="color:#f59e0b;text-decoration:none;font-weight:600;">Plan &amp; BuildMetric</a></div>`;
    
    this.codeEl.value = iframeSnippet;
  }
}

export const embedManager = new EmbedManager();
