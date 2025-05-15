import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useReducer } from 'react';

const dataReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_STRUCTURE_FIELD':
            return {
                ...state,
                structure: { ...state.structure, [action.field]: { ...state.structure[action.field], [action.subField]: action.value } },
            };
        case 'SET_COMMISSION':
            return {
                ...state,
                structure: { ...state.structure, commissions: action.value },
            };
        case 'SET_MISSION':
            return { ...state, mission: action.value };
        case 'RESET':
            return {
                introduction: '',
                vision: '',
                mission: [''],
                structure: {
                    chairman: { name: '', photo: null, preview: null },
                    vice_chairman: { name: '', photo: null, preview: null },
                    secretary: { name: '', photo: null, preview: null },
                    commissions: [],
                },
                recruitment_status: 'OPEN',
                management_period: '',
                is_active: true,
                logo: null,
                logoPreview: null,
            };
        default:
            return state;
    }
};

export default function Edit({ auth, userRole, permissions, mpm, navigation }) {
    const initialData = {
        introduction: mpm.introduction || '',
        vision: mpm.vision || '',
        mission: Array.isArray(mpm.mission) ? mpm.mission : [''],
        structure: {
            chairman: {
                name: mpm.structure?.chairman?.name || '',
                photo: null,
                preview: mpm.structure?.chairman?.photo ? `/storage/${mpm.structure.chairman.photo}` : null,
            },
            vice_chairman: {
                name: mpm.structure?.vice_chairman?.name || '',
                photo: null,
                preview: mpm.structure?.vice_chairman?.photo ? `/storage/${mpm.structure.vice_chairman.photo}` : null,
            },
            secretary: {
                name: mpm.structure?.secretary?.name || '',
                photo: null,
                preview: mpm.structure?.secretary?.photo ? `/storage/${mpm.structure.secretary.photo}` : null,
            },
            commissions: mpm.structure?.commissions?.map(commission => ({
                ...commission,
                chairman: {
                    ...commission.chairman,
                    photo: null,
                    preview: commission.chairman.photo ? `/storage/${commission.chairman.photo}` : null,
                },
                members: commission.members.map(member => ({
                    ...member,
                    photo: null,
                    preview: member.photo ? `/storage/${member.photo}` : null,
                })),
            })) || [],
        },
        recruitment_status: mpm.recruitment_status || 'OPEN',
        management_period: mpm.management_period || '',
        is_active: mpm.is_active !== undefined ? mpm.is_active : true,
        logo: null,
        logoPreview: mpm.logo ? `/storage/${mpm.logo}` : null,
    };

    const [data, dispatch] = useReducer(dataReducer, initialData);
    const [missionFields, setMissionFields] = useState(initialData.mission);
    const [commissions, setCommissions] = useState(initialData.structure.commissions);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const validateFile = (file) => {
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!file) return true;
        if (!allowedTypes.includes(file.type)) return 'File harus berupa gambar (JPEG/PNG/JPG).';
        if (file.size > maxSize) return 'Ukuran file maksimum adalah 2MB.';
        return true;
    };

    const handleFileChange = useCallback((field, file, subField = null) => {
        const validationResult = validateFile(file);
        if (typeof validationResult === 'string') {
            setErrors((prev) => ({ ...prev, [field]: validationResult }));
            return;
        }

        const preview = file ? URL.createObjectURL(file) : null;
        if (subField) {
            dispatch({ type: 'SET_STRUCTURE_FIELD', field, subField: 'photo', value: file });
            dispatch({ type: 'SET_STRUCTURE_FIELD', field, subField: 'preview', value: preview });
        } else {
            dispatch({ type: 'SET_FIELD', field, value: file });
            dispatch({ type: 'SET_FIELD', field: 'logoPreview', value: preview });
        }
    }, []);

    const handleMissionChange = useCallback((index, value) => {
        const updatedMissions = [...missionFields];
        updatedMissions[index] = value;
        setMissionFields(updatedMissions);
        dispatch({ type: 'SET_MISSION', value: updatedMissions });
    }, [missionFields]);

    const addMissionField = useCallback(() => {
        setMissionFields((prev) => [...prev, '']);
    }, []);

    const removeMissionField = useCallback((index) => {
        const updatedMissions = missionFields.filter((_, i) => i !== index);
        setMissionFields(updatedMissions);
        dispatch({ type: 'SET_MISSION', value: updatedMissions });
    }, [missionFields]);

    const addCommission = useCallback(() => {
        const newCommission = {
            name: '',
            chairman: { name: '', photo: null, preview: null },
            members: [],
            work_programs: [''],
        };
        const updatedCommissions = [...commissions, newCommission];
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const removeCommission = useCallback((index) => {
        const updatedCommissions = commissions.filter((_, i) => i !== index);
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleCommissionChange = useCallback((index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index][field] = value;
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleChairmanChange = useCallback((index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index].chairman[field] = value;
        if (field === 'photo') {
            const preview = value ? URL.createObjectURL(value) : null;
            updatedCommissions[index].chairman.preview = preview;
        }
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleViceChairmanChange = useCallback((subField, value) => {
        if (subField === 'photo') {
            handleFileChange('vice_chairman', value, subField);
        } else {
            dispatch({ type: 'SET_STRUCTURE_FIELD', field: 'vice_chairman', subField, value });
        }
    }, [handleFileChange]);

    const addMember = useCallback((commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members.push({ name: '', photo: null, preview: null });
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const removeMember = useCallback((commissionIndex, memberIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members = updatedCommissions[commissionIndex].members.filter((_, i) => i !== memberIndex);
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleMemberChange = useCallback((commissionIndex, memberIndex, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members[memberIndex][field] = value;
        if (field === 'photo') {
            const preview = value ? URL.createObjectURL(value) : null;
            updatedCommissions[commissionIndex].members[memberIndex].preview = preview;
        }
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const addWorkProgram = useCallback((commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs.push('');
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleWorkProgramChange = useCallback((commissionIndex, programIndex, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs[programIndex] = value;
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const removeWorkProgram = useCallback((commissionIndex, programIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs = updatedCommissions[commissionIndex].work_programs.filter((_, i) => i !== programIndex);
        setCommissions(updatedCommissions);
        dispatch({ type: 'SET_COMMISSION', value: updatedCommissions });
    }, [commissions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

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
        if (!data.management_period.trim()) newErrors.management_period = 'Periode manajemen wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('introduction', data.introduction);
        formData.append('vision', data.vision);
        formData.append('mission', JSON.stringify(data.mission));
        formData.append('structure', JSON.stringify(data.structure));
        formData.append('recruitment_status', data.recruitment_status);
        formData.append('management_period', data.management_period);
        formData.append('is_active', data.is_active ? '1' : '0');

        if (data.logo instanceof File) formData.append('logo', data.logo);
        if (data.structure.chairman.photo instanceof File) formData.append('chairman_photo', data.structure.chairman.photo);
        if (data.structure.vice_chairman.photo instanceof File) formData.append('vice_chairman_photo', data.structure.vice_chairman.photo);
        if (data.structure.secretary.photo instanceof File) formData.append('secretary_photo', data.structure.secretary.photo);

        data.structure.commissions.forEach((commission, commissionIndex) => {
            if (commission.chairman.photo instanceof File) {
                formData.append(`commissions[${commissionIndex}][chairman_photo]`, commission.chairman.photo);
            }
            commission.members.forEach((member, memberIndex) => {
                if (member.photo instanceof File) {
                    formData.append(`commissions[${commissionIndex}][members][${memberIndex}][photo]`, member.photo);
                }
            });
        });

        router.post(route('admin.mpm.update', mpm.id), formData, {
            onSuccess: () => {
                setNotification({ show: true, type: 'success', message: 'Data MPM berhasil diperbarui.' });
                setTimeout(() => router.visit(route('admin.mpm.index')), 1500);
            },
            onError: (errors) => {
                setErrors(errors);
                setNotification({ show: true, type: 'error', message: 'Gagal memperbarui data MPM.' });
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Edit Data MPM" />

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
                                className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
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
                            <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setNotification({ show: false, type: '', message: '' })}
                                className={`inline-flex rounded-md p-1.5 ${
                                    notification.type === 'success'
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

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Edit Data MPM
                            </h1>
                            <p className="text-gray-500 mt-1">Perbarui data organisasi MPM</p>
                        </div>
                        <Link
                            href={route('admin.mpm.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                <h3 className="font-bold">Terjadi Kesalahan:</h3>
                                <ul className="list-disc pl-5">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                            <div className="border-t-2 border-gray-200 pt-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Informasi Dasar MPM</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Perkenalan MPM <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.introduction}
                                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'introduction', value: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.introduction
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        rows="4"
                                        placeholder="Masukkan perkenalan MPM"
                                    />
                                    {errors.introduction && <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">Logo MPM</label>
                                    {data.logoPreview && (
                                        <img src={data.logoPreview} alt="Logo Preview" className="mt-2 w-20 h-20 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                    )}
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('logo', e.target.files[0])}
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
                                        onChange={(e) => dispatch({ type: 'SET_STRUCTURE_FIELD', field: 'chairman', subField: 'name', value: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.chairman_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama ketua"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('chairman', e.target.files[0], 'photo')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {data.structure.chairman.preview && (
                                        <img src={data.structure.chairman.preview} alt="Chairman Preview" className="mt-2 w-16 h-16 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                    )}
                                    {errors.chairman_name && <p className="text-red-500 text-xs mt-1">{errors.chairman_name}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Wakil Ketua <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.structure.vice_chairman.name}
                                        onChange={(e) => handleViceChairmanChange('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.vice_chairman_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama wakil ketua"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => handleViceChairmanChange('photo', e.target.files[0])}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {data.structure.vice_chairman.preview && (
                                        <img src={data.structure.vice_chairman.preview} alt="Vice Chairman Preview" className="mt-2 w-16 h-16 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                    )}
                                    {errors.vice_chairman_name && <p className="text-red-500 text-xs mt-1">{errors.vice_chairman_name}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sekretaris <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.structure.secretary.name}
                                        onChange={(e) => dispatch({ type: 'SET_STRUCTURE_FIELD', field: 'secretary', subField: 'name', value: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.secretary_name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama sekretaris"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('secretary', e.target.files[0], 'photo')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    {data.structure.secretary.preview && (
                                        <img src={data.structure.secretary.preview} alt="Secretary Preview" className="mt-2 w-16 h-16 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                    )}
                                    {errors.secretary_name && <p className="text-red-500 text-xs mt-1">{errors.secretary_name}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Visi <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.vision}
                                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'vision', value: e.target.value })}
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
                                        <div key={index} className="flex space-x-4 mt-2 items-center">
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
                                            {missionFields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMissionField(index)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            )}
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

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Periode Manajemen <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.management_period}
                                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'management_period', value: e.target.value })}
                                        className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                            errors.management_period
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan periode manajemen (contoh: 2023-2024)"
                                    />
                                    {errors.management_period && <p className="text-red-500 text-xs mt-1">{errors.management_period}</p>}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status Aktif <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.is_active ? '1' : '0'}
                                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'is_active', value: e.target.value === '1' })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="1">Aktif</option>
                                        <option value="0">Tidak Aktif</option>
                                    </select>
                                    {errors.is_active && <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>}
                                </div>
                            </div>

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
                                                    onChange={(e) => handleCommissionChange(commissionIndex, 'name', e.target.value)}
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
                                            {errors.commissions_name && <p className="text-red-500 text-xs mt-1">{errors.commissions_name}</p>}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Ketua Komisi <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={commission.chairman.name}
                                                    onChange={(e) => handleChairmanChange(commissionIndex, 'name', e.target.value)}
                                                    placeholder="Nama Ketua Komisi"
                                                    className={`mt-1 block w-full rounded-md px-4 py-3 border transition ${
                                                        errors.commissions_chairman
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleChairmanChange(commissionIndex, 'photo', e.target.files[0])}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    accept="image/*"
                                                />
                                                {commission.chairman.preview && (
                                                    <img src={commission.chairman.preview} alt="Chairman Preview" className="mt-2 w-16 h-16 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                                )}
                                                {errors.commissions_chairman && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.commissions_chairman}</p>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Anggota <span className="text-red-500">*</span>
                                                </label>
                                                {commission.members.map((member, memberIndex) => (
                                                    <div key={memberIndex} className="flex space-x-4 mt-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => handleMemberChange(commissionIndex, memberIndex, 'name', e.target.value)}
                                                            placeholder={`Anggota ${memberIndex + 1}`}
                                                            className={`block w-full rounded-md px-4 py-3 border transition ${
                                                                errors.members_name
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleMemberChange(commissionIndex, memberIndex, 'photo', e.target.files[0])}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            accept="image/*"
                                                        />
                                                        {member.preview && (
                                                            <img src={member.preview} alt="Member Preview" className="mt-2 w-12 h-12 object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMember(commissionIndex, memberIndex)}
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ))}
                                                {errors.members_name && <p className="text-red-500 text-xs mt-1">{errors.members_name}</p>}
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
                                                    Program Kerja <span className="text-red-500">*</span>
                                                </label>
                                                {commission.work_programs.map((program, programIndex) => (
                                                    <div key={programIndex} className="flex space-x-4 mt-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={program}
                                                            onChange={(e) => handleWorkProgramChange(commissionIndex, programIndex, e.target.value)}
                                                            placeholder={`Program Kerja ${programIndex + 1}`}
                                                            className={`block w-full rounded-md px-4 py-3 border transition ${
                                                                errors.work_programs
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        {commission.work_programs.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeWorkProgram(commissionIndex, programIndex)}
                                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {errors.work_programs && <p className="text-red-500 text-xs mt-1">{errors.work_programs}</p>}
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
                                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'recruitment_status', value: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {errors.recruitment_status && <p className="text-red-500 text-xs mt-1">{errors.recruitment_status}</p>}
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
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
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