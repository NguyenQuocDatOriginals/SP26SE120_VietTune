import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | React.ReactNode;
    type?: NotificationType;
    maxWidth?: string;
    zIndex?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export default function NotificationDialog({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    maxWidth = "max-w-md",
    zIndex = "z-50",
    autoClose = true,
    autoCloseDelay = 3000,
}: NotificationDialogProps) {
    // Disable body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            // Cleanup
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Auto close after delay
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    // Handle ESC key to close
    useEffect(() => {
        if (!isOpen) return;
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Icon and colors based on type
    const getIconAndColors = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle className="h-8 w-8 text-green-600" strokeWidth={2.5} />,
                    iconBg: "bg-green-100/90",
                    headerBg: "bg-gradient-to-br from-green-600 to-green-700",
                };
            case 'error':
                return {
                    icon: <AlertCircle className="h-8 w-8 text-red-600" strokeWidth={2.5} />,
                    iconBg: "bg-red-100/90",
                    headerBg: "bg-gradient-to-br from-red-600 to-red-700",
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="h-8 w-8 text-yellow-600" strokeWidth={2.5} />,
                    iconBg: "bg-yellow-100/90",
                    headerBg: "bg-gradient-to-br from-yellow-600 to-yellow-700",
                };
            default: // info
                return {
                    icon: <Info className="h-8 w-8 text-primary-600" strokeWidth={2.5} />,
                    iconBg: "bg-primary-100/90",
                    headerBg: "bg-gradient-to-br from-primary-600 to-primary-700",
                };
        }
    };

    const { icon, iconBg, headerBg } = getIconAndColors();

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const overlayContent = (
        <div 
            className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto`}
            onClick={handleBackdropClick}
            style={{ 
                animation: isOpen ? 'fadeIn 0.3s ease-out' : 'none',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                position: 'fixed',
            }}
        >
            <div
                className={`rounded-2xl border border-neutral-300/80 shadow-2xl backdrop-blur-sm ${maxWidth} w-full overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto transform`}
                style={{ 
                    backgroundColor: '#FFF2D6',
                    animation: isOpen ? 'slideUp 0.3s ease-out' : 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b border-neutral-200/80 ${headerBg}`}>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-white/20 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                        <div className="flex flex-col items-center gap-4 mb-2">
                            <div className={`p-3 ${iconBg} rounded-full flex-shrink-0 shadow-sm`}>
                                {icon}
                            </div>
                            {typeof message === 'string' ? (
                                <h3 className="text-xl font-semibold text-neutral-900 text-center">
                                    {message}
                                </h3>
                            ) : (
                                <div className="text-xl font-semibold text-neutral-900 text-center">
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200/80 bg-neutral-50/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white shadow-primary-600/40"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );

    // Render using portal to ensure overlay is at top level
    return createPortal(overlayContent, document.body);
}
