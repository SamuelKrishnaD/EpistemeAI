import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Sidebar from "./components/sidebar.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="content-container flex flex-row h-screen max-w-full">
      <div className="w-56 flex-none bg-white">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 bg-slate-100">
        <h1>Hello</h1>
      </div>
    </div>
  );
}

export default App;
