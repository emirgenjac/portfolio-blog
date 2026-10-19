import { useEffect } from "react";
import "../styles/AppModal.css";

function AppModal({
  title,
  message,
  variant = "info",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showCancel) onCancel?.();
        else onConfirm?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [showCancel, onConfirm, onCancel]);

  return (
    <div
      className="app-modal-overlay"
      role="presentation"
      onClick={() => (showCancel ? onCancel?.() : onConfirm?.())}
    >
      <div
        className={`app-modal app-modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="app-modal-title" className="app-modal__title">{title}</h2>
        {message ? <p className="app-modal__message">{message}</p> : null}
        <div className="app-modal__actions">
          {showCancel && (
            <button type="button" className="app-modal__btn app-modal__btn--ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`app-modal__btn app-modal__btn--primary app-modal__btn--${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppModal;
