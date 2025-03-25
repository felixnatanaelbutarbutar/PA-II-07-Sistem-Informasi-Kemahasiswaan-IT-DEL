<?php

namespace App\Http\Controllers;

use App\Models\KegiatanBEM;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KegiatanBEMController extends Controller
{
    public function index()
    {
        $kegiatan = KegiatanBEM::all();
        return Inertia::render('AdminBEM/Kegiatan', [
            'kegiatan' => $kegiatan
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal' => 'required|date',
        ]);

        KegiatanBEM::create($request->all());

        return redirect()->route('admin.bem.kegiatan')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function show($id)
    {
        $kegiatan = KegiatanBEM::findOrFail($id);
        return response()->json($kegiatan);
    }

    public function update(Request $request, $id)
    {
        $kegiatan = KegiatanBEM::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal' => 'required|date',
        ]);

        $kegiatan->update($request->all());

        return redirect()->route('admin.bem.kegiatan')->with('success', 'Kegiatan berhasil diperbarui.');
    }

        public function destroy($id)
    {
        $kegiatan = KegiatanBEM::findOrFail($id);
        $kegiatan->delete();

        return response()->json(['message' => 'Kegiatan berhasil dihapus'], 200);
    }


}
