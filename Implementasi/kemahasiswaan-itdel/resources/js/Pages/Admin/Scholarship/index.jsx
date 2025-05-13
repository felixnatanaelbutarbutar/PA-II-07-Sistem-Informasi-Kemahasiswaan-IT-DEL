import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// Memoized Scholarship Card Component to prevent unnecessary re-renders
const ScholarshipCard = React.memo(({ scholarship, openDropdownId, toggleDropdown, handleToggleClick, handleDeleteClick, isDeleting, isToggling, dropdownRefs, getGridDropdownPosition }) => {
  const dropdownPosition = openDropdownId === scholarship.scholarship_id ? getGridDropdownPosition(scholarship.scholarship_id) : { top: 0, left: 0 };

  // Strip HTML tags from description
  const stripHtmlTags = (html) => {
    if (!html) return 'Tidak ada deskripsi';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || 'Tidak ada deskripsi';
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder.png';
    e.target.className = 'w-full h-full object-cover bg-gray-200';
  };

  return (
    <div
      className={`group bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl border border-gray-100 hover:border-blue-200 ${openDropdownId === scholarship.scholarship_id ? '' : 'hover:translate-y-[-4px]'}`}
    >
      <div className="h-52 overflow-hidden relative">
        {scholarship.poster ? (
          <img
            src={scholarship.poster}
            alt={scholarship.name}
            className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy" // Lazy load images
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center no-image-placeholder">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 text-sm rounded-bl-lg shadow-md">
          {scholarship.category_name || 'Uncategorized'}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {scholarship.name}
        </h2>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg
            className="w-4 h-4 mr-1 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {scholarship.start_date && scholarship.end_date
            ? `${new Date(scholarship.start_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })} - ${new Date(scholarship.end_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : 'Tanggal tidak ditentukan'}
        </div>
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {stripHtmlTags(scholarship.description)}
          </p>
        </div>
        <div className="mt-auto pt-3 flex justify-end relative">
          <div ref={(el) => (dropdownRefs.current[scholarship.scholarship_id] = el)}>
            <button
              onClick={() => toggleDropdown(scholarship.scholarship_id)}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
              aria-label="More actions"
              aria-expanded={openDropdownId === scholarship.scholarship_id}
              disabled={isDeleting || isToggling}
              data-scholarship-id={scholarship.scholarship_id}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {openDropdownId === scholarship.scholarship_id && (
              <div
                className="fixed w-48 bg-white rounded-md shadow-lg z-[60] border border-gray-200 transition-opacity duration-100"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  opacity: 1,
                }}
                ref={(el) => (dropdownRefs.current[`dropdown-${scholarship.scholarship_id}`] = el)}
              >
                <div className="py-1">
                  <Link
                    href={route('admin.scholarship.edit', scholarship.scholarship_id)}
                    className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                    onClick={() => toggleDropdown(null)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleClick(scholarship)}
                    className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition w-full text-left"
                    disabled={isToggling}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={scholarship.is_active ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'}
                      />
                    </svg>
                    {scholarship.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(scholarship)}
                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition w-full text-left"
                    disabled={isDeleting}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Index({ auth, userRole, permissions, menu, scholarships = [], filters = {}, flash }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'updated_at');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState(null);
  const [scholarshipToToggle, setScholarshipToToggle] = useState(null);
  const [toggleAction, setToggleAction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setNotificationMessage(flash.success);
      setNotificationType('success');
      setShowNotification(true);
    } else if (flash?.error) {
      setNotificationMessage(flash.error);
      setNotificationType('error');
      setShowNotification(true);
    }
    if (flash?.success || flash?.error) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  // Handle click outside to close dropdown and Escape key press
  useEffect(() => {
    const handleClickOutside = (event) => {
      let isOutside = true;
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && ref.contains(event.target)) {
          isOutside = false;
        }
      });
      if (isOutside) {
        setOpenDropdownId(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounce search and filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const queryParams = {
        search: searchTerm.trim() || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy || undefined,
        sort_direction: sortDirection || undefined,
      };
      router.get(route('admin.scholarship.index'), queryParams, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, sortBy, sortDirection]);

  // Memoized toggleDropdown to prevent unnecessary re-renders
  const toggleDropdown = useCallback((scholarshipId) => {
    setOpenDropdownId((prev) => (prev === scholarshipId ? null : scholarshipId));
  }, []);

  // Handle initiating actions
  const handleDeleteClick = useCallback((scholarship) => {
    if (!scholarship?.scholarship_id) {
      setNotificationMessage('Gagal: ID Beasiswa tidak valid.');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    setScholarshipToDelete(scholarship);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  }, []);

  const handleToggleClick = useCallback((scholarship) => {
    if (!scholarship?.scholarship_id) {
      setNotificationMessage('Gagal: ID Beasiswa tidak valid.');
      setNotificationType('error');
      setShowNotification(true);
      return;
    }
    setScholarshipToToggle(scholarship);
    setToggleAction(scholarship.is_active ? 'deactivate' : 'activate');
    setShowToggleModal(true);
    setOpenDropdownId(null);
  }, []);

  // Confirm and perform deletion
  const confirmDelete = () => {
    if (!scholarshipToDelete?.scholarship_id) {
      setNotificationMessage('Gagal: ID Beasiswa tidak valid.');
      setNotificationType('error');
      setShowNotification(true);
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    router.delete(route('admin.scholarship.destroy', scholarshipToDelete.scholarship_id), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setNotificationMessage('Beasiswa berhasil dihapus!');
        setNotificationType('success');
        setShowNotification(true);
        setShowDeleteModal(false);
        setScholarshipToDelete(null);
      },
      onError: (errors) => {
        setNotificationMessage('Gagal menghapus beasiswa: ' + (errors.error || 'Terjadi kesalahan.'));
        setNotificationType('error');
        setShowNotification(true);
        setShowDeleteModal(false);
      },
      onFinish: () => setIsDeleting(false),
    });
 γνωστικότητα
  };

  // Confirm and perform toggle
  const confirmToggle = () => {
    if (!scholarshipToToggle?.scholarship_id) {
      setNotificationMessage('Gagal: ID Beasiswa tidak valid.');
      setNotificationType('error');
      setShowNotification(true);
      setShowToggleModal(false);
      return;
    }

    setIsToggling(true);
    router.patch(route('admin.scholarship.toggle-active', scholarshipToToggle.scholarship_id), {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setNotificationMessage(
          scholarshipToToggle.is_active ? 'Beasiswa berhasil dinonaktifkan!' : 'Beasiswa berhasil diaktifkan!'
        );
        setNotificationType('success');
        setShowNotification(true);
        setShowToggleModal(false);
        setScholarshipToToggle(null);
        setToggleAction(null);
      },
      onError: (errors) => {
        setNotificationMessage('Gagal mengubah status beasiswa: ' + (errors.error || 'Terjadi kesalahan.'));
        setNotificationType('error');
        setShowNotification(true);
        setShowToggleModal(false);
      },
      onFinish: () => setIsToggling(false),
    });
  };

  // Cancel actions
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScholarshipToDelete(null);
  };

  const cancelToggle = () => {
    setShowToggleModal(false);
    setScholarshipToToggle(null);
    setToggleAction(null);
  };

  // Handle sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Calculate fixed position for table view dropdown
  const getTableDropdownPosition = useCallback((scholarshipId) => {
    const button = document.querySelector(`[data-scholarship-id="${scholarshipId}"]`);
    if (!button) return { top: 0, left: 0 };

    const rect = button.getBoundingClientRect();
    const dropdownHeight = 150;
    const dropdownWidth = 192;
    const spaceBelow = window.innerHeight - rect.bottom;
    const viewportWidth = window.innerWidth;

    let top = rect.bottom + 8;
    let left = rect.right - dropdownWidth;

    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - 8;
    }

    if (left < 0) {
      left = 8;
    } else if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8;
    }

    return { top, left };
  }, []);

  // Calculate fixed position for grid view dropdown (positioned above)
  const getGridDropdownPosition = useCallback((scholarshipId) => {
    const button = document.querySelector(`[data-scholarship-id="${scholarshipId}"]`);
    if (!button) return { top: 0, left: 0 };

    const rect = button.getBoundingClientRect();
    const dropdownHeight = 150;
    const dropdownWidth = 192;
    const spaceAbove = rect.top;
    const viewportWidth = window.innerWidth;

    // Position dropdown above the button
    let top = rect.top - dropdownHeight - 8; // 8px gap above the button
    let left = rect.right - dropdownWidth; // Align right edge with button

    // Adjust if dropdown would be above viewport
    if (top < 0) {
      top = rect.bottom + 8; // Fallback to below if no space above
    }

    // Adjust if dropdown would exceed viewport width
    if (left < 0) {
      left = 8;
    } else if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8;
    }

    return { top, left };
  }, []);

  return (
    <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
      <Head title="Kelola Beasiswa" />

      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
            notificationType === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className={`h-5 w-5 ${notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {notificationType === 'success' ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V5z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}
              >
                {notificationMessage}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowNotification(false)}
                className={`inline-flex rounded-md p-1.5 ${
                  notificationType === 'success'
                    ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                    : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                } focus:outline-none focus:ring-2`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Konfirmasi Penghapusan</h3>
            <p className="text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus beasiswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                disabled={isDeleting}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Modal */}
      {showToggleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Konfirmasi Perubahan Status</h3>
            <p className="text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin {toggleAction === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} beasiswa ini?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelToggle}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={isToggling}
              >
                Batal
              </button>
              <button
                onClick={confirmToggle}
                className={`px-4 py-2 ${
                  toggleAction === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } text-white rounded-lg transition flex items-center`}
                disabled={isToggling}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={toggleAction === 'activate' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
                  />
                </svg>
                {isToggling
                  ? toggleAction === 'activate'
                    ? 'Mengaktifkan...'
                    : 'Menonaktifkan...'
                  : toggleAction === 'activate'
                  ? 'Aktifkan'
                  : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Manajemen Beasiswa
              </h1>
              <p className="text-gray-500 mt-1">Kelola beasiswa untuk website</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <input
                  type="text"
                  placeholder="Cari nama, deskripsi, atau kategori..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-48 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 pr-8"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                </select>
                <svg
                  className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  } transition-all duration-200`}
                  title="Tampilan Grid"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md ${
                    viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  } transition-all duration-200`}
                  title="Tampilan Tabel"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
              <Link
                href={route('admin.scholarship.create')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tambah Beasiswa
              </Link>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && scholarships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.scholarship_id}
                scholarship={scholarship}
                openDropdownId={openDropdownId}
                toggleDropdown={toggleDropdown}
                handleToggleClick={handleToggleClick}
                handleDeleteClick={handleDeleteClick}
                isDeleting={isDeleting}
                isToggling={isToggling}
                dropdownRefs={dropdownRefs}
                getGridDropdownPosition={getGridDropdownPosition}
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && scholarships.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poster
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Beasiswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('updated_at')}
                  >
                    Terakhir Diperbarui
                    {sortBy === 'updated_at' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dibuat Oleh
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scholarships.map((scholarship) => {
                  const dropdownPosition = openDropdownId === scholarship.scholarship_id ? getTableDropdownPosition(scholarship.scholarship_id) : { top: 0, left: 0 };
                  return (
                    <tr key={scholarship.scholarship_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scholarship.poster ? (
                          <img
                            src={scholarship.poster}
                            alt={scholarship.name}
                            className="w-16 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.png';
                              e.target.className = 'w-16 h-10 object-cover bg-gray-200 rounded';
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-200 flex items-center justify-center rounded no-image-placeholder">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {scholarship.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {scholarship.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {scholarship.start_date
                          ? new Date(scholarship.start_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {scholarship.end_date
                          ? new Date(scholarship.end_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            scholarship.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {scholarship.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(scholarship.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {scholarship.created_by || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative" ref={(el) => (dropdownRefs.current[scholarship.scholarship_id] = el)}>
                          <button
                            onClick={() => toggleDropdown(scholarship.scholarship_id)}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition focus:outline-none"
                            aria-label="More actions"
                            aria-expanded={openDropdownId === scholarship.scholarship_id}
                            disabled={isDeleting || isToggling}
                            data-scholarship-id={scholarship.scholarship_id}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          {openDropdownId === scholarship.scholarship_id && (
                            <div
                              className="fixed w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 transition-opacity duration-100"
                              style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                opacity: 1,
                              }}
                              ref={(el) => (dropdownRefs.current[`dropdown-${scholarship.scholarship_id}`] = el)}
                            >
                              <div className="py-1">
                                <Link
                                  href={route('admin.scholarship.edit', scholarship.scholarship_id)}
                                  className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition"
                                  onClick={() => toggleDropdown(null)}
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleClick(scholarship)}
                                  className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition w-full text-left"
                                  disabled={isToggling}
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d={scholarship.is_active ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'}
                                    />
                                  </svg>
                                  {scholarship.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(scholarship)}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition w-full text-left"
                                  disabled={isDeleting}
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Hapus
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {scholarships.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada beasiswa yang tersedia</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchTerm || statusFilter
                ? 'Tidak ada hasil yang cocok dengan pencarian Anda'
                : 'Silakan tambahkan beasiswa baru untuk mulai mengelola'}
            </p>
            {searchTerm || statusFilter ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset Pencarian
              </button>
            ) : (
              <Link
                href={route('admin.scholarship.create')}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tambah Beasiswa Baru
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
