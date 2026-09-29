// src/statusBox.js
// Unified status / error / version box at the bottom of every tool.
// Version: 0.9

import { FILE_HANDLER_VERSION } from './fileHandler.js';
import { DRAG_DROP_VERSION } from './dragDrop.js';

export const STATUS_BOX_VERSION = '0.9';

/**
 * Create or retrieve the status box inside a container.
 * The box is inserted at the bottom of the given container.
 */
export function createStatusBox(container, toolName, toolVersion) {
    // Remove any previous box
    const existing = container.querySelector('.utility-status-box');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'utility-status-box';
    wrapper.style.cssText = `
        margin-top: 20px;
        padding: 12px 16px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        font-size: 0.85rem;
        color: #b8c0cc;
    `;

    wrapper.innerHTML = `
        <div class="utility-status-message" style="
            min-height: 20px;
            margin-bottom: 8px;
            color: #d8dee8;
            word-break: break-word;
        "></div>
        <div class="utility-status-versions" style="
            font-size: 0.75rem;
            color: #6b7280;
            border-top: 1px solid rgba(255,255,255,0.06);
            padding-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        ">
            <span>Tool: ${toolName} v${toolVersion}</span>
            <span>FileHandler: v${FILE_HANDLER_VERSION}</span>
            <span>DragDrop: v${DRAG_DROP_VERSION}</span>
        </div>
    `;

    container.appendChild(wrapper);

    const $message = wrapper.querySelector('.utility-status-message');

    return {
        element: wrapper,
        message: $message,
        set(text, type = 'info') {
            const colors = {
                info: '#d8dee8',
                success: '#6fcf97',
                error: '#ff6b6b',
                warning: '#ffc107',
            };
            $message.style.color = colors[type] || colors.info;
            $message.textContent = text;
        },
        clear() {
            $message.textContent = '';
        },
    };
}