import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Add({ auth, userRole, permissions, navigation, mpmExists, flash }) {
    const [data, setData] = useState({
        introduction: '',
        vision: '',
        mission: [''],
        structure: {
            chairman: { name: '', photo: null },
            vice_chairman: { name: '', photo: null },
            secretary: { name: '', photo: null },
            commissions: [],
        },
        recruitment_status: 'OPEN',
        logo: null,
    });
    const [missionFields, setMissionFields] = useState(['']);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // State untuk mengelola komisi
    const [commissions, setCommissions] = useState([]);

    useEffect(() => {
        // Handle flash messages from server
        if (flash) {
            if (flash.success) {
                setNotification({
                    show: true,
                    type: 'success',
                    message: flash.success,
                });
            } else if (flash.error) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: flash.error,
                });
            }
        }

        // Auto-hide notification after 5 seconds
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash, notification]);

    const handleMissionChange = (index, value) => {
        const updatedMissions = [...missionFields];
        updatedMissions[index] = value;
        setMissionFields(updatedMissions);
        setData({ ...data, mission: updatedMissions });
    };

    const addMissionField = () => {
        setMissionFields([...missionFields, '']);
    };

    const removeMissionField = (index) => {
        const updatedMissions = missionFields.filter((_, i) => i !== index);
        setMissionFields(updatedMissions);
        setData({ ...data, mission: updatedMissions });
    };

    const addCommission = () => {
        const newCommission = {
            name: '',
            chairman: { name: '', photo: null },
            members: [],
            work_programs: [''],
        };
        setCommissions([...commissions, newCommission]);
        setData({ ...data, structure: { ...data.structure, commissions: [...commissions, newCommission] } });
    };

    const removeCommission = (index) => {
        const updatedCommissions = commissions.filter((_, i) => i !== index);
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleCommissionChange = (index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index][field] = value;
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleChairmanChange = (index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index].chairman[field] = value;
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleViceChairmanChange = (field, value) => {
        setData({
            ...data,
            structure: {
                ...data.structure,
                vice_chairman: { ...data.structure.vice_chairman, [field]: value },
            },
        });
    };

    const addMember = (commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members.push({ name: '', photo: null });
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const removeMember = (commissionIndex, memberIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members = updatedCommissions[commissionIndex].members.filter((_, i) => i !== memberIndex);
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleMemberChange = (commissionIndex, memberIndex, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members[memberIndex][field] = value;
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const addWorkProgram = (commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs.push('');
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleWorkProgramChange = (commissionIndex, programIndex, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs[programIndex] = value;
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const removeWorkProgram = (commissionIndex, programIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs = updatedCommissions[
            commissionIndex
        ].work_programs.filter((_, i) => i !== programIndex);
        setCommissions(updatedCommissions);
        setData({ ...data, structure: { ...data.structure, commissions: updatedCommissions } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!data.introduction.trim()) newErrors.introduction = 'Perkenalan wajib diisi.';
        if (!data.vision.trim()) newErrors.vision = 'Visi wajib diisi.';
        if (!data.mission.every(m => m.trim())) newErrors.mission = 'Setiap misi wajib diisi.';
        if (!data.structure.chairman.name.trim()) newErrors.chairman_name = 'Nama ketua wajib diisi.';
        if (!data.structure.vice_chairman.name.trim()) newErrors.vice_chairman_name = 'Nama wakil ketua wajib diisi.';
        if (!data.structure.secretary.name.trim()) newErrors.secretary_name = 'Nama sekretaris wajib diisi.';
        if (data.structure.commissions.some(com => !com.name.trim())) newErrors.commissions_name = 'Nama komisi wajib diisi.';
        if (data.structure.commissions.some(com => !com.chairman.name.trim())) newErrors.commissions_chairman = 'Nama ketua komisi wajib diisi.';
        if (data.structure.commissions.some(com => com.members.some(m => !m.name.trim()))) newErrors.members_name = 'Nama anggota komisi wajib diisi.';
        if (data.structure.commissions.some(com => com.work_programs.some(p => !p.trim()))) newErrors.work_programs = 'Program kerja wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('introduction', data.introduction);
            formDataToSend.append('vision', data.vision);
            formDataToSend.append('mission', JSON.stringify(data.mission));
            formDataToSend.append('structure', JSON.stringify(data.structure));
            formDataToSend.append('recruitment_status', data.recruitment_status);

            if (data.logo) formDataToSend.append('logo', data.logo);
            if (data.structure.chairman.photo) formDataToSend.append('chairman_photo', data.structure.chairman.photo);
            if (data.structure.vice_chairman.photo) formDataToSend.append('vice_chairman_photo', data.structure.vice_chairman.photo);
            if (data.structure.secretary.photo) formDataToSend.append('secretary_photo', data.structure.secretary.photo);

            data.structure.commissions.forEach((commission, commissionIndex) => {
                if (commission.chairman.photo) {
                    formDataToSend.append(`commissions[${commissionIndex}][chairman_photo]`, commission.chairman.photo);
                }
                commission.members.forEach((member, memberIndex) => {
                    if (member.photo) {
                        formDataToSend.append(
                            `commissions[${commissionIndex}][members][${memberIndex}][photo]`,
                            member.photo
                        );
                    }
                });
            });

            await axios.post(route('admin.mpm.store'), formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setNotification({
                show: true,
                type: 'success',
                message: 'Data MPM berhasil ditambahkan!',
            });

            // Reset form
            setData({
                introduction: '',
                vision: '',
                mission: [''],
                structure: {
                    chairman: { name: '', photo: null },
                    vice_chairman: { name: '', photo: null },
                    secretary: { name: '', photo: null },
                    commissions: [],
                },
                recruitment_status: 'OPEN',
                logo: null,
            });
            setMissionFields(['']);
            setCommissions([]);

            // Redirect after 1.5 seconds
            setTimeout(() => {
                router.visit(route('admin.mpm.index'));
            }, 1500);
        } catch (error) {
            console.error('Error submitting form:', error);

            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: 'Gagal menambahkan data MPM: ' + (error.response?.data?.message || 'Terjadi kesalahan.'),
                });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Tambah Data MPM" />

            {/* Notification */}
            {notification.show && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${
                        notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                    }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${
                                    notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                {notification.type === 'success' ? (
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
                                className={`text-sm font-medium ${
                                    notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notification.type === 'success'
                                        ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500'
                                        : 'text-rose-500 hover:bg-rose-100 focus:ring-rose-500'
                                } focus:outline-none focus:ring-2`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg
                                    className="h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
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

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Tambah Data MPM
                            </h1>
                            <p className="text-gray-500 mt-1">Tambah data baru untuk MPM</p>
                        </div>
                        <Link
                            href={route('admin.mpm.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            ← Kembali
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        {mpmExists && (
                            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                                <h3 className="font-bold">Peringatan:</h3>
                                <p>Data MPM sudah ada. Menambahkan data baru akan menggantikan data sebelumnya.</p>
                            </div>
                        )}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                <h3 className="font-bold">Terjadi Kesalahan:</h3>
                                <ul className="list-disc pl-5">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>
                                            {key}: {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Section: Visi & Misi */}
                            <div className="border-t-2 border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Visi & Misi</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Perkenalan MPM <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.introduction}
                                        onChange={(e) => setData({ ...data, introduction: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.introduction
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        rows="4"
                                        placeholder="Masukkan perkenalan MPM"
                                    />
                                    {errors.introduction && (
                                        <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">Logo MPM</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData({ ...data, logo: e.target.files[0] })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ketua <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.structure.chairman.name}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                structure: {
                                                    ...data.structure,
                                                    chairman: { ...data.structure.chairman, name: e.target.value },
                                                },
                                            })
                                        }
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.chairman_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama ketua"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                structure: {
                                                    ...data.structure,
                                                    chairman: { ...data.structure.chairman, photo: e.target.files[0] },
                                                },
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {errors.chairman_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.chairman_name}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Wakil Ketua <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.structure.vice_chairman.name}
                                        onChange={(e) =>
                                            handleViceChairmanChange('name', e.target.value)
                                        }
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.vice_chairman_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama wakil ketua"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            handleViceChairmanChange('photo', e.target.files[0])
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {errors.vice_chairman_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.vice_chairman_name}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sekretaris <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.structure.secretary.name}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                structure: {
                                                    ...data.structure,
                                                    secretary: { ...data.structure.secretary, name: e.target.value },
                                                },
                                            })
                                        }
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.secretary_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama sekretaris"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                structure: {
                                                    ...data.structure,
                                                    secretary: { ...data.structure.secretary, photo: e.target.files[0] },
                                                },
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {errors.secretary_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.secretary_name}</p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Visi <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.vision}
                                        onChange={(e) => setData({ ...data, vision: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.vision
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        rows="4"
                                        placeholder="Masukkan visi MPM"
                                    />
                                    {errors.vision && <p className="text-red-500 text-xs mt-1">{errors.vision}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Misi <span className="text-red-500">*</span>
                                    </label>
                                    {missionFields.map((mission, index) => (
                                        <div key={index} className="flex space-x-4 mt-2">
                                            <input
                                                type="text"
                                                value={mission}
                                                onChange={(e) => handleMissionChange(index, e.target.value)}
                                                placeholder={`Misi ${index + 1}`}
                                                className={`block w-full rounded-md px-4 py-3 border transition ${
                                                    errors.mission
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeMissionField(index)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                    {errors.mission && <p className="text-red-500 text-xs mt-1">{errors.mission}</p>}
                                    <button
                                        type="button"
                                        onClick={addMissionField}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Tambah Misi
                                    </button>
                                </div>
                            </div>

                            {/* Section: Struktur Komisi MPM */}
                            <div className="border-t-2 border-gray-200 pt-6 mt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Struktur Komisi MPM</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Komisi</label>
                                    {commissions.map((commission, commissionIndex) => (
                                        <div
                                            key={commissionIndex}
                                            className="border-2 border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-gray-50"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <input
                                                    type="text"
                                                    value={commission.name}
                                                    onChange={(e) =>
                                                        handleCommissionChange(commissionIndex, 'name', e.target.value)
                                                    }
                                                    placeholder="Nama Komisi"
                                                    className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                                        errors.commissions_name
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeCommission(commissionIndex)}
                                                    className="ml-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                            {errors.commissions_name && (
                                                <p className="text-red-500 text-xs mt-1">{errors.commissions_name}</p>
                                            )}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Ketua Komisi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={commission.chairman.name}
                                                    onChange={(e) =>
                                                        handleChairmanChange(commissionIndex, 'name', e.target.value)
                                                    }
                                                    placeholder="Nama Ketua Komisi"
                                                    className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                                        errors.commissions_chairman
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        handleChairmanChange(commissionIndex, 'photo', e.target.files[0])
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    accept="image/*"
                                                />
                                                {errors.commissions_chairman && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.commissions_chairman}</p>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Anggota
                                                </label>
                                                {commission.members.map((member, memberIndex) => (
                                                    <div key={memberIndex} className="flex space-x-4 mt-2">
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) =>
                                                                handleMemberChange(
                                                                    commissionIndex,
                                                                    memberIndex,
                                                                    'name',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder={`Anggota ${memberIndex + 1}`}
                                                            className={`block w-full rounded-md px-4 py-3 border transition ${
                                                                errors.members_name
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        <input
                                                            type="file"
                                                            onChange={(e) =>
                                                                handleMemberChange(
                                                                    commissionIndex,
                                                                    memberIndex,
                                                                    'photo',
                                                                    e.target.files[0]
                                                                )
                                                            }
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            accept="image/*"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMember(commissionIndex, memberIndex)}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                                {errors.members_name && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.members_name}</p>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => addMember(commissionIndex)}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Tambah Anggota
                                                </button>
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Program Kerja
                                                </label>
                                                {commission.work_programs.map((program, programIndex) => (
                                                    <div key={programIndex} className="flex space-x-4 mt-2">
                                                        <input
                                                            type="text"
                                                            value={program}
                                                            onChange={(e) =>
                                                                handleWorkProgramChange(
                                                                    commissionIndex,
                                                                    programIndex,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder={`Program Kerja ${programIndex + 1}`}
                                                            className={`block w-full rounded-md px-4 py-3 border transition ${
                                                                errors.work_programs
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeWorkProgram(commissionIndex, programIndex)}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                                {errors.work_programs && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.work_programs}</p>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => addWorkProgram(commissionIndex)}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Tambah Program Kerja
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addCommission}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Tambah Komisi
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">
                                    Status Rekrutmen <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => setData({ ...data, recruitment_status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {errors.recruitment_status && (
                                    <p className="text-red-500 text-xs mt-1">{errors.recruitment_status}</p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <Link
                                    href={route('admin.mpm.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}