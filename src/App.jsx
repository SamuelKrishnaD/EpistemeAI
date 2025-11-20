import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/sidebar.jsx";
import Dashboard from "./components/dashboard.jsx";
import AIGenerator from "./components/aiGenerator.jsx";
import TodoList from "./components/todolist.jsx";
import Timer from "./components/timer.jsx";

function App() {
  return (
    <div className="content-container flex flex-row h-screen max-w-full">
      <div className="w-56 flex-none bg-white">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 bg-slate-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/AI-Generator" element={<AIGenerator />} />
          <Route path="/To-do-List" element={<TodoList />} />
          <Route path="/Pomodoro-Timer" element={<Timer />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
