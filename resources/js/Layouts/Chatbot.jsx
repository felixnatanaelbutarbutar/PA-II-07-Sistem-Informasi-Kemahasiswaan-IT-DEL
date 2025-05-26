import { useState, useEffect, useRef } from 'react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content:
                'Hai! Selamat datang di layanan chatbot IT Del! Aku siap membantumu mencari informasi tentang beasiswa, organisasi, dan kegiatan kampus. Ada yang bisa kubantu?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Fungsi untuk mem-parsing Markdown sederhana
    const parseMarkdown = (text) => {
        let parsedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/<br \/>/g, '<br />')
            .replace(/\n/g, '<br />');
        return parsedText;
    };

    // Fungsi untuk menggulir ke pesan terbaru
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            inputRef.current?.focus();
        }
    }, [messages, isOpen]);

    // Fungsi untuk mengirim pesan ke API
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                const botMessage = { role: 'bot', content: data.reply };
                setTimeout(() => {
                    setMessages((prev) => [...prev, botMessage]);
                }, 500);
            } else {
                const errorMessage = {
                    role: 'bot',
                    content: `Maaf, terjadi kesalahan: ${data.message}`,
                };
                setTimeout(() => {
                    setMessages((prev) => [...prev, errorMessage]);
                }, 500);
            }
        } catch (error) {
            const errorMessage = {
                role: 'bot',
                content: 'Maaf, saya tidak dapat terhubung ke server. Silakan coba lagi nanti.',
            };
            setTimeout(() => {
                setMessages((prev) => [...prev, errorMessage]);
            }, 500);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    const styles = {
        widgetContainer: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
        },
        chatButton: {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#fff',
            padding: '15px',
            borderRadius: '50%',
            border: 'none',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            transition: 'all 0.3s',
        },
        chatButtonHover: {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
        },
        chatContainer: {
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            width: '350px',
            height: '500px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            border: '1px solid rgba(209, 213, 219, 0.4)',
            backdropFilter: 'blur(10px)',
            position: 'absolute',
            bottom: '80px',
            right: '0',
        },
        chatHeader: {
            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
            padding: '15px 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        chatIcon: {
            width: '25px',
            height: '25px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontWeight: 'bold',
            fontSize: '14px',
        },
        chatTitle: {
            fontSize: '16px',
            fontWeight: '600',
            margin: '0',
            flex: 1,
        },
        closeButton: {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
        },
        chatBox: {
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23e5e7eb" fill-opacity="0.2" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6',
        },
        messageWrapper: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '15px',
            animationDuration: '0.3s',
            animationFillMode: 'both',
        },
        messageBubble: {
            padding: '10px 15px',
            borderRadius: '16px',
            maxWidth: '80%',
            wordWrap: 'break-word',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            lineHeight: '1.5',
            fontSize: '14px',
        },
        userMessage: {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#fff',
            marginLeft: 'auto',
            borderTopRightRadius: '4px',
            alignSelf: 'flex-end',
            animationName: 'slideInRight',
        },
        botMessage: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            color: '#374151',
            borderTopLeftRadius: '4px',
            alignSelf: 'flex-start',
            border: '1px solid rgba(209, 213, 219, 0.5)',
            animationName: 'slideInLeft',
        },
        timestamp: {
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px',
            alignSelf: 'flex-end',
            fontStyle: 'italic',
        },
        formContainer: {
            padding: '15px 20px',
            borderTop: '1px solid #e5e7eb',
            background: 'rgba(249, 250, 251, 0.95)',
        },
        form: {
            display: 'flex',
            gap: '10px',
        },
        input: {
            flex: 1,
            padding: '12px 18px',
            borderRadius: '20px',
            border: '2px solid #e5e7eb',
            outline: 'none',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s',
            background: 'white',
        },
        inputFocused: {
            border: '2px solid #3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
        },
        button: {
            padding: '0',
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 3px 10px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonHover: {
            background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(59, 130, 246, 0.6)',
        },
        buttonDisabled: {
            background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: '0 2px 6px rgba(107, 114, 128, 0.4)',
        },
        loadingDots: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 0',
            marginBottom: '10px',
        },
        dot: {
            width: '8px',
            height: '8px',
            background: '#3b82f6',
            borderRadius: '50%',
            margin: '0 3px',
            animation: 'bounce 1.4s infinite ease-in-out both',
        },
        sendIcon: {
            width: '20px',
            height: '20px',
        },
        '@keyframes slideInLeft': {
            '0%': { opacity: 0, transform: 'translateX(-20px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes slideInRight': {
            '0%': { opacity: 0, transform: 'translateX(20px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        '@keyframes bounce': {
            '0%, 80%, 100%': { transform: 'scale(0)' },
            '40%': { transform: 'scale(1.0)' },
        },
    };

    // Add keyframes to document
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = `
            @keyframes slideInLeft {
                0% { opacity: 0; transform: translateX(-20px); }
                100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideInRight {
                0% { opacity: 0; transform: translateX(20px); }
                100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const getTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={styles.widgetContainer}>
            {/* Tombol Chatbot */}
            <button
                style={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.chatButtonHover)}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
                }}
            >
                {isOpen ? (
                    <svg
                        style={{ width: '24px', height: '24px' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg
                        style={{ width: '24px', height: '24px' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                )}
            </button>

            {/* Chatbot Widget */}
            <div style={styles.chatContainer}>
                <div style={styles.chatHeader}>
                    <div style={styles.chatIcon}>D</div>
                    <h2 style={styles.chatTitle}>IT Del Assistant</h2>
                    <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
                        ×
                    </button>
                </div>

                <div style={styles.chatBox}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.messageWrapper,
                                animation: `${message.role === 'user' ? 'slideInRight' : 'slideInLeft'} 0.3s ease`,
                            }}
                        >
                            <div
                                style={{
                                    ...styles.messageBubble,
                                    ...(message.role === 'user' ? styles.userMessage : styles.botMessage),
                                }}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        message.role === 'bot'
                                            ? parseMarkdown(message.content)
                                            : message.content,
                                }}
                            />
                            <div
                                style={{
                                    ...styles.timestamp,
                                    textAlign: message.role === 'user' ? 'right' : 'left',
                                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {getTime()}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={styles.loadingDots}>
                            <div style={{ ...styles.dot, animationDelay: '0s' }}></div>
                            <div style={{ ...styles.dot, animationDelay: '0.2s' }}></div>
                            <div style={{ ...styles.dot, animationDelay: '0.4s' }}></div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.formContainer}>
                    <form onSubmit={sendMessage} style={styles.form}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanyakan sesuatu..."
                            style={{
                                ...styles.input,
                                ...(isFocused ? styles.inputFocused : {}),
                            }}
                            disabled={isLoading}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(isLoading ? styles.buttonDisabled : {}),
                            }}
                            disabled={isLoading}
                            onMouseEnter={(e) =>
                                !isLoading && Object.assign(e.currentTarget.style, styles.buttonHover)
                            }
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.background =
                                        'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)';
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow =
                                        '0 3px 10px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                        >
                            {isLoading ? (
                                <div
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                ></div>
                            ) : (
                                <svg
                                    style={styles.sendIcon}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M22 2L11 13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M22 2L15 22L11 13L2 9L22 2Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}