import React, { useEffect } from 'react';

export default function Notification({ show, type, message, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-lg shadow-lg transition-all transform animate-slide-in-right ${
            type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {type === 'success' ? (
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {message}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            onClick={onClose}
                            className={`inline-flex rounded-md p-1.5 focus:outline-none ${
                                type === 'success' 
                                    ? 'text-green-500 hover:bg-green-100' 
                                    : 'text-red-500 hover:bg-red-100'
                            }`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
