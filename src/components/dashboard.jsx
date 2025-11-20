import { useEffect, useState } from "react";
import { StatCard } from "./StatCard";
import { supabase } from "../supabaseClient";

// simple local progress bar component
function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch todos from Supabase ----
  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todo-list")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading todos for dashboard:", error);
      } else {
        setTodos(data);
      }
      setLoading(false);
    };

    fetchTodos();
  }, []);

  // ---- Derived stats / summaries ----

  // helpers for priority stats
  const getPriorityStats = (priority) => {
    const all = todos.filter((t) => t.priority === priority);
    const done = all.filter((t) => t.completed);
    const total = all.length;
    const completed = done.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const highStats = getPriorityStats("high");
  const medStats = getPriorityStats("medium");
  const lowStats = getPriorityStats("low");

  const openTasks = todos.filter((t) => !t.completed).length;
  const completedTasks = todos.filter((t) => t.completed).length;

  // recent completed todos (for Recent Activity)
  const recentCompleted = [...todos]
    .filter((t) => t.completed)
    .sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at).getTime();
      const timeB = new Date(b.updated_at || b.created_at).getTime();
      return timeB - timeA;
    })
    .slice(0, 5);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-500">
          See your to-do list at a glance and track your productivity.
        </p>
      </div>

      {/* ---- Top Stats (now partially dynamic) ---- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Tasks"
          value={loading ? "-" : String(openTasks)}
          icon="📝"
          trend=""
          description="tasks left in your to-do list"
        />

        <StatCard
          title="Tasks Completed"
          value={loading ? "-" : String(completedTasks)}
          icon="✅"
          trend=""
          description="done in total"
        />

        <StatCard
          title="High Priority Done"
          value={
            loading ? "-" : `${highStats.completed}/${highStats.total || 0}`
          }
          icon="⚡"
          trend=""
          description="high priority tasks completed"
        />

        <StatCard
          title="Medium + Low Tasks"
          value={
            loading
              ? "-"
              : `${medStats.completed + lowStats.completed}/${
                  (medStats.total || 0) + (lowStats.total || 0)
                }`
          }
          icon="📚"
          trend=""
          description="medium & low priority completed"
        />
      </div>

      {/* ---- TO-DO Progress (by priority) ---- */}
      <div className="grid gap-6 md:grid-cols-1">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Today&apos;s To-Do Overview
            </h2>
            <p className="text-sm text-gray-500">
              Progress based on task priority
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading overview...</p>
          ) : (
            <div className="space-y-4">
              {/* High Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">High priority</span>
                  <span className="text-gray-500">
                    {highStats.completed}/{highStats.total} done
                  </span>
                </div>
                <ProgressBar value={highStats.percent} />
              </div>

              {/* Medium Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Medium priority</span>
                  <span className="text-gray-500">
                    {medStats.completed}/{medStats.total} done
                  </span>
                </div>
                <ProgressBar value={medStats.percent} />
              </div>

              {/* Low Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Low priority</span>
                  <span className="text-gray-500">
                    {lowStats.completed}/{lowStats.total} done
                  </span>
                </div>
                <ProgressBar value={lowStats.percent} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Recent Activity (auto from completed todos) ---- */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading activity...</p>
        ) : recentCompleted.length === 0 ? (
          <p className="text-sm text-gray-500">
            No completed tasks yet. Finish a task to see it here.
          </p>
        ) : (
          <div className="space-y-4">
            {recentCompleted.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 pb-3 border-b last:border-0"
              >
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${
                    item.priority === "high"
                      ? "bg-red-500"
                      : item.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed: {item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.category || "General"} • {item.priority} priority
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {formatTime(item.updated_at || item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
