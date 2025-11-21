import { useState, useEffect } from "react";

export default function AIGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // [NEW] State untuk menyimpan URL PDF yang sudah jadi
  const [pdfUrl, setPdfUrl] = useState(null);

  const N8N_WEBHOOK_URL =
    "https://vin1123.app.n8n.cloud/webhook-test/generate_materi";

  // [NEW] Reset PDF jika user mengubah input teks (biar tidak download materi lama)
  useEffect(() => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl); // Bersihkan memori
      setPdfUrl(null); // Hilangkan tombol download
    }
  }, [input]);

  // Handler Text (Sama seperti sebelumnya)
  const callN8NText = async (type, text) => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text, request_type: type }),
      });
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      return data.result || "Format JSON berbeda.";
    } catch (error) {
      console.error(error);
      return "Gagal mengambil data.";
    }
  };

  // [UPDATED] Fungsi ini sekarang hanya MENYIAPKAN file, tidak auto-download
  const preparePDF = async (text) => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text, request_type: "pdf" }),
      });

      if (!response.ok) throw new Error("Gagal generate PDF");

      const blob = await response.blob();

      // Buat URL objek dari blob
      const url = window.URL.createObjectURL(blob);

      // [UPDATED] Simpan ke state, jangan di-klik otomatis
      setPdfUrl(url);

      return true;
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal memproses PDF.");
      return false;
    }
  };

  const handleGenerate = async (type) => {
    if (!input.trim()) return alert("Please enter content.");

    setLoading(true);

    if (type === "pdf_prepare") {
      // Panggil persiapan PDF
      await preparePDF(input);
    } else {
      const result = await callN8NText(type, input);
      setOutput(result);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Cards (Sama seperti sebelumnya) */}
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Generator</h1>
        <p className="text-gray-600">Generate study materials & PDF.</p>
      </div>

      {/* ... (Bagian Cards Grid boleh tetap ada di sini) ... */}

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-white shadow rounded-xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Generate Content</h2>
        </div>

        <textarea
          className="w-full min-h-[150px] border-[1.5px] border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Example: Sistem Pernapasan Manusia"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tombol Text Biasa */}
          <button
            onClick={() => handleGenerate("questions")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "..." : "Questions"}
          </button>

          <button
            onClick={() => handleGenerate("summary")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60"
          >
            {loading ? "..." : "Summary"}
          </button>

          {/* --- TOMBOL PDF LOGIC --- */}
          {/* KONDISI: Jika pdfUrl SUDAH ADA, tampilkan tombol DOWNLOAD HIJAU */}
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`Materi_${input.replace(/\s+/g, "_")}.pdf`}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 text-center flex justify-center items-center gap-2 shadow-lg transform hover:scale-105 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              <span>Save PDF</span>
            </a>
          ) : (
            /* KONDISI: Jika pdfUrl BELUM ADA, tampilkan tombol GENERATE MERAH */
            <button
              onClick={() => handleGenerate("pdf_prepare")}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {loading ? (
                "Creating PDF..."
              ) : (
                <>
                  <span>Create PDF</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {output && (
        <div className="p-6 bg-white shadow rounded-xl border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-3">Generated Summary:</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
