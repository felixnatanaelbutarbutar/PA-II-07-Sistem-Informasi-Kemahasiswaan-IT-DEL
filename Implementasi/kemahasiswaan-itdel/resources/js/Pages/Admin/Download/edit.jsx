import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ auth, userRole, permissions, mpm, navigation }) {
    const { flash } = usePage().props ?? {};
    const [data, setData] = useState({
        introduction: mpm.introduction || '',
        vision: mpm.vision || '',
        mission: mpm.mission || [''],
        structure: mpm.structure || {
            chairman: { name: '', photo: null },
            secretary: { name: '', photo: null },
            commissions: [],
        },
        recruitment_status: mpm.recruitment_status || 'OPEN',
        logo: null,
    });
    const [missionFields, setMissionFields] = useState(data.mission || ['']);
    const [commissions, setCommissions] = useState(data.structure?.commissions || []);
    const [errors, setErrors] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    // Efek untuk menangani inisialisasi data dan notifikasi
    useEffect(() => {
        setMissionFields(data.mission || ['']);
        setCommissions(data.structure?.commissions || []);
    }, [mpm]);

    useEffect(() => {
        if (flash) {
            if (flash.success) {
                setNotificationMessage(flash.success);
                setNotificationType('success');
                setShowNotification(true);
            } else if (flash.error) {
                setNotificationMessage(flash.error);
                setNotificationType('error');
                setShowNotification(true);
            }

            if (flash.success || flash.error) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [flash]);

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

    const addMember = (commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members.push({ name: '', photo: null });
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('introduction', data.introduction);
        formData.append('vision', data.vision);
        formData.append('mission', JSON.stringify(data.mission));
        formData.append('structure', JSON.stringify(data.structure));
        formData.append('recruitment_status', data.recruitment_status);

        if (data.logo) {
            formData.append('logo', data.logo);
        }

        if (data.structure.chairman.photo && typeof data.structure.chairman.photo !== 'string') {
            formData.append('chairman_photo', data.structure.chairman.photo);
        }

        if (data.structure.secretary.photo && typeof data.structure.secretary.photo !== 'string') {
            formData.append('secretary_photo', data.structure.secretary.photo);
        }

        data.structure.commissions.forEach((commission, commissionIndex) => {
            if (commission.chairman.photo && typeof commission.chairman.photo !== 'string') {
                formData.append(`commissions[${commissionIndex}][chairman_photo]`, commission.chairman.photo);
            }
            commission.members.forEach((member, memberIndex) => {
                if (member.photo && typeof member.photo !== 'string') {
                    formData.append(
                        `commissions[${commissionIndex}][members][${memberIndex}][photo]`,
                        member.photo
                    );
                }
            });
        });

        router.put(route('admin.mpm.update', mpm.id), formData, {
            onError: (errors) => {
                setErrors(errors);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Edit Data MPM" />

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed top-4 right-4 z-50 max-w-md border-l-4 px-6 py-4 rounded-lg shadow-xl transition-all transform animate-slide-in-right ${notificationType === 'success'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-500'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-500'
                        }`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className={`h-5 w-5 ${notificationType === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                    }`}
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
                                className={`text-sm font-medium ${notificationType === 'success' ? 'text-emerald-800' : 'text-rose-800'
                                    }`}
                            >
                                {notificationMessage}
                            </p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setShowNotification(false)}
                                    className={`inline-flex rounded-md p-1.5 ${notificationType === 'success'
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
                </div>
            )}

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Data MPM</h1>
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perkenalan MPM</label>
                                <textarea
                                    value={data.introduction}
                                    onChange={(e) => setData({ ...data, introduction: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.introduction && (
                                    <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo MPM</label>
                                {mpm.logo && (
                                    <div className="mb-2">
                                        <img
                                            src={`/storage/${mpm.logo}`}
                                            alt="Logo MPM"
                                            className="h-20 w-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => setData({ ...data, logo: e.target.files[0] })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    accept="image/*"
                                />
                                {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ketua</label>
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {data.structure.chairman.photo && typeof data.structure.chairman.photo === 'string' && (
                                    <div className="mt-2">
                                        <img
                                            src={`/storage/${data.structure.chairman.photo}`}
                                            alt="Foto Ketua"
                                            className="h-16 w-16 object-cover rounded-full"
                                        />
                                    </div>
                                )}
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sekretaris</label>
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {data.structure.secretary.photo &&
                                    typeof data.structure.secretary.photo === 'string' && (
                                        <div className="mt-2">
                                            <img
                                                src={`/storage/${data.structure.secretary.photo}`}
                                                alt="Foto Sekretaris"
                                                className="h-16 w-16 object-cover rounded-full"
                                            />
                                        </div>
                                    )}
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Komisi</label>
                                {commissions.map((commission, commissionIndex) => (
                                    <div key={commissionIndex} className="border p-4 rounded-lg mt-2">
                                        <input
                                            type="text"
                                            value={commission.name}
                                            onChange={(e) =>
                                                handleCommissionChange(commissionIndex, 'name', e.target.value)
                                            }
                                            placeholder="Nama Komisi"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <div className="mt-2">
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
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                            {commission.chairman.photo &&
                                                typeof commission.chairman.photo === 'string' && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={`/storage/${commission.chairman.photo}`}
                                                            alt="Foto Ketua Komisi"
                                                            className="h-16 w-16 object-cover rounded-full"
                                                        />
                                                    </div>
                                                )}
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleChairmanChange(commissionIndex, 'photo', e.target.files[0])
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                accept="image/*"
                                            />
                                        </div>
                                        <div className="mt-2">
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
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />
                                                    {member.photo && typeof member.photo === 'string' && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={`/storage/${member.photo}`}
                                                                alt="Foto Anggota"
                                                                className="h-12 w-12 object-cover rounded-full"
                                                            />
                                                        </div>
                                                    )}
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
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addMember(commissionIndex)}
                                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Tambah Anggota
                                            </button>
                                        </div>
                                        <div className="mt-2">
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
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
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
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Komisi
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Visi</label>
                                <textarea
                                    value={data.vision}
                                    onChange={(e) => setData({ ...data, vision: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Misi</label>
                                {missionFields.map((mission, index) => (
                                    <div key={index} className="flex space-x-4 mt-2">
                                        <input
                                            type="text"
                                            value={mission}
                                            onChange={(e) => handleMissionChange(index, e.target.value)}
                                            placeholder={`Misi ${index + 1}`}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
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
                                <button
                                    type="button"
                                    onClick={addMissionField}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Misi
                                </button>
                                {errors.mission && <p className="text-red-500 text-sm mt-1">{errors.mission}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status Rekrutmen
                                </label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => setData({ ...data, recruitment_status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {errors.recruitment_status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.recruitment_status}</p>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Simpan
                                </button>
                                <a
                                    href={route('admin.mpm.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                >
                                    Kembali
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
