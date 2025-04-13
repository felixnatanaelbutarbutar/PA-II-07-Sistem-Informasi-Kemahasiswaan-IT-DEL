// resources/js/Pages/Admin/Bem/edit.jsx
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function edit({ bem, auth, userRole, permissions, navigation }) {
    const { data, setData, put, processing, errors } = useForm({
        vision: bem.vision || '',
        mission: bem.mission || '',
        structure: bem.structure || {
            'Ketua BEM': { name: '', photo: null },
            'Sekretaris': { name: '', photo: null },
            departments: [],
        },
        work_programs: bem.work_programs || [''],
        recruitment_status: bem.recruitment_status || 'CLOSED',
    });

    const [departments, setDepartments] = useState(data.structure.departments || []);
    const [workProgramFields, setWorkProgramFields] = useState(data.work_programs);

    useEffect(() => {
        setDepartments(data.structure.departments || []);
        setWorkProgramFields(data.work_programs);
    }, [bem]);

    // Handle Ketua BEM dan Sekretaris
    const handleKetuaBemChange = (key, value) => {
        setData('structure', {
            ...data.structure,
            'Ketua BEM': { ...data.structure['Ketua BEM'], [key]: value },
        });
    };

    const handleSekretarisChange = (key, value) => {
        setData('structure', {
            ...data.structure,
            'Sekretaris': { ...data.structure['Sekretaris'], [key]: value },
        });
    };

    // Handle Departemen
    const addDepartment = () => {
        const newDepartments = [...departments, { name: '', members: [] }];
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    const removeDepartment = (deptIndex) => {
        const newDepartments = departments.filter((_, i) => i !== deptIndex);
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    const handleDepartmentChange = (deptIndex, key, value) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex][key] = value;
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    const addMember = (deptIndex) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members.push({ position: '', name: '', photo: null });
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    const removeMember = (deptIndex, memberIndex) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members = newDepartments[deptIndex].members.filter((_, i) => i !== memberIndex);
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    const handleMemberChange = (deptIndex, memberIndex, key, value) => {
        const newDepartments = [...departments];
        newDepartments[deptIndex].members[memberIndex][key] = value;
        setDepartments(newDepartments);
        setData('structure', { ...data.structure, departments: newDepartments });
    };

    // Handle Program Kerja
    const handleWorkProgramChange = (index, value) => {
        const updatedPrograms = [...workProgramFields];
        updatedPrograms[index] = value;
        setWorkProgramFields(updatedPrograms);
        setData('work_programs', updatedPrograms);
    };

    const addWorkProgramField = () => {
        setWorkProgramFields([...workProgramFields, '']);
    };

    const removeWorkProgramField = (index) => {
        const updatedPrograms = workProgramFields.filter((_, i) => i !== index);
        setWorkProgramFields(updatedPrograms);
        setData('work_programs', updatedPrograms);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.bem.update', bem.id));
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={navigation}>
            <Head title="Edit Data BEM" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Data BEM</h1>
                        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                            {/* Visi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Visi</label>
                                <textarea
                                    value={data.vision}
                                    onChange={(e) => setData('vision', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision}</p>}
                            </div>

                            {/* Misi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Misi</label>
                                <textarea
                                    value={data.mission}
                                    onChange={(e) => setData('mission', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    required
                                />
                                {errors.mission && <p className="text-red-500 text-sm mt-1">{errors.mission}</p>}
                            </div>

                            {/* Struktur Organisasi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Struktur Organisasi</label>

                                {/* Ketua BEM */}
                                <div className="border p-4 rounded-lg mt-2">
                                    <h3 className="text-lg font-semibold">Ketua BEM</h3>
                                    <div className="flex space-x-4 mt-2">
                                        <input
                                            type="text"
                                            value={data.structure['Ketua BEM'].name}
                                            onChange={(e) => handleKetuaBemChange('name', e.target.value)}
                                            placeholder="Nama Ketua BEM"
                                            className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <input
                                            type="file"
                                            onChange={(e) => handleKetuaBemChange('photo', e.target.files[0])}
                                            className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    {data.structure['Ketua BEM'].photo && typeof data.structure['Ketua BEM'].photo === 'string' && (
                                        <img
                                            src={`/storage/${data.structure['Ketua BEM'].photo}`}
                                            alt="Ketua BEM"
                                            className="w-16 h-16 object-cover rounded-full mt-2"
                                        />
                                    )}
                                    {errors['structure.Ketua BEM.name'] && (
                                        <p className="text-red-500 text-sm mt-1">{errors['structure.Ketua BEM.name']}</p>
                                    )}
                                    {errors['structure.Ketua BEM.photo'] && (
                                        <p className="text-red-500 text-sm mt-1">{errors['structure.Ketua BEM.photo']}</p>
                                    )}
                                </div>

                                {/* Sekretaris */}
                                <div className="border p-4 rounded-lg mt-2">
                                    <h3 className="text-lg font-semibold">Sekretaris</h3>
                                    <div className="flex space-x-4 mt-2">
                                        <input
                                            type="text"
                                            value={data.structure['Sekretaris'].name}
                                            onChange={(e) => handleSekretarisChange('name', e.target.value)}
                                            placeholder="Nama Sekretaris"
                                            className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        <input
                                            type="file"
                                            onChange={(e) => handleSekretarisChange('photo', e.target.files[0])}
                                            className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    {data.structure['Sekretaris'].photo && typeof data.structure['Sekretaris'].photo === 'string' && (
                                        <img
                                            src={`/storage/${data.structure['Sekretaris'].photo}`}
                                            alt="Sekretaris"
                                            className="w-16 h-16 object-cover rounded-full mt-2"
                                        />
                                    )}
                                    {errors['structure.Sekretaris.name'] && (
                                        <p className="text-red-500 text-sm mt-1">{errors['structure.Sekretaris.name']}</p>
                                    )}
                                    {errors['structure.Sekretaris.photo'] && (
                                        <p className="text-red-500 text-sm mt-1">{errors['structure.Sekretaris.photo']}</p>
                                    )}
                                </div>

                                {/* Departemen */}
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
                                                        />
                                                        {member.photo && typeof member.photo === 'string' && (
                                                            <img
                                                                src={`/storage/${member.photo}`}
                                                                alt={member.name}
                                                                className="w-16 h-16 object-cover rounded-full mt-2"
                                                            />
                                                        )}
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

                            {/* Program Kerja */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program Kerja</label>
                                {workProgramFields.map((program, index) => (
                                    <div key={index} className="flex space-x-4 mt-2">
                                        <input
                                            type="text"
                                            value={program}
                                            onChange={(e) => handleWorkProgramChange(index, e.target.value)}
                                            placeholder="Program Kerja"
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
                                {errors.work_programs && <p className="text-red-500 text-sm mt-1">{errors.work_programs}</p>}
                            </div>

                            {/* Status Rekrutmen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Rekrutmen</label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => setData('recruitment_status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                {errors.recruitment_status && <p className="text-red-500 text-sm mt-1">{errors.recruitment_status}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
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
        </AdminLayout>
    );
}