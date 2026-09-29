// src/dragDrop.js
// Universal drag & drop for all 991 tools.
// Version: 0.9

export const DRAG_DROP_VERSION = '0.9';

/**
 * Extract files from a drag event using dataTransfer.items when possible.
 */
function getDroppedFiles(e) {
    const result = [];
    if (e.dataTransfer && e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            const item = e.dataTransfer.items[i];
            if (item.kind === 'file') {
                const f = item.getAsFile();
                if (f) result.push(f);
            }
        }
    }
    if (result.length === 0 && e.dataTransfer && e.dataTransfer.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            result.push(e.dataTransfer.files[i]);
        }
    }
    return result;
}

/**
 * Filter dropped files by an accept string.
 */
function filterByAccept(files, accept) {
    if (!accept || accept === '*/*') return files;
    const acceptTypes = accept.split(',').map(s => s.trim());
    return files.filter(file =>
        acceptTypes.some(type => {
            if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type);
            if (type.includes('*')) return file.type.startsWith(type.replace('*', ''));
            return file.type === type || file.name.toLowerCase().endsWith(type);
        })
    );
}

/**
 * Set up drag & drop on a container.
 *
 * Options:
 *   accept    - MIME type or extension filter. Defaults to any file.
 *   multiple  - allow more than one file at a time (default: false)
 *   onFiles   - callback invoked with the dropped File[] array
 *   onClick   - callback invoked when the drop zone itself is clicked
 *   text      - label shown inside the drop zone
 *
 * @param {HTMLElement} container
 * @param {Object}      options
 * @returns {{dropZone: HTMLElement, destroy: Function, showDropZone: Function, hideDropZone: Function}}
 */
export function setupDragAndDrop(container, options = {}) {
    const {
        accept = '*/*',
        multiple = false,
        onFiles,
        onClick,
        text = '📂 Drop files here or click to browse',
    } = options;

    const dropZone = document.createElement('div');
    dropZone.className = 'utility-drop-zone';
    dropZone.style.cssText = `
        border: 3px dashed #28a745;
        border-radius: 12px;
        padding: 30px 20px;
        margin: 10px 0;
        text-align: center;
        color: #28a745;
        font-size: 16px;
        background: #e8f5e9;
        position: sticky;
        top: 10px;
        z-index: 1000;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    `;
    dropZone.innerHTML = `
        <span style="font-size: 32px;">📂</span>
        <span>${text}</span>
        <span style="font-size: 12px; color: #6c757d;">Supported: ${accept.replace(/\*/g, '') || 'all files'}</span>
    `;

    const firstChild = container.firstChild;
    if (firstChild) container.insertBefore(dropZone, firstChild);
    else container.appendChild(dropZone);

    let dragCounter = 0;
    let destroyed = false;

    const showDropZone = () => { dropZone.style.display = 'flex'; };
    const hideDropZone = () => { dropZone.style.display = 'none'; dragCounter = 0; };

    const checkAlive = () => {
        if (destroyed || !document.body.contains(dropZone)) { destroy(); return false; }
        return true;
    };

    const onDragEnter = (e) => {
        if (!checkAlive()) return;
        e.preventDefault(); e.stopPropagation();
        dragCounter++;
        if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            showDropZone();
        }
    };

    const onDragOver = (e) => {
        if (!checkAlive()) return;
        e.preventDefault(); e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const onDragLeave = (e) => {
        if (!checkAlive()) return;
        e.preventDefault(); e.stopPropagation();
        dragCounter--;
        if (dragCounter <= 0) hideDropZone();
    };

    const onDrop = async (e) => {
        if (!checkAlive()) return;
        e.preventDefault(); e.stopPropagation();
        dragCounter = 0;
        const raw = getDroppedFiles(e);
        if (raw.length === 0) { hideDropZone(); return; }
        const filtered = filterByAccept(raw, accept);
        if (filtered.length === 0) {
            alert(`No supported files found. Supported: ${accept}`);
            hideDropZone();
            return;
        }
        const finalFiles = multiple ? filtered : filtered.slice(0, 1);
        if (onFiles) await onFiles(finalFiles);
        hideDropZone();
    };

    document.addEventListener('dragenter', onDragEnter, true);
    document.addEventListener('dragover', onDragOver, true);
    document.addEventListener('dragleave', onDragLeave, true);
    document.addEventListener('drop', onDrop, true);

    const enter = (e) => {
        e.preventDefault(); e.stopPropagation();
        dropZone.style.borderColor = '#1a7a3a';
        dropZone.style.background = '#c8e6c9';
        dropZone.style.transform = 'scale(1.02)';
    };
    const over = (e) => {
        e.preventDefault(); e.stopPropagation();
        dropZone.style.borderColor = '#1a7a3a';
        dropZone.style.background = '#c8e6c9';
    };
    const leave = (e) => {
        e.preventDefault(); e.stopPropagation();
        dropZone.style.borderColor = '#28a745';
        dropZone.style.background = '#e8f5e9';
        dropZone.style.transform = 'scale(1)';
    };
    const click = () => { if (onClick) onClick(); };

    dropZone.addEventListener('dragenter', enter);
    dropZone.addEventListener('dragover', over);
    dropZone.addEventListener('dragleave', leave);
    dropZone.addEventListener('click', click);

    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        dropZone.removeEventListener('dragenter', enter);
        dropZone.removeEventListener('dragover', over);
        dropZone.removeEventListener('dragleave', leave);
        dropZone.removeEventListener('click', click);
        document.removeEventListener('dragenter', onDragEnter, true);
        document.removeEventListener('dragover', onDragOver, true);
        document.removeEventListener('dragleave', onDragLeave, true);
        document.removeEventListener('drop', onDrop, true);
        if (dropZone.parentNode) dropZone.parentNode.removeChild(dropZone);
    };

    return { dropZone, destroy, showDropZone, hideDropZone };
}