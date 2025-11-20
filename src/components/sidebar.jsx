import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar-container flex flex-col ms-[18px] h-full border-r-[1.5px] border-gray-200">
      <div className="sidebar-title self-start mt-[16px] mb-[32px] flex flex-row">
        <img
          src="logoEpisteme.png"
          alt="logoEpisteme"
          className="w-[42px] h-[42px]"
        />
        <h1 className="text-[24px] font-semibold ps-[6px]">EpistemeAI</h1>
      </div>

      <p className="self-start mt-[48px] mb-[8px]">Main menu</p>

      <div className="sidebar-content flex flex-col space-y-[8px]">
        <div className="sidebar-link flex items-center gap-2">
          <img src="house.svg" alt="dashboard-image" />
          <NavLink to="/">Dashboard</NavLink>
        </div>

        <div className="sidebar-link flex items-center gap-2">
          <img src="brain.svg" alt="ai-image" />
          <NavLink to="/AI-Generator">AI Generator</NavLink>
        </div>

        <div className="sidebar-link flex items-center gap-2">
          <img src="todo.svg" alt="todo-image" />
          <NavLink to="/To-do-List">To-Do List</NavLink>
        </div>

        <div className="sidebar-link flex items-center gap-2">
          <img src="timer.svg" alt="pomodoro-image" />
          <NavLink to="/Pomodoro-Timer">Pomodoro</NavLink>
        </div>
      </div>

      <div className="sidebar-account mt-auto mb-[24px] rounded-4xl bg-gray-200 flex flex-row space-x-[8px] me-[12px] ps-[12px] py-[8px]">
        <img src="user.svg" alt="profile-image" />
        <p>Windah Cipularang</p>
      </div>
    </div>
  );
};

export default Sidebar;
