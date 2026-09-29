// src/reorder.js
// Drag-to-reorder list widget for multi-file tools.
// Version: 0.9

export const REORDER_VERSION = '0.9';

/**
 * Render a reorderable list of files.
 *
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {File[]}  options.files
 * @param {Function} options.onReorder - callback(newFiles)
 * @param {Function} [options.onRemove] - callback(index)
 * @param {Function} [options.renderExtra] - callback(file, index) -> HTMLElement
 */
export function setupReorderList(container, options) {
    const { files, onReorder, onRemove, renderExtra } = options;

    let dragIndex = -1;

    container.innerHTML = '';
    container.classList.add('utility-reorder-list');

    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'utility-reorder-item';
        item.draggable = true;
        item.dataset.index = index;
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            margin-bottom: 8px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 10px;
            cursor: grab;
            transition: transform 0.15s, opacity 0.15s, border-color 0.15s;
        `;

        // Drag handle
        const handle = document.createElement('span');
        handle.textContent = '☰';
        handle.style.cssText = 'color: #6b7280; font-size: 18px; user-select: none;';
        item.appendChild(handle);

        // Index badge
        const badge = document.createElement('span');
        badge.textContent = `${index + 1}.`;
        badge.style.cssText = 'color: #6fb7ff; font-weight: 600; min-width: 26px;';
        item.appendChild(badge);

        // File info
        const info = document.createElement('div');
        info.style.cssText = 'flex: 1; min-width: 0;';
        info.innerHTML = `
            <div style="font-weight: 500; color: #e6e9ed; word-break: break-word;">${file.name}</div>
            <div style="font-size: 0.8rem; color: #9da6b3;">${(file.size / 1024).toFixed(1)} KB</div>
        `;
        item.appendChild(info);

        // Optional extra content
        if (renderExtra) {
            const extra = renderExtra(file, index);
            if (extra) item.appendChild(extra);
        }

        // Remove button
        if (onRemove) {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✖';
            removeBtn.style.cssText = `
                background: rgba(255,70,70,0.12);
                border: 1px solid rgba(255,70,70,0.20);
                color: #ff6b6b;
                border-radius: 6px;
                padding: 4px 10px;
                cursor: pointer;
                font-size: 0.85rem;
            `;
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onRemove(index);
            });
            item.appendChild(removeBtn);
        }

        // Drag events
        item.addEventListener('dragstart', (e) => {
            dragIndex = index;
            item.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.style.borderColor = '#6fb7ff';
        });
        item.addEventListener('dragleave', () => {
            item.style.borderColor = 'rgba(255,255,255,0.06)';
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderColor = 'rgba(255,255,255,0.06)';
            if (dragIndex === -1 || dragIndex === index) return;
            const next = files.slice();
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            dragIndex = -1;
            if (onReorder) onReorder(next);
        });

        container.appendChild(item);
    });
}