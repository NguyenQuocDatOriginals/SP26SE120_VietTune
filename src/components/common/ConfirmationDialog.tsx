import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | React.ReactNode;
    description?: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmButtonStyle?: string;
    cancelButtonStyle?: string;
    maxWidth?: string;
    zIndex?: string;
    icon?: React.ReactNode;
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmButtonStyle = "bg-primary-600 text-white hover:bg-primary-500",
    cancelButtonStyle = "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
    maxWidth = "max-w-3xl",
    zIndex = "z-50",
    icon,
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    const defaultIcon = icon || (
        <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
            <AlertCircle className="h-8 w-8 text-primary-600" />
        </div>
    );

    return (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/50`}>
            <div
                className={`rounded-2xl shadow-xl border border-neutral-300 ${maxWidth} w-full overflow-hidden flex flex-col`}
                style={{ backgroundColor: '#FFF2D6' }}
            >
                {/* Header */}
                <div className="flex items-center justify-center p-6 border-b border-neutral-200 bg-primary-600">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    <div className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                        <div className="flex flex-col items-center gap-4 mb-2">
                            {defaultIcon}
                            {typeof message === 'string' ? (
                                <h3 className="text-xl font-semibold text-neutral-800 text-center">
                                    {message}
                                </h3>
                            ) : (
                                <div className="text-xl font-semibold text-neutral-800 text-center">
                                    {message}
                                </div>
                            )}
                            {description && (
                                <div className="text-neutral-700 text-center space-y-1">
                                    {typeof description === 'string' ? (
                                        <p>{description}</p>
                                    ) : (
                                        description
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200 bg-neutral-50/50">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm hover:shadow-md ${cancelButtonStyle}`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm hover:shadow-md ${confirmButtonStyle}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}