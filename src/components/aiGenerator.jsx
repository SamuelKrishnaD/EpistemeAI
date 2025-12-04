import { useState, useEffect, useRef } from "react";

export default function AIGenerator() {
  // --- STATE MANAGEMENT ---
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk File
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State untuk PDF
  const [pdfUrl, setPdfUrl] = useState(null);

  // --- CONFIGURATION ---
  // GANTI URL INI DENGAN URL N8N PRODUCTION KAMU
  const N8N_TEXT_URL = "https://vin1123.app.n8n.cloud/webhook/generate_materi"; // URL Webhook Text (Atas)
  const N8N_FILE_URL =
    "https://vin1123.app.n8n.cloud/webhook/85fd903c-37c5-49e8-9084-b03f32e73fa4"; // URL Webhook File (Bawah)

  // --- EFFECTS ---
  // Reset PDF jika user mengubah input text atau file (agar data sinkron)
  useEffect(() => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [input, selectedFile]);

  // --- API HANDLERS ---

  // [UPDATED] 1. Handler "Pintar" untuk FILE (Bisa terima PDF atau JSON)
  const callN8NFile = async (type, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // Key 'file' sesuai settingan n8n Binary Property
      formData.append("request_type", type);

      // Kirim prompt tambahan jika ada isinya
      if (input && input.trim() !== "") {
        formData.append("topic", input);
      }

      const response = await fetch(N8N_FILE_URL, {
        method: "POST",
        body: formData, // Browser otomatis set Content-Type multipart/form-data
      });

      if (!response.ok)
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`
        );

      // --- LOGIC BARU: DETEKSI KONTEN ---
      const contentType = response.headers.get("content-type");

      // Jika response adalah JSON (Biasanya pesan error atau teks biasa)
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data.result || JSON.stringify(data);
      }
      // Jika response adalah PDF / Binary (Blob)
      else {
        console.log("Menerima Binary File dari n8n...");
        const blob = await response.blob();

        // Buat URL sementara untuk file tersebut
        const url = window.URL.createObjectURL(blob);

        // Simpan ke state agar tombol Download Hijau muncul
        setPdfUrl(url);

        return "✅ **SUKSES!** File PDF berhasil digenerate dari dokumen yang kamu upload.\n\nSilakan klik tombol **'Save PDF'** berwarna hijau di bawah untuk mengunduhnya.";
      }
    } catch (error) {
      console.error("File Upload Error:", error);
      return `Gagal memproses file. Error: ${error.message}`;
    }
  };

  // 2. Handler untuk TEXT (JSON Only)
  const callN8NText = async (type, text) => {
    try {
      const response = await fetch(N8N_TEXT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text, request_type: type }),
      });

      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      return data.result || "Format JSON output berbeda.";
    } catch (error) {
      console.error("Text Error:", error);
      return "Gagal mengambil data teks. Pastikan Webhook Atas aktif.";
    }
  };

  // 3. Handler khusus PDF dari Teks Manual (Opsional)
  const preparePDFFromText = async (text) => {
    try {
      const response = await fetch(N8N_TEXT_URL, {
        method: "POST",
        // ❗ jangan set Content-Type, biarkan browser set boundary untuk multipart
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal generate PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      return true;
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Gagal memproses PDF.");
      return false;
    }
  };

  // --- MAIN LOGIC ---
  const handleGenerate = async (type) => {
    // Validasi Input
    if (!input.trim() && !selectedFile) {
      return alert("Mohon isi teks atau upload file terlebih dahulu.");
    }

    setLoading(true);
    setOutput(""); // Bersihkan output lama

    // Logic Tombol PDF (Merah)
    if (type === "pdf_prepare") {
      const textToPdf = output || input;
      if (!textToPdf && !selectedFile) {
        alert("Belum ada konten untuk dibuat PDF.");
        setLoading(false);
        return;
      }

      // Jika ada file, kita jalankan flow upload saja (n8n akan return PDF)
      if (selectedFile) {
        const res = await callN8NFile("pdf", selectedFile);
        setOutput(res);
      } else {
        // Jika tidak ada file (hanya teks), panggil fungsi khusus teks
        await preparePDFFromText(textToPdf);
      }
    }
    // Logic Tombol Generate (Questions/Summary)
    else {
      let result;
      if (selectedFile) {
        console.log("Mode: File Upload -> n8n Webhook Bawah");
        result = await callN8NFile(type, selectedFile);
      } else {
        console.log("Mode: Text Prompt -> n8n Webhook Atas");
        result = await callN8NText(type, input);
      }
      setOutput(result);
    }

    setLoading(false);
  };

  // --- UI HELPERS ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setOutput("");
      setPdfUrl(null); // Reset PDF lama
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPdfUrl(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">AI Generator</h1>
        <p className="text-gray-600">
          Upload materi (PPT/PDF) atau ketik topik untuk membuat rangkuman &
          soal otomatis.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 bg-white shadow-lg rounded-xl space-y-5 border border-gray-100">
        {/* 1. File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            selectedFile
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {!selectedFile ? (
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.pptx"
                  />
                </label>
                <span className="pl-1">or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PPTX, PDF, DOCX up to 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-lg text-2xl">📄</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500 transition"
                title="Remove file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">
            OR Type Topic
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* 2. Text Input Area */}
        <div>
          <textarea
            className="w-full min-h-[120px] border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm placeholder-gray-400 transition"
            placeholder={
              selectedFile
                ? "Tambahkan instruksi khusus untuk file ini (opsional)..."
                : "Contoh: Jelaskan tentang Sistem Tata Surya dan planet-planetnya..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Tombol Questions */}
          <button
            onClick={() => handleGenerate("questions")}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">↻</span>
            ) : (
              <span>📝 Buat Soal</span>
            )}
          </button>

          {/* Tombol Summary */}
          <button
            onClick={() => handleGenerate("summary")}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition border border-gray-200 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">↻</span>
            ) : (
              <span>🔍 Buat Rangkuman</span>
            )}
          </button>

          {/* Tombol PDF Logic */}
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`Materi_AI_${new Date().getTime()}.pdf`}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 text-center flex justify-center items-center gap-2 shadow-md transform hover:scale-[1.02] transition animate-pulse"
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
              <span>Download PDF</span>
            </a>
          ) : (
            <button
              onClick={() => handleGenerate("pdf_prepare")}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
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
                  <span>Create PDF</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Output Display */}
      {output && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
            <h2 className="text-blue-800 font-semibold">✨ Hasil AI:</h2>
            {/* Sembunyikan tombol copy jika outputnya adalah pesan sukses download PDF */}
            {!output.includes("SUKSES") && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs text-blue-600 hover:underline"
              >
                Copy Text
              </button>
            )}
          </div>
          <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            <div className="prose prose-sm max-w-none">{output}</div>
          </div>
        </div>
      )}
    </div>
  );
}
