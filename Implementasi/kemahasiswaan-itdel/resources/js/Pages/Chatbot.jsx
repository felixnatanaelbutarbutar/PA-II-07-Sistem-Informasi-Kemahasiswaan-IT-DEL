import GuestLayout from '@/Layouts/GuestLayout';
import NavbarGuestLayout from '@/Layouts/NavbarGuestLayout';
import FooterLayout from '@/Layouts/FooterLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content:
                'Hai! Selamat datang di layanan chatbot IT Del! Aku siap membantumu mencari informasi tentang beasiswa, organisasi, dan kegiatan kampus. Ada yang bisa kubantu? Kalau kamu punya pertanyaan tentang cara berprestasi di kelas, aku bisa memberikan beberapa tips umum, tapi untuk strategi belajar yang lebih spesifik dan disesuaikan dengan program studimu, lebih baik kamu berkonsultasi dengan dosen wali atau kakak tingkatmu. Berikut beberapa tips umum untuk berprestasi di kelas: <br />* **Rajin Mengikuti Perkuliahan:** Kehadiran dan fokus di kelas sangat penting. Catat poin-poin penting dan ajukan pertanyaan jika ada yang kurang jelas. <br />* **Aktif Berpartisipasi:** Jangan ragu untuk',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fungsi untuk mem-parsing Markdown sederhana
    const parseMarkdown = (text) => {
        // Ganti **teks** dengan <strong>teks</strong>
        let parsedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Ganti <br /> dengan tag HTML yang sesuai
            .replace(/<br \/>/g, '<br />');

        // Ganti baris baru (\n) dengan <br />
        parsedText = parsedText.replace(/\n/g, '<br />');

        return parsedText;
    };

    // Fungsi untuk menggulir ke pesan terbaru
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Focus input setelah pesan baru muncul
        inputRef.current?.focus();
    }, [messages]);

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
                }, 500); // Tambahkan efek delay untuk terasa lebih natural
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
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            padding: '30px 20px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        },
        header: {
            textAlign: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '25px',
            color: '#1e3a8a',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        chatBox: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            padding: '25px',
            height: '550px',
            overflowY: 'auto',
            marginBottom: '25px',
            border: '1px solid rgba(209, 213, 219, 0.3)',
            backdropFilter: 'blur(5px)',
        },
        messageWrapper: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '15px',
        },
        messageBubble: {
            padding: '12px 18px',
            borderRadius: '18px',
            maxWidth: '75%',
            wordWrap: 'break-word',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            lineHeight: '1.5',
            fontSize: '16px',
        },
        userMessage: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            marginLeft: 'auto',
            borderTopRightRadius: '4px',
            alignSelf: 'flex-end',
        },
        botMessage: {
            background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
            color: '#1f2937',
            borderTopLeftRadius: '4px',
            alignSelf: 'flex-start',
        },
        timestamp: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
            alignSelf: 'flex-end',
        },
        form: {
            display: 'flex',
            gap: '12px',
            position: 'relative',
        },
        input: {
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #d1d5db',
            outline: 'none',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'border 0.3s, box-shadow 0.3s',
        },
        inputFocus: {
            border: '1px solid #2563eb',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)',
        },
        button: {
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonHover: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.4)',
        },
        buttonDisabled: {
            background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
        },
        loadingDots: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 0',
            marginBottom: '15px',
        },
        dot: {
            width: '8px',
            height: '8px',
            background: '#2563eb',
            borderRadius: '50%',
            margin: '0 3px',
            animation: 'bounce 1.4s infinite ease-in-out both',
        },
        sendIcon: {
            marginLeft: '8px',
        },
    };

    const getTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <GuestLayout>
            <Head title="Chatbot Layanan Kampus" />
            <NavbarGuestLayout />

            <div style={styles.container}>
                <h1 style={styles.header}>Chatbot Layanan Kampus</h1>

                <div style={styles.chatBox}>
                    {messages.map((message, index) => (
                        <div key={index} style={styles.messageWrapper}>
                            <div
                                style={{
                                    ...styles.messageBubble,
                                    ...(message.role === 'user'
                                        ? styles.userMessage
                                        : styles.botMessage),
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
                                    alignSelf:
                                        message.role === 'user' ? 'flex-end' : 'flex-start',
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

                <form onSubmit={sendMessage} style={styles.form}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tanyakan tentang beasiswa, organisasi, atau kegiatan..."
                        style={styles.input}
                        disabled={isLoading}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => {
                            e.target.style.border = '1px solid #d1d5db';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        }}
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
                                    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow =
                                    '0 2px 4px rgba(37, 99, 235, 0.3)';
                            }
                        }}
                    >
                        {isLoading ? 'Mengirim...' : 'Kirim'}
                        {!isLoading && (
                            <svg
                                style={styles.sendIcon}
                                width="16"
                                height="16"
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

            <FooterLayout />
        </GuestLayout>
    );
}