// src/filePreview.js
// Universal file preview widget with zoom + pagination.
// Supports images and PDFs (via pdf.js when available).
// Version: 0.9

export const FILE_PREVIEW_VERSION = '0.9';

const PDF_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_JS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfJsLoading = null;
async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    if (pdfJsLoading) return pdfJsLoading;
    pdfJsLoading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = PDF_JS_CDN;
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER_CDN;
            resolve(window.pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return pdfJsLoading;
}

/**
 * A small preview panel.
 *
 * Usage:
 *   const preview = new FilePreview(container);
 *   await preview.load(file);
 *   preview.setZoom(1.5);
 *   preview.nextPage();
 */
export class FilePreview {
    constructor(container, options = {}) {
        this.container = container;
        this.options = Object.assign({
            maxHeight: 260,
            enableZoom: true,
            enablePageNav: true,
        }, options);

        this.currentFile = null;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageCount = 1;
        this.zoom = 1;

        this._render();
    }

    _render() {
        this.container.innerHTML = `
            <div class="utility-preview" style="
                display: inline-block;
                background: #0d1117;
                border: 1px solid rgba(255,255,255,0.10);
                border-radius: 12px;
                padding: 12px;
                max-width: 100%;
            ">
                <div class="utility-preview-header" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 10px;
                    font-size: 0.85rem;
                    color: #9da6b3;
                ">
                    <span class="utility-preview-name" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                    <span class="utility-preview-controls" style="display: flex; gap: 6px;"></span>
                </div>
                <div class="utility-preview-stage" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    border-radius: 8px;
                    overflow: auto;
                    max-height: ${this.options.maxHeight}px;
                ">
                    <canvas class="utility-preview-canvas" style="max-width: 100%; display: block;"></canvas>
                    <img class="utility-preview-img" style="max-width: 100%; display: none; border-radius: 8px;" />
                </div>
                <div class="utility-preview-pager" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                    font-size: 0.85rem;
                    color: #b8c0cc;
                "></div>
            </div>
        `;

        this.$name = this.container.querySelector('.utility-preview-name');
        this.$controls = this.container.querySelector('.utility-preview-controls');
        this.$canvas = this.container.querySelector('.utility-preview-canvas');
        this.$img = this.container.querySelector('.utility-preview-img');
        this.$pager = this.container.querySelector('.utility-preview-pager');

        if (this.options.enableZoom) {
            const zoomOut = document.createElement('button');
            zoomOut.textContent = '−';
            zoomOut.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#d8dee8;border-radius:6px;padding:2px 8px;cursor:pointer;';
            zoomOut.addEventListener('click', () => this.setZoom(this.zoom - 0.25));

            const zoomIn = document.createElement('button');
            zoomIn.textContent = '+';
            zoomIn.style.cssText = zoomOut.style.cssText;
            zoomIn.addEventListener('click', () => this.setZoom(this.zoom + 0.25));

            this.$controls.appendChild(zoomOut);
            this.$controls.appendChild(zoomIn);
        }
    }

    async load(file) {
        this.currentFile = file;
        this.pageNum = 1;
        this.zoom = 1;
        this.$name.textContent = file.name;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            try {
                const pdfjs = await loadPdfJs();
                const data = await file.arrayBuffer();
                this.pdfDoc = await pdfjs.getDocument({ data }).promise;
                this.pageCount = this.pdfDoc.numPages;
                this.$img.style.display = 'none';
                this.$canvas.style.display = 'block';
                await this._renderPdfPage();
                this._renderPager();
            } catch (err) {
                console.error('Preview PDF error:', err);
                this.$pager.textContent = '⚠️ Preview unavailable';
            }
        } else if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(file.name)) {
            this.pdfDoc = null;
            this.pageCount = 1;
            this.$canvas.style.display = 'none';
            this.$img.style.display = 'block';
            this.$img.src = URL.createObjectURL(file);
            this._renderPager();
        } else {
            this.$canvas.style.display = 'none';
            this.$img.style.display = 'none';
            this.$pager.textContent = 'No preview available';
        }
    }

    async _renderPdfPage() {
        if (!this.pdfDoc) return;
        const page = await this.pdfDoc.getPage(this.pageNum);
        const viewport = page.getViewport({ scale: 1.0 * this.zoom });
        this.$canvas.width = viewport.width;
        this.$canvas.height = viewport.height;
        this.$canvas.style.width = 'auto';
        this.$canvas.style.height = 'auto';
        const ctx = this.$canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
    }

    _renderPager() {
        if (!this.options.enablePageNav || this.pageCount <= 1) {
            this.$pager.innerHTML = '';
            return;
        }
        this.$pager.innerHTML = '';
        const prev = document.createElement('button');
        prev.textContent = '◀';
        prev.style.cssText = 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#d8dee8;border-radius:6px;padding:2px 10px;cursor:pointer;';
        prev.disabled = this.pageNum <= 1;
        prev.addEventListener('click', () => this.prevPage());

        const label = document.createElement('span');
        label.textContent = `Page ${this.pageNum} / ${this.pageCount}`;

        const next = document.createElement('button');
        next.textContent = '▶';
        next.style.cssText = prev.style.cssText;
        next.disabled = this.pageNum >= this.pageCount;
        next.addEventListener('click', () => this.nextPage());

        this.$pager.appendChild(prev);
        this.$pager.appendChild(label);
        this.$pager.appendChild(next);
    }

    async nextPage() {
        if (this.pageNum < this.pageCount) {
            this.pageNum++;
            await this._renderPdfPage();
            this._renderPager();
        }
    }

    async prevPage() {
        if (this.pageNum > 1) {
            this.pageNum--;
            await this._renderPdfPage();
            this._renderPager();
        }
    }

    async setZoom(z) {
        this.zoom = Math.max(0.25, Math.min(3, z));
        if (this.pdfDoc) await this._renderPdfPage();
        else if (this.$img.style.display === 'block') {
            this.$img.style.maxHeight = (this.options.maxHeight * this.zoom) + 'px';
        }
    }

    destroy() {
        if (this.$img && this.$img.src) URL.revokeObjectURL(this.$img.src);
        this.container.innerHTML = '';
    }
}

/**
 * Open a full-screen modal preview of a file (image or PDF).
 */
export async function openFullPreview(file) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.9);
        z-index: 99999; display: flex; align-items: center; justify-content: center;
        flex-direction: column; padding: 40px; cursor: zoom-out;
    `;
    document.body.appendChild(overlay);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        position: absolute; top: 20px; right: 20px; padding: 8px 16px;
        background: #6fb7ff; color: #0d1117; border: none; border-radius: 8px;
        cursor: pointer; font-weight: 600;
    `;
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); overlay.remove(); });
    overlay.appendChild(closeBtn);

    overlay.addEventListener('click', () => overlay.remove());

    const stage = document.createElement('div');
    stage.style.cssText = 'max-width: 90vw; max-height: 90vh; overflow: auto;';
    overlay.appendChild(stage);

    try {
        const pdfjs = await loadPdfJs();
        const data = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        canvas.style.cssText = 'max-width: 100%; border-radius: 8px;';
        canvas.addEventListener('click', (e) => e.stopPropagation());
        stage.appendChild(canvas);
    } catch {
        // Not a PDF; assume image
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.cssText = 'max-width: 100%; max-height: 90vh; border-radius: 8px;';
        img.addEventListener('click', (e) => e.stopPropagation());
        stage.appendChild(img);
    }
}