"use client";

import React, { createContext, useContext, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const showConfirm = (msg: string, opts: ConfirmOptions = {}) => {
    setMessage(msg);
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  function handleClose(result: boolean) {
    setIsOpen(false);
    if (resolver) resolver(result);
    setResolver(null);
  }

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}

      <ConfirmDialog
        open={isOpen}
        title={options.title}
        message={message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
        isLoading={false}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.showConfirm;
}

export default ConfirmProvider;
