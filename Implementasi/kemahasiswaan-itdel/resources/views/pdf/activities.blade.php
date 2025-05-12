<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agenda Kegiatan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            max-width: 150px; /* Atur ukuran logo */
            height: auto;
            margin-bottom: 10px;
        }
        h1 {
            text-align: center;
            color: #1a73e8;
            margin: 0;
        }
        .date-range {
            text-align: center;
            font-size: 14px;
            color: #555;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            color: #333;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ $logoPath }}" alt="Logo">
        <h1>Agenda Kegiatan Kemahasiswaan</h1>
    </div>
    @if(request()->query('start_date') && request()->query('end_date'))
        <div class="date-range">
            Periode: {{ \Carbon\Carbon::parse(request()->query('start_date'))->format('d-m-Y') }} 
            sampai {{ \Carbon\Carbon::parse(request()->query('end_date'))->format('d-m-Y') }}
        </div>
    @endif
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Judul Kegiatan</th>
                <th>Deskripsi</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Dibuat Oleh</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($activities as $index => $activity)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $activity->title }}</td>
                    <td>{{ $activity->description ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($activity->start_date)->format('d-m-Y') }}</td>
                    <td>{{ $activity->end_date ? \Carbon\Carbon::parse($activity->end_date)->format('d-m-Y') : '-' }}</td>
                    <td>{{ $activity->creator->username ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center;">Tidak ada kegiatan yang tersedia.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    <div class="footer">
        <p>Dibuat pada: {{ now()->format('d-m-Y H:i:s') }}</p>
    </div>
</body>
</html>