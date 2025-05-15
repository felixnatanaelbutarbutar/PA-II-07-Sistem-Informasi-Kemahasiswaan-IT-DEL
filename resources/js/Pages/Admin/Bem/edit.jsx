import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ auth, userRole, permissions, bem, navigation }) {
    const [data, setData] = useState({
        introduction: bem.introduction || '',
        vision: bem.vision || '',
        mission: bem.mission || [''],
        structure: {
            positions: bem.structure?.positions || [],
            departments: bem.structure?.departments || [],
        },
        work_programs: {
            description: bem.work_programs?.description || '',
            programs: bem.work_programs?.programs || [''],
        },
        logo: null,
        recruitment_status: bem.recruitment_status || 'CLOSED',
    });
    const [positions, setPositions] = useState(data.structure.positions);
    const [departments, setDepartments] = useState(data.structure.departments);
    const [missionFields, setMissionFields] = useState(data.mission);
    const [workProgramFields, setWorkProgramFields] = useState(data.work_programs.programs);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setPositions(data.structure.positions);
        setDepartments(data.structure.departments);
        setMissionFields(data.mission);
        setWorkProgramFields(data.work_programs.programs);
    }, [bem]);

    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const addPosition = () => {
        const newPositions = [...positions, { title: '', name: '', photo: null }];
        setPositions(newPositions);
        setData({ ...data, structure: { ...data.structure, positions: newPositions } });
    };

    const removePosition = (positionIndex) => {
        const newPositions = positions.filter((_, i) => i !== positionIndex);
        setPositions(newPositions);
        setData({ ...data, structure: { ...data.structure, positions: newPositions } });
    };

    const handlePositionChange = (positionIndex, key, value) => {
        const newPositions = [...positions];
        newPositions[positionIndex][key] = value;
        setPositions(newPositions);
        setData({ ...data, structure: { ...data.structure, positions: newPositions } });
    };

    const addDepartment = () => {
        const newDepartments = [...departments, { name: '', members: [] }];
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

    const removeDepartment = (deptIndex) => {
        const newDepartments = departments.filter((_, i) => i !== deptIndex);
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

    const handleDepartmentChange = (deptIndex, key, value) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex][key] = value;
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

    const addMember = (deptIndex) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members.push({ position: '', name: '', photo: null });
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

    const removeMember = (deptIndex, memberIndex) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members = newDepartments[deptIndex].members.filter((_, i) => i !== memberIndex);
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

    const handleMemberChange = (deptIndex, memberIndex, key, value) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members[memberIndex][key] = value;
        setDepartments(newDepartments);
        setData({ ...data, structure: { ...data.structure, departments: newDepartments } });
    };

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

    const handleWorkProgramChange = (index, value) => {
        const updatedPrograms = [...workProgramFields];
        updatedPrograms[index] = value;
        setWorkProgramFields(updatedPrograms);
        setData({ ...data, work_programs: { ...data.work_programs, programs: updatedPrograms } });
    };

    const addWorkProgramField = () => {
        setWorkProgramFields([...workProgramFields, '']);
    };

    const removeWorkProgramField = (index) => {
        const updatedPrograms = workProgramFields.filter((_, i) => i !== index);
        setWorkProgramFields(updatedPrograms);
        setData({ ...data, work_programs: { ...data.work_programs, programs: updatedPrograms } });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Client-side validation
        const newErrors = {};

        // Validate introduction
        if (!data.introduction.trim()) newErrors.introduction = 'Perkenalan wajib diisi.';

        // Validate vision
        if (!data.vision.trim()) newErrors.vision = 'Visi wajib diisi.';

        // Validate mission
        if (missionFields.length === 0) {
            newErrors.mission = 'Setidaknya satu misi harus diisi.';
        } else {
            missionFields.forEach((mission, index) => {
                if (!mission.trim()) {
                    newErrors[`mission_${index}`] = `Misi ${index + 1} wajib diisi.`;
                }
            });
        }

        // Validate structure (positions and departments)
        if (positions.length > 0) {
            positions.forEach((position, index) => {
                if (!position.title.trim()) {
                    newErrors[`position_title_${index}`] = `Nama jabatan ${index + 1} wajib diisi.`;
                }
                if (!position.name.trim()) {
                    newErrors[`position_name_${index}`] = `Nama pada jabatan ${index + 1} wajib diisi.`;
                }
            });
        }

        if (departments.length > 0) {
            departments.forEach((dept, deptIndex) => {
                if (!dept.name.trim()) {
                    newErrors[`dept_name_${deptIndex}`] = `Nama departemen ${deptIndex + 1} wajib diisi.`;
                }
                if (dept.members.length > 0) {
                    dept.members.forEach((member, memberIndex) => {
                        if (!member.position.trim()) {
                            newErrors[`member_position_${deptIndex}_${memberIndex}`] = `Jabatan anggota ${memberIndex + 1} di departemen ${deptIndex + 1} wajib diisi.`;
                        }
                        if (!member.name.trim()) {
                            newErrors[`member_name_${deptIndex}_${memberIndex}`] = `Nama anggota ${memberIndex + 1} di departemen ${deptIndex + 1} wajib diisi.`;
                        }
                    });
                }
            });
        }

        // Validate work programs
        if (!data.work_programs.description.trim()) {
            newErrors.work_programs_description = 'Deskripsi program kerja wajib diisi.';
        }
        if (workProgramFields.length === 0) {
            newErrors.work_programs = 'Setidaknya satu program kerja harus diisi.';
        } else {
            workProgramFields.forEach((program, index) => {
                if (!program.trim()) {
                    newErrors[`work_program_${index}`] = `Program kerja ${index + 1} wajib diisi.`;
                }
            });
        }

        // Validate recruitment status
        if (!data.recruitment_status) {
            newErrors.recruitment_status = 'Status rekrutmen wajib dipilih.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('introduction', data.introduction);
        formData.append('vision', data.vision);
        formData.append('mission', JSON.stringify(data.mission));
        formData.append('work_programs', JSON.stringify(data.work_programs));
        formData.append('recruitment_status', data.recruitment_status);

        if (data.logo) {
            formData.append('logo', data.logo);
        }

        const structureToSend = {
            positions: data.structure.positions.map((position) => ({
                title: position.title,
                name: position.name,
                photo: position.photo && typeof position.photo === 'string' ? position.photo : null,
            })),
            departments: data.structure.departments.map((dept) => ({
                name: dept.name,
                members: dept.members.map((member) => ({
                    position: member.position,
                    name: member.name,
                    photo: member.photo && typeof member.photo === 'string' ? member.photo : null,
                })),
            })),
        };

        data.structure.positions.forEach((position, positionIndex) => {
            if (position.photo && position.photo instanceof File) {
                formData.append(`positions[${positionIndex}]`, position.photo);
            }
        });

        data.structure.departments.forEach((dept, deptIndex) => {
            dept.members.forEach((member, memberIndex) => {
                if (member.photo && member.photo instanceof File) {
                    formData.append(`departments[${deptIndex}][members][${memberIndex}]`, member.photo);
                }
            });
        });

        formData.append('structure', JSON.stringify(structureToSend));
        formData.append('_method', 'PUT');

        router.post(
            route('admin.bem.update', bem.id),
            formData,
            {
                onSuccess: () => {
                    setNotification({
                        show: true,
                        type: 'success',
                        message: 'Data BEM berhasil diperbarui!',
                    });
                    setTimeout(() => {
                        router.visit(route('admin.bem.index'));
                    }, 1500);
                },
                onError: (serverErrors) => {
                    setErrors(serverErrors);
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal memperbarui data BEM. Silakan coba lagi.',
                    });
                    setIsSubmitting(false);
                },
                preserveScroll: true,
            }
        );
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Edit Data BEM" />

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

            <div className="py-12 max-w-5xl mx-auto px-6 sm:px-8">
                <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Edit Data BEM
                        </h1>
                        <p className="text-gray-500 mt-1">Perbarui informasi BEM untuk ditampilkan</p>
                    </div>
                    <Link
                        href={route('admin.bem.index')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                    >
                        ← Kembali
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Perkenalan BEM <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.introduction}
                                onChange={(e) => setData({ ...data, introduction: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.introduction
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                rows="4"
                                placeholder="Masukkan perkenalan BEM"
                            />
                            {errors.introduction && <p className="text-red-500 text-xs mt-1">{errors.introduction}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Logo BEM</label>
                            {bem.logo && (
                                <div className="mt-2">
                                    <img
                                        src={`/storage/${bem.logo}`}
                                        alt="Logo BEM"
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                onChange={(e) => setData({ ...data, logo: e.target.files[0] })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                accept="image/*"
                            />
                            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Visi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.vision}
                                onChange={(e) => setData({ ...data, vision: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.vision
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                rows="4"
                                placeholder="Masukkan visi BEM"
                            />
                            {errors.vision && <p className="text-red-500 text-xs mt-1">{errors.vision}</p>}
                        </div>

                        <div className="space-y-2">
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
                                        className={`block w-full px-4 py-3 border rounded-lg transition ${
                                            errors[`mission_${index}`]
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
                            {missionFields.map((_, index) => (
                                errors[`mission_${index}`] && (
                                    <p key={index} className="text-red-500 text-xs mt-1">{errors[`mission_${index}`]}</p>
                                )
                            ))}
                            <button
                                type="button"
                                onClick={addMissionField}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tambah Misi
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Struktur Organisasi <span className="text-red-500">*</span>
                            </label>

                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Jabatan</h3>
                                {positions.map((position, positionIndex) => (
                                    <div key={positionIndex} className="border p-4 rounded-lg mt-2">
                                        <div className="flex space-x-4 mt-2">
                                            <div className="w-1/3">
                                                <input
                                                    type="text"
                                                    value={position.title}
                                                    onChange={(e) => handlePositionChange(positionIndex, 'title', e.target.value)}
                                                    placeholder="Nama Jabatan (misalnya: Ketua BEM)"
                                                    className={`block w-full px-4 py-3 border rounded-lg transition ${
                                                        errors[`position_title_${positionIndex}`]
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors[`position_title_${positionIndex}`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`position_title_${positionIndex}`]}</p>
                                                )}
                                            </div>
                                            <div className="w-1/3">
                                                <input
                                                    type="text"
                                                    value={position.name}
                                                    onChange={(e) => handlePositionChange(positionIndex, 'name', e.target.value)}
                                                    placeholder="Nama"
                                                    className={`block w-full px-4 py-3 border rounded-lg transition ${
                                                        errors[`position_name_${positionIndex}`]
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors[`position_name_${positionIndex}`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`position_name_${positionIndex}`]}</p>
                                                )}
                                            </div>
                                            <div className="w-1/3">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handlePositionChange(positionIndex, 'photo', e.target.files[0])}
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                    accept="image/*"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removePosition(positionIndex)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Hapus Jabatan
                                            </button>
                                        </div>
                                        {position.photo && typeof position.photo === 'string' && (
                                            <div className="mt-2">
                                                <img
                                                    src={`/storage/${position.photo}`}
                                                    alt={position.name}
                                                    className="w-32 h-32 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addPosition}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Jabatan
                                </button>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Departemen</h3>
                                {departments.map((dept, deptIndex) => (
                                    <div key={deptIndex} className="border p-4 rounded-lg mt-2">
                                        <div className="flex space-x-4 mb-2">
                                            <div className="w-1/2">
                                                <input
                                                    type="text"
                                                    value={dept.name}
                                                    onChange={(e) => handleDepartmentChange(deptIndex, 'name', e.target.value)}
                                                    placeholder="Nama Departemen"
                                                    className={`block w-full px-4 py-3 border rounded-lg transition ${
                                                        errors[`dept_name_${deptIndex}`]
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {errors[`dept_name_${deptIndex}`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`dept_name_${deptIndex}`]}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDepartment(deptIndex)}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            >
                                                Hapus Departemen
                                            </button>
                                        </div>
                                        <div>
                                            <h4 className="text-md font-semibold">Anggota</h4>
                                            {dept.members.map((member, memberIndex) => (
                                                <div key={memberIndex} className="flex space-x-4 mt-2">
                                                    <div className="w-1/3">
                                                        <input
                                                            type="text"
                                                            value={member.position}
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'position', e.target.value)}
                                                            placeholder="Jabatan"
                                                            className={`block w-full px-4 py-3 border rounded-lg transition ${
                                                                errors[`member_position_${deptIndex}_${memberIndex}`]
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        {errors[`member_position_${deptIndex}_${memberIndex}`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`member_position_${deptIndex}_${memberIndex}`]}</p>
                                                        )}
                                                    </div>
                                                    <div className="w-1/3">
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'name', e.target.value)}
                                                            placeholder="Nama"
                                                            className={`block w-full px-4 py-3 border rounded-lg transition ${
                                                                errors[`member_name_${deptIndex}_${memberIndex}`]
                                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        />
                                                        {errors[`member_name_${deptIndex}_${memberIndex}`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`member_name_${deptIndex}_${memberIndex}`]}</p>
                                                        )}
                                                    </div>
                                                    <div className="w-1/3">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'photo', e.target.files[0])}
                                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                            accept="image/*"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(deptIndex, memberIndex)}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    >
                                                        Hapus Anggota
                                                    </button>
                                                </div>
                                            ))}
                                            {dept.members.map((member, memberIndex) => (
                                                member.photo && typeof member.photo === 'string' && (
                                                    <div key={memberIndex} className="mt-2">
                                                        <img
                                                            src={`/storage/${member.photo}`}
                                                            alt={member.name}
                                                            className="w-32 h-32 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addMember(deptIndex)}
                                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Tambah Anggota
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addDepartment}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Departemen
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deskripsi Program Kerja <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.work_programs.description}
                                onChange={(e) =>
                                    setData({ ...data, work_programs: { ...data.work_programs, description: e.target.value } })
                                }
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.work_programs_description
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                rows="4"
                                placeholder="Masukkan deskripsi program kerja"
                            />
                            {errors.work_programs_description && (
                                <p className="text-red-500 text-xs mt-1">{errors.work_programs_description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Program Kerja <span className="text-red-500">*</span>
                            </label>
                            {workProgramFields.map((program, index) => (
                                <div key={index} className="flex space-x-4 mt-2">
                                    <input
                                        type="text"
                                        value={program}
                                        onChange={(e) => handleWorkProgramChange(index, e.target.value)}
                                        placeholder={`Program Kerja ${index + 1}`}
                                        className={`block w-full px-4 py-3 border rounded-lg transition ${
                                            errors[`work_program_${index}`]
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeWorkProgramField(index)}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))}
                            {errors.work_programs && <p className="text-red-500 text-xs mt-1">{errors.work_programs}</p>}
                            {workProgramFields.map((_, index) => (
                                errors[`work_program_${index}`] && (
                                    <p key={index} className="text-red-500 text-xs mt-1">{errors[`work_program_${index}`]}</p>
                                )
                            ))}
                            <button
                                type="button"
                                onClick={addWorkProgramField}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tambah Program Kerja
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Status Rekrutmen <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.recruitment_status}
                                onChange={(e) => setData({ ...data, recruitment_status: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                    errors.recruitment_status
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                            >
                                <option value="">Pilih Status</option>
                                <option value="OPEN">OPEN</option>
                                <option value="CLOSED">CLOSED</option>
                            </select>
                            {errors.recruitment_status && <p className="text-red-500 text-xs mt-1">{errors.recruitment_status}</p>}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Link
                                href={route('admin.bem.index')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .animate-slide-in-right {
                    animation: slide-in-right 0.5s ease-out;
                }
            `}</style>
        </AdminLayout>
    );
}