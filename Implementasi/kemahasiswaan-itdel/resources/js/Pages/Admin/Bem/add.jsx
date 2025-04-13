import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Add({ auth, userRole, permissions, navigation, bemExists }) {
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
    });
    const [errors, setErrors] = useState({});

    const [positions, setPositions] = useState(data.structure.positions);
    const [departments, setDepartments] = useState(data.structure.departments);
    const [missionFields, setMissionFields] = useState(data.mission);
    const [workProgramFields, setWorkProgramFields] = useState(data.work_programs.programs);

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

        router.post(
            route('admin.bem.store'),
            formData,
            {
                onError: (errors) => {
                    setErrors(errors);
                },
            }
        );
    };

    if (bemExists) {
        return (
            <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
                <Head title="Tambah Data BEM" />
                <div className="py-10">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h1 className="text-3xl font-bold mb-6">Data BEM Sudah Ada</h1>
                            <p className="text-gray-600">Data BEM sudah ada. Silakan edit data yang sudah ada.</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Tambah Data BEM" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tambah Data BEM</h1>
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                <h3 className="font-bold">Terjadi Kesalahan:</h3>
                                <ul className="list-disc pl-5">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{key}: {value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perkenalan BEM</label>
                                <textarea
                                    value={data.introduction}
                                    onChange={(e) => setData({ ...data, introduction: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.introduction && <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo BEM</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData({ ...data, logo: e.target.files[0] })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    accept="image/*"
                                />
                                {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
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
                                <label className="block text-sm font-medium text-gray-700">Struktur Organisasi</label>

                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold">Jabatan</h3>
                                    {positions.map((position, positionIndex) => (
                                        <div key={positionIndex} className="border p-4 rounded-lg mt-2">
                                            <div className="flex space-x-4 mt-2">
                                                <input
                                                    type="text"
                                                    value={position.title}
                                                    onChange={(e) => handlePositionChange(positionIndex, 'title', e.target.value)}
                                                    placeholder="Nama Jabatan (misalnya: Ketua BEM)"
                                                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={position.name}
                                                    onChange={(e) => handlePositionChange(positionIndex, 'name', e.target.value)}
                                                    placeholder="Nama"
                                                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                <input
                                                    type="file"
                                                    onChange={(e) => handlePositionChange(positionIndex, 'photo', e.target.files[0])}
                                                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                                <input
                                                    type="text"
                                                    value={dept.name}
                                                    onChange={(e) => handleDepartmentChange(deptIndex, 'name', e.target.value)}
                                                    placeholder="Nama Departemen"
                                                    className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
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
                                                        <input
                                                            type="text"
                                                            value={member.position}
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'position', e.target.value)}
                                                            placeholder="Jabatan"
                                                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            required
                                                        />
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'name', e.target.value)}
                                                            placeholder="Nama"
                                                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            required
                                                        />
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleMemberChange(deptIndex, memberIndex, 'photo', e.target.files[0])}
                                                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi Program Kerja</label>
                                <textarea
                                    value={data.work_programs.description}
                                    onChange={(e) =>
                                        setData({ ...data, work_programs: { ...data.work_programs, description: e.target.value } })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.work_programs?.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.work_programs.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program Kerja</label>
                                {workProgramFields.map((program, index) => (
                                    <div key={index} className="flex space-x-4 mt-2">
                                        <input
                                            type="text"
                                            value={program}
                                            onChange={(e) => handleWorkProgramChange(index, e.target.value)}
                                            placeholder={`Program Kerja ${index + 1}`}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
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
                                <button
                                    type="button"
                                    onClick={addWorkProgramField}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Tambah Program Kerja
                                </button>
                                {errors.work_programs?.programs && (
                                    <p className="text-red-500 text-sm mt-1">{errors.work_programs.programs}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Rekrutmen</label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => setData({ ...data, recruitment_status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {errors.recruitment_status && <p className="text-red-500 text-sm mt-1">{errors.recruitment_status}</p>}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.get(route('admin.bem.index'))}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                >
                                    Kembali
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}