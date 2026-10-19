import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import AppModal from "../components/AppModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const resolverRef = useRef(null);

  const closeWith = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setModal(null);
  }, []);

  const showAlert = useCallback(({ title = "Notice", message, variant = "info" } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModal({
        mode: "alert",
        title,
        message: message || "",
        variant,
        confirmLabel: "OK",
      });
    });
  }, []);

  const showConfirm = useCallback(({
    title = "Confirm",
    message,
    variant = "confirm",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModal({
        mode: "confirm",
        title,
        message: message || "",
        variant,
        confirmLabel,
        cancelLabel,
      });
    });
  }, []);

  const value = useMemo(() => ({ showAlert, showConfirm }), [showAlert, showConfirm]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modal && (
        <AppModal
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          confirmLabel={modal.confirmLabel}
          cancelLabel={modal.cancelLabel}
          showCancel={modal.mode === "confirm"}
          onConfirm={() => closeWith(modal.mode === "confirm" ? true : undefined)}
          onCancel={() => closeWith(modal.mode === "confirm" ? false : undefined)}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return ctx;
}
