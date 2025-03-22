import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Kegiatan() {
    const { kegiatan = [], flash = {} } = usePage().props;
    const { data, setData, post, delete: destroy } = useForm({
        judul: '',
        deskripsi: '',
        tanggal: ''
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.bem.kegiatan.store'));
    }

    function handleDelete(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) return;

        console.log(`Menghapus kegiatan dengan ID: ${id}`); // Debugging
        destroy(route('admin.bem.kegiatan.destroy', id), {
            _method: 'delete',
            preserveScroll: true,
            onSuccess: () => console.log(`Kegiatan ${id} berhasil dihapus.`),
            onError: (errors) => console.error("Error saat menghapus:", errors),
        });

    }

    console.log("Props dari Laravel:", usePage().props);

    return (
        <div>
            <Head title="Kegiatan BEM" />
            <h1 className="text-2xl font-bold">Kegiatan BEM</h1>

            {flash.success && <div className="text-green-500">{flash.success}</div>}

            <form onSubmit={handleSubmit} className="mt-4">
                <input type="text" placeholder="Judul" value={data.judul} onChange={e => setData('judul', e.target.value)} className="border p-2 w-full" />
                <textarea placeholder="Deskripsi" value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} className="border p-2 w-full mt-2"></textarea>
                <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className="border p-2 w-full mt-2" />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">Tambah Kegiatan</button>
            </form>

            <table className="mt-6 w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Judul</th>
                        <th className="p-2">Deskripsi</th>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {kegiatan.length > 0 ? (
                        kegiatan.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-2">{item.judul}</td>
                                <td className="p-2">{item.deskripsi}</td>
                                <td className="p-2">{item.tanggal}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 text-white p-2 rounded"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="p-2 text-center text-gray-500">Tidak ada kegiatan.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
