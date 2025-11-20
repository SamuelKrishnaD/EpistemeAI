import { useEffect, useState } from "react";
import AddTodoForm from "./addTodoForm";
import { supabase } from "../supabaseClient";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todo-list")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading todos:", error);
      } else {
        setTodos(data);
      }
      setLoading(false);
    };

    fetchTodos();
  }, []);

  const handleAddTodo = (todoFromSupabase) => {
    setTodos((prev) => [...prev, todoFromSupabase]);
  };

  const toggleTodo = async (todo) => {
    const { data, error } = await supabase
      .from("todo-list")
      .update({ completed: !todo.completed })
      .eq("id", todo.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to toggle todo:", error);
      return;
    }

    setTodos((prev) => prev.map((t) => (t.id === todo.id ? data : t)));
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from("todo-list").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete todo:", error);
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <AddTodoForm onAdd={handleAddTodo} />

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <p className="text-sm text-gray-500">
            No tasks yet. Add one above ✏️
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      todo.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {todo.title}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {todo.category} •{" "}
                    <span
                      className={
                        todo.priority === "high"
                          ? "text-red-500"
                          : todo.priority === "low"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }
                    >
                      {todo.priority}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => toggleTodo(todo)}
                    className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
                  >
                    {todo.completed ? "Undo" : "Done"}
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
