export default function GuestLayout({ children }) {
    return <div className="min-h-screen bg-gray-100"><style jsx global>{`
  .pulse {
    animation: pulse 0.3s ease;
  }
  .news-card {
    position: relative;
    transition: transform 0.3s ease, z-index 0.3s ease;
  }
  .sidebar-item:hover {
    transform: translateX(6px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    background: linear-gradient(90deg, #E0F2FE, #BFDBFE, #E0F2FE) !important;
    background-size: 200% 100% !important;
    animation: gradientMove 2s ease infinite !important;
  }
  .sidebar-item:hover:before {
    transform: scaleY(1) !important;
  }
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`}</style>{children}</div>;
}
