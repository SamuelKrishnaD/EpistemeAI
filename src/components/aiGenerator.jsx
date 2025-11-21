import { useState, useEffect } from "react";

export default function AIGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // URL PDF yang sudah jadi
  const [pdfUrl, setPdfUrl] = useState(null);

  // 🔹 state untuk file upload
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const N8N_WEBHOOK_URL =
    "https://vin1123.app.n8n.cloud/webhook-test/generate_materi";

  // Reset PDF kalau input teks berubah (supaya tidak download materi lama)
  useEffect(() => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl); // bersihkan memori blob lama
      setPdfUrl(null); // sembunyikan tombol download
    }
  }, [input]);

  // 🔹 handle pilih file (pdf / ppt / pptx)
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setFileName("");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(selected.type)) {
      alert("Please upload a PDF or PowerPoint file (.pdf, .ppt, .pptx).");
      e.target.value = "";
      setFile(null);
      setFileName("");
      return;
    }

    setFile(selected);
    setFileName(selected.name);
  };

  // TEXT → n8n (summary / questions)
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

  // TEXT (+ optional FILE) → PDF
  const preparePDF = async (text) => {
    try {
      const formData = new FormData();
      formData.append("topic", text);
      formData.append("request_type", "pdf");

      // 🔹 kalau ada file, kirim juga ke n8n
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(N8N_WEBHOOK_URL, {
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
      console.error("Download error:", error);
      alert("Gagal memproses PDF.");
      return false;
    }
  };

  const handleGenerate = async (type) => {
    if (!input.trim()) return alert("Please enter content.");

    setLoading(true);

    if (type === "pdf_prepare") {
      await preparePDF(input);
    } else {
      const result = await callN8NText(type, input);
      setOutput(result);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Generator</h1>
        <p className="text-gray-600">Generate study materials, Q&A, and PDF.</p>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-white shadow rounded-xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Generate Content</h2>
        </div>

        {/* 🔹 File upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Upload PDF / PPT (optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileChange}
              className="block text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {fileName && (
              <span className="text-xs text-gray-500 break-all">
                Selected: {fileName}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">
            You can combine uploaded file + topic text if you want.
          </p>
        </div>

        {/* Textarea */}
        <textarea
          className="w-full min-h-[150px] border-[1.5px] border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Example: Sistem Pernapasan Manusia"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Questions */}
          <button
            onClick={() => handleGenerate("questions")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "..." : "Questions"}
          </button>

          {/* Summary */}
          <button
            onClick={() => handleGenerate("summary")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60"
          >
            {loading ? "..." : "Summary"}
          </button>

          {/* PDF: create / download */}
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`Materi_${input.replace(/\s+/g, "_")}.pdf`}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 text-center flex justify-center items-center gap-2 shadow-lg transform hover:scale-105 transition"
            >
              Save PDF
            </a>
          ) : (
            <button
              onClick={() => handleGenerate("pdf_prepare")}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60 flex justify-center items-center gap-2"
            >
              {loading ? "Creating PDF..." : "Create PDF"}
            </button>
          )}
        </div>
      </div>

      {/* Output Text */}
      {output && (
        <div className="p-6 bg-white shadow rounded-xl border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-3">Generated Output:</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
