import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ auth, userRole, permissions, mpm, menu }) {
    const [data, setData] = useState({
        introduction: mpm.introduction || '',
        vision: mpm.vision || '',
        mission: Array.isArray(mpm.mission) ? mpm.mission : [''],
        structure: {
            chairman: { name: mpm.structure?.chairman?.name || '', photo: mpm.structure?.chairman?.photo || null },
            secretary: { name: mpm.structure?.secretary?.name || '', photo: mpm.structure?.secretary?.photo || null },
            commissions: mpm.structure?.commissions || [],
        },
        recruitment_status: mpm.recruitment_status || 'OPEN',
        logo: null,
    });
    const [missionFields, setMissionFields] = useState(data.mission);
    const [commissions, setCommissions] = useState(data.structure.commissions);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        setMissionFields(data.mission);
        setCommissions(data.structure.commissions);
    }, [mpm]);

    const handleChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMissionChange = (index, value) => {
        const updatedMissions = [...missionFields];
        updatedMissions[index] = value;
        setMissionFields(updatedMissions);
        setData((prev) => ({ ...prev, mission: updatedMissions }));
    };

    const addMissionField = () => setMissionFields([...missionFields, '']);
    const removeMissionField = (index) => {
        const updatedMissions = missionFields.filter((_, i) => i !== index);
        setMissionFields(updatedMissions);
        setData((prev) => ({ ...prev, mission: updatedMissions }));
    };

    const addCommission = () => {
        const newCommission = { name: '', chairman: { name: '', photo: null }, members: [], work_programs: [''] };
        setCommissions([...commissions, newCommission]);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: [...commissions, newCommission] },
        }));
    };

    const handleCommissionChange = (index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index][field] = value;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const handleChairmanChange = (index, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[index].chairman[field] = value;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const addMember = (commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members.push({ name: '', photo: null });
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const handleMemberChange = (commissionIndex, memberIndex, field, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members[memberIndex][field] = value;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const addWorkProgram = (commissionIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs.push('');
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const handleWorkProgramChange = (commissionIndex, programIndex, value) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs[programIndex] = value;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const removeWorkProgram = (commissionIndex, programIndex) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].work_programs = updatedCommissions[commissionIndex].work_programs.filter(
            (_, i) => i !== programIndex
        );
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('introduction', data.introduction);
        formData.append('vision', data.vision);
        formData.append('mission', JSON.stringify(data.mission));
        formData.append('structure', JSON.stringify(data.structure));
        formData.append('recruitment_status', data.recruitment_status);

        if (data.logo instanceof File) formData.append('logo', data.logo);
        if (data.structure.chairman.photo instanceof File)
            formData.append('chairman_photo', data.structure.chairman.photo);
        if (data.structure.secretary.photo instanceof File)
            formData.append('secretary_photo', data.structure.secretary.photo);

        data.structure.commissions.forEach((commission, commissionIndex) => {
            if (commission.chairman.photo instanceof File)
                formData.append(`commissions[${commissionIndex}][chairman_photo]`, commission.chairman.photo);
            commission.members.forEach((member, memberIndex) => {
                if (member.photo instanceof File)
                    formData.append(
                        `commissions[${commissionIndex}][members][${memberIndex}][photo]`,
                        member.photo
                    );
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
            },
        });
    };

    const handleFileChange = (field, file) => {
        setData((prev) => ({ ...prev, [field]: file }));
    };

    const handleChairmanPhotoChange = (file) => {
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, chairman: { ...prev.structure.chairman, photo: file } },
        }));
    };

    const handleSecretaryPhotoChange = (file) => {
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, secretary: { ...prev.structure.secretary, photo: file } },
        }));
    };

    const handleCommissionChairmanPhotoChange = (commissionIndex, file) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].chairman.photo = file;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    const handleMemberPhotoChange = (commissionIndex, memberIndex, file) => {
        const updatedCommissions = [...commissions];
        updatedCommissions[commissionIndex].members[memberIndex].photo = file;
        setCommissions(updatedCommissions);
        setData((prev) => ({
            ...prev,
            structure: { ...prev.structure, commissions: updatedCommissions },
        }));
    };

    return (
        <AdminLayout user={auth.user} userRole={userRole} permissions={permissions} navigation={menu}>
            <Head title="Edit Data MPM" />
            {notification.show && (
                <div className="fixed top-4 right-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {notification.message}
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
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perkenalan MPM</label>
                                <textarea
                                    value={data.introduction}
                                    onChange={(e) => handleChange('introduction', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                />
                                {errors.introduction && <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Logo MPM</label>
                                {mpm.logo && (
                                    <div className="mb-2">
                                        <img src={`/storage/${mpm.logo}`} alt="Logo MPM" className="h-20 w-20 object-cover rounded" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange('logo', e.target.files[0])}
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
                                        setData((prev) => ({
                                            ...prev,
                                            structure: { ...prev.structure, chairman: { ...prev.structure.chairman, name: e.target.value } },
                                        }))
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {data.structure.chairman.photo && typeof data.structure.chairman.photo === 'string' && (
                                    <div className="mt-2">
                                        <img src={`/storage/${data.structure.chairman.photo}`} alt="Foto Ketua" className="h-16 w-16 object-cover rounded-full" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => handleChairmanPhotoChange(e.target.files[0])}
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
                                        setData((prev) => ({
                                            ...prev,
                                            structure: { ...prev.structure, secretary: { ...prev.structure.secretary, name: e.target.value } },
                                        }))
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {data.structure.secretary.photo && typeof data.structure.secretary.photo === 'string' && (
                                    <div className="mt-2">
                                        <img src={`/storage/${data.structure.secretary.photo}`} alt="Foto Sekretaris" className="h-16 w-16 object-cover rounded-full" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => handleSecretaryPhotoChange(e.target.files[0])}
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
                                            onChange={(e) => handleCommissionChange(commissionIndex, 'name', e.target.value)}
                                            placeholder="Nama Komisi"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700">Ketua Komisi</label>
                                            <input
                                                type="text"
                                                value={commission.chairman.name}
                                                onChange={(e) => handleChairmanChange(commissionIndex, 'name', e.target.value)}
                                                placeholder="Nama Ketua Komisi"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                            {commission.chairman.photo && typeof commission.chairman.photo === 'string' && (
                                                <div className="mt-2">
                                                    <img src={`/storage/${commission.chairman.photo}`} alt="Foto Ketua Komisi" className="h-16 w-16 object-cover rounded-full" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                onChange={(e) => handleCommissionChairmanPhotoChange(commissionIndex, e.target.files[0])}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                accept="image/*"
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700">Anggota</label>
                                            {commission.members.map((member, memberIndex) => (
                                                <div key={memberIndex} className="flex space-x-4 mt-2">
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => handleMemberChange(commissionIndex, memberIndex, 'name', e.target.value)}
                                                        placeholder={`Anggota ${memberIndex + 1}`}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                    {member.photo && typeof member.photo === 'string' && (
                                                        <div className="mt-2">
                                                            <img src={`/storage/${member.photo}`} alt="Foto Anggota" className="h-12 w-12 object-cover rounded-full" />
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleMemberPhotoChange(commissionIndex, memberIndex, e.target.files[0])}
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
                                            <label className="block text-sm font-medium text-gray-700">Program Kerja</label>
                                            {commission.work_programs.map((program, programIndex) => (
                                                <div key={programIndex} className="flex space-x-4 mt-2">
                                                    <input
                                                        type="text"
                                                        value={program}
                                                        onChange={(e) => handleWorkProgramChange(commissionIndex, programIndex, e.target.value)}
                                                        placeholder={`Program Kerja ${programIndex + 1}`}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    onChange={(e) => handleChange('vision', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
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
                                <label className="block text-sm font-medium text-gray-700">Status Rekrutmen</label>
                                <select
                                    value={data.recruitment_status}
                                    onChange={(e) => handleChange('recruitment_status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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