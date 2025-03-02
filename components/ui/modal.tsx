"use client";

import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XIcon } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
};
