import React, { useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Guardar', noFooter = false }) {
    const mouseDownOnOverlay = useRef(false);

    if (!isOpen) return null;

    const handleMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            mouseDownOnOverlay.current = true;
        } else {
            mouseDownOnOverlay.current = false;
        }
    };

    const handleMouseUp = (e) => {
        if (e.target === e.currentTarget && mouseDownOnOverlay.current) {
            onClose();
        }
    };

    return (
        <div 
            className="modal-overlay" 
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">{title}</div>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {!noFooter && onConfirm && (
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
                    </div>
                )}
            </div>
        </div>
    );
}