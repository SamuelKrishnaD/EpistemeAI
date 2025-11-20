import { useState } from "react";

export default function AIGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // n8n API CALL (prepare here)
  // Replace setTimeout with fetch("your-n8n-hook-url", { ... })
  const callN8N = async (type, text) => {
    // Example structure (you will fill this later):
    /*
    const res = await fetch("https://n8n.yourdomain.com/webhook/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: type, content: text }),
    });

    const data = await res.json();
    return data.result;
    */

    // TEMPORARY MOCK (remove after connecting to n8n) -> Nanti apus aja
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === "questions") {
          resolve(
            `Generated Practice Questions:\n
1. What is the main concept discussed in the text?
2. How does it relate to previous topics?
3. Can you explain the key principles?
4. What is the real-world application?
5. What parts are still unclear?`
          );
        } else {
          resolve(
            `Summary:\n
This content covers the key concepts, their relationships, and the main ideas. It emphasizes understanding core principles and how they apply in real scenarios.`
          );
        }
      }, 1000);
    });
  };

  // Main handler (summary/questions)
  const handleGenerate = async (type) => {
    if (!input.trim()) {
      alert("Please enter some content first.");
      return;
    }

    setLoading(true);

    const result = await callN8N(type, input);
    setOutput(result);
    setLoading(false);

    alert(`Your ${type === "questions" ? "questions" : "summary"} are ready!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Generator</h1>
        <p className="text-gray-600">
          Generate study questions and summaries powered by AI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-5 bg-white shadow rounded-xl">
          <img src="brain.svg" alt="" className="h-6 w-6 mb-2" />
          <h3 className="text-lg font-semibold">Smart Analysis</h3>
          <p className="text-gray-600 text-sm">
            Understand your content faster.
          </p>
        </div>

        <div className="p-5 bg-white shadow rounded-xl">
          <img src="practice.svg" alt="" className="h-6 w-6 mb-2" />
          <h3 className="text-lg font-semibold">Practice Questions</h3>
          <p className="text-gray-600 text-sm">Improve active recall.</p>
        </div>

        <div className="p-5 bg-white shadow rounded-xl">
          <img src="summary.svg" alt="" className="h-6 w-6 mb-2" />

          <h3 className="text-lg font-semibold">Quick Summaries</h3>
          <p className="text-gray-600 text-sm">
            Shrink long content instantly.
          </p>
        </div>
      </div>

      <div className="p-6 bg-white shadow rounded-xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Generate Content</h2>
          <p className="text-gray-600 text-sm">
            Paste your study material below.
          </p>
        </div>

        <textarea
          className="w-full min-h-[200px] border-[1.5px] border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Paste your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleGenerate("questions")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          <button
            onClick={() => handleGenerate("summary")}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-full bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 disabled:opacity-60 transition"
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </div>
      </div>

      {output && (
        <div className="p-6 bg-white shadow rounded-xl space-y-3">
          <h2 className="text-lg font-semibold">Generated Output</h2>

          <div className="rounded-lg bg-gray-100 p-4 text-sm whitespace-pre-wrap">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
