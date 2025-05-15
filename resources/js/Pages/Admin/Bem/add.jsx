import { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Add({ auth, userRole, permissions, navigation, }) {
    const [data, setData] = useState({
        introduction: '',
        vision: '',
        mission: [''],
        structure: {
            positions: [],
            departments: [],
        },
        work_programs: {
            description: '',
            programs: [''],
        },
        logo: null,
        recruitment_status: 'CLOSED',
        is_active: false, // Tambah is_active
        cabinet_name: '', // Tambah cabinet_name
    });
    const [clientErrors, setClientErrors] = useState({});
    const [serverErrors, setServerErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const [positions, setPositions] = useState(data.structure.positions);
    const [departments, setDepartments] = useState(data.structure.departments);
    const [missionFields, setMissionFields] = useState(data.mission);
    const [workProgramFields, setWorkProgramFields] = useState(data.work_programs.programs);

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

        const newErrors = {};

        if (!data.introduction.trim()) newErrors.introduction = 'Perkenalan BEM wajib diisi.';
        if (!data.vision.trim()) newErrors.vision = 'Visi wajib diisi.';
        if (missionFields.length === 0 || missionFields.some(mission => !mission.trim())) {
            newErrors.mission = 'Setiap misi wajib diisi.';
        }
        if (!data.work_programs.description.trim()) {
            newErrors.work_programs_description = 'Deskripsi program kerja wajib diisi.';
        }
        if (workProgramFields.length === 0 || workProgramFields.some(program => !program.trim())) {
            newErrors.work_programs_programs = 'Setiap program kerja wajib diisi.';
        }
        if (!data.recruitment_status) newErrors.recruitment_status = 'Status rekrutmen wajib dipilih.';
        if (!data.cabinet_name.trim()) newErrors.cabinet_name = 'Nama kabinet wajib diisi.'; // Validasi cabinet_name

        const positionErrors = positions.map((position, index) => {
            const errors = {};
            if (!position.title.trim()) errors.title = `Nama Jabatan ${index + 1} wajib diisi.`;
            if (!position.name.trim()) errors.name = `Nama pada Jabatan ${index + 1} wajib diisi.`;
            return errors;
        });

        const departmentErrors = departments.map((dept, deptIndex) => {
            const deptErrors = {};
            if (!dept.name.trim()) deptErrors.name = `Nama Departemen ${deptIndex + 1} wajib diisi.`;
            const memberErrors = dept.members.map((member, memberIndex) => {
                const errors = {};
                if (!member.position.trim()) errors.position = `Jabatan anggota ${memberIndex + 1} pada Departemen ${deptIndex + 1} wajib diisi.`;
                if (!member.name.trim()) errors.name = `Nama anggota ${memberIndex + 1} pada Departemen ${deptIndex + 1} wajib diisi.`;
                return errors;
            });
            deptErrors.members = memberErrors;
            return deptErrors;
        });

        if (positionErrors.some(err => Object.keys(err).length > 0)) {
            newErrors.positions = positionErrors;
        }
        if (departmentErrors.some(dept => Object.keys(dept).length > 0)) {
            newErrors.departments = departmentErrors;
        }

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        setClientErrors({});
        setServerErrors({});

        const formData = new FormData();
        formData.append('introduction', data.introduction);
        formData.append('vision', data.vision);
        formData.append('mission', JSON.stringify(data.mission));
        formData.append('work_programs', JSON.stringify(data.work_programs));
        formData.append('recruitment_status', data.recruitment_status);
        formData.append('is_active', data.is_active ? '1' : '0'); // Kirim is_active
        formData.append('cabinet_name', data.cabinet_name); // Kirim cabinet_name

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

        router.post(
            route('admin.bem.store'),
            formData,
            {
                onSuccess: () => {
                    setNotification({
                        show: true,
                        type: 'success',
                        message: 'Data BEM berhasil ditambahkan!',
                    });
                    setData({
                        introduction: '',
                        vision: '',
                        mission: [''],
                        structure: { positions: [], departments: [] },
                        work_programs: { description: '', programs: [''] },
                        logo: null,
                        recruitment_status: 'CLOSED',
                        is_active: false, // Reset is_active
                        cabinet_name: '', // Reset cabinet_name
                    });
                    setPositions([]);
                    setDepartments([]);
                    setMissionFields(['']);
                    setWorkProgramFields(['']);
                    setTimeout(() => {
                        router.visit(route('admin.bem.index'));
                    }, 1500);
                },
                onError: (errors) => {
                    setServerErrors(errors);
                    setNotification({
                        show: true,
                        type: 'error',
                        message: 'Gagal menambahkan data BEM. Silakan coba lagi.',
                    });
                },
            }
        );
    };

    // if (bemExists) {
    //     return (
    //         <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
    //             <Head title="Tambah Data BEM" />
    //             <div className="py-10">
    //                 <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
    //                     <div className="bg-white rounded-2xl shadow-lg p-6">
    //                         <h1 className="text-3xl font-bold mb-6">Data BEM Sudah Ada</h1>
    //                         <p className="text-gray-600">Data BEM sudah ada. Silakan edit data yang sudah ada.</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </AdminLayout>
    //     );
    // }

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Tambah Data BEM" />

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
                                Tambah Data BEM
                            </h1>
                            <p className="text-gray-500 mt-1">Tambah data baru untuk BEM</p>
                        </div>
                        <Link
                            href={route('admin.bem.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                        >
                            ← Kembali
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nama Kabinet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Kabinet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.cabinet_name}
                                    onChange={(e) => setData({ ...data, cabinet_name: e.target.value })}
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.cabinet_name || clientErrors.cabinet_name
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Masukkan nama kabinet"
                                />
                                {(serverErrors.cabinet_name || clientErrors.cabinet_name) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.cabinet_name || clientErrors.cabinet_name}</p>
                                )}
                            </div>

                            {/* Perkenalan BEM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Perkenalan BEM <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.introduction}
                                    onChange={(e) => setData({ ...data, introduction: e.target.value })}
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.introduction || clientErrors.introduction
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    rows="4"
                                    placeholder="Masukkan perkenalan BEM"
                                />
                                {(serverErrors.introduction || clientErrors.introduction) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.introduction || clientErrors.introduction}</p>
                                )}
                            </div>

                            {/* Logo BEM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo BEM</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData({ ...data, logo: e.target.files[0] })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    accept="image/*"
                                />
                                {serverErrors.logo && <p className="text-red-500 text-xs mt-1">{serverErrors.logo}</p>}
                            </div>

                            {/* Visi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Visi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.vision}
                                    onChange={(e) => setData({ ...data, vision: e.target.value })}
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.vision || clientErrors.vision
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    rows="4"
                                    placeholder="Masukkan visi BEM"
                                />
                                {(serverErrors.vision || clientErrors.vision) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.vision || clientErrors.vision}</p>
                                )}
                            </div>

                            {/* Misi */}
                            <div>
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
                                            className={`block w-full rounded-md border shadow-sm transition ${
                                                clientErrors.mission
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeMissionField(index)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            disabled={missionFields.length === 1}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                                {clientErrors.mission && (
                                    <p className="text-red-500 text-xs mt-1">{clientErrors.mission}</p>
                                )}
                                {serverErrors.mission && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.mission}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={addMissionField}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Misi
                                </button>
                            </div>

                            {/* Struktur Organisasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Struktur Organisasi</label>

                                {/* Jabatan */}
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
                                                        className={`block w-full rounded-md border shadow-sm transition ${
                                                            clientErrors.positions?.[positionIndex]?.title
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {clientErrors.positions?.[positionIndex]?.title && (
                                                        <p className="text-red-500 text-xs mt-1">{clientErrors.positions[positionIndex].title}</p>
                                                    )}
                                                </div>
                                                <div className="w-1/3">
                                                    <input
                                                        type="text"
                                                        value={position.name}
                                                        onChange={(e) => handlePositionChange(positionIndex, 'name', e.target.value)}
                                                        placeholder="Nama"
                                                        className={`block w-full rounded-md border shadow-sm transition ${
                                                            clientErrors.positions?.[positionIndex]?.name
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {clientErrors.positions?.[positionIndex]?.name && (
                                                        <p className="text-red-500 text-xs mt-1">{clientErrors.positions[positionIndex].name}</p>
                                                    )}
                                                </div>
                                                <div className="w-1/3 flex space-x-2">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handlePositionChange(positionIndex, 'photo', e.target.files[0])}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        accept="image/*"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePosition(positionIndex)}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    >
                                                        Hapus Jabatan
                                                    </button>
                                                </div>
                                            </div>
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

                                {/* Departemen */}
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
                                                        className={`block w-full rounded-md border shadow-sm transition ${
                                                            clientErrors.departments?.[deptIndex]?.name
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {clientErrors.departments?.[deptIndex]?.name && (
                                                        <p className="text-red-500 text-xs mt-1">{clientErrors.departments[deptIndex].name}</p>
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
                                                                className={`block w-full rounded-md border shadow-sm transition ${
                                                                    clientErrors.departments?.[deptIndex]?.members?.[memberIndex]?.position
                                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            />
                                                            {clientErrors.departments?.[deptIndex]?.members?.[memberIndex]?.position && (
                                                                <p className="text-red-500 text-xs mt-1">{clientErrors.departments[deptIndex].members[memberIndex].position}</p>
                                                            )}
                                                        </div>
                                                        <div className="w-1/3">
                                                            <input
                                                                type="text"
                                                                value={member.name}
                                                                onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'name', e.target.value)}
                                                                placeholder="Nama"
                                                                className={`block w-full rounded-md border shadow-sm transition ${
                                                                    clientErrors.departments?.[deptIndex]?.members?.[memberIndex]?.name
                                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                                }`}
                                                            />
                                                            {clientErrors.departments?.[deptIndex]?.members?.[memberIndex]?.name && (
                                                                <p className="text-red-500 text-xs mt-1">{clientErrors.departments[deptIndex].members[memberIndex].name}</p>
                                                            )}
                                                        </div>
                                                        <div className="w-1/3 flex space-x-2">
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'photo', e.target.files[0])}
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                accept="image/*"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMember(deptIndex, memberIndex)}
                                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                            >
                                                                Hapus Anggota
                                                            </button>
                                                        </div>
                                                    </div>
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

                            {/* Deskripsi Program Kerja */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi Program Kerja <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.work_programs.description}
                                    onChange={(e) =>
                                        setData({ ...data, work_programs: { ...data.work_programs, description: e.target.value } })
                                    }
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.work_programs?.description || clientErrors.work_programs_description
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    rows="4"
                                    placeholder="Masukkan deskripsi program kerja"
                                />
                                {(serverErrors.work_programs?.description || clientErrors.work_programs_description) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.work_programs?.description || clientErrors.work_programs_description}</p>
                                )}
                            </div>

                            {/* Program Kerja */}
                            <div>
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
                                            className={`block w-full rounded-md border shadow-sm transition ${
                                                clientErrors.work_programs_programs
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeWorkProgramField(index)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            disabled={workProgramFields.length === 1}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                                {(serverErrors.work_programs?.programs || clientErrors.work_programs_programs) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.work_programs?.programs || clientErrors.work_programs_programs}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={addWorkProgramField}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Program Kerja
                                </button>
                            </div>

                            {/* Status Rekrutmen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status Rekrutmen <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => setData({ ...data, recruitment_status: e.target.value })}
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.recruitment_status || clientErrors.recruitment_status
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {(serverErrors.recruitment_status || clientErrors.recruitment_status) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.recruitment_status || clientErrors.recruitment_status}</p>
                                )}
                            </div>

                            {/* Status Aktif */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status Aktif <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.is_active ? 'true' : 'false'}
                                    onChange={(e) => setData({ ...data, is_active: e.target.value === 'true' })}
                                    className={`mt-1 block w-full rounded-md border shadow-sm transition ${
                                        serverErrors.is_active || clientErrors.is_active
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                >
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                                {(serverErrors.is_active || clientErrors.is_active) && (
                                    <p className="text-red-500 text-xs mt-1">{serverErrors.is_active || clientErrors.is_active}</p>
                                )}
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Simpan
                                </button>
                                <Link
                                    href={route('admin.bem.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                >
                                    Kembali
                                </Link>
                            </div>
                        </form>
                    </div>
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