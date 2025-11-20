import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddTodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const newTodo = {
      title: title.trim(),
      completed: false,
      priority,
      category,
    };

    // 🔥 1) Insert into Supabase
    const { data, error } = await supabase
      .from("todo-list")
      .insert([newTodo])
      .select()
      .single(); // returns the inserted row (with uuid id)

    if (error) {
      console.error(error);
      alert("Failed to add task.");
      return;
    }

    // 🔥 2) Update React state in parent with row from DB
    onAdd(data);

    // 3) Reset form
    setTitle("");
    setPriority("medium");
    setCategory("General");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">To-Do List</h1>
        <p className="text-gray-600 text-sm">
          Organize your tasks, track priorities, and manage your daily workflow
          efficiently.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 items-center bg-white rounded-xl shadow p-4"
      >
        {/* Task title */}
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />

        {/* Priority selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-[140px]"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium</option>
          <option value="high">High priority</option>
        </select>

        {/* Category */}
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-[140px]"
        />

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
