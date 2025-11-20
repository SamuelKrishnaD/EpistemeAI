import React from "react";

const sidebar = () => {
  return (
    <div className="sidebar-container flex flex-col ms-[18px]">
      <h1 className="self-start mt-[16px] mb-[32px]">EpistemeAI</h1>
      <p className="self-start mt-[48px] mb-[8px]">Main menu</p>
      <div className="sidebar-content flex flex-col space-y-[8px]">
        <div className="sidebar-link">
          <img src="house.svg" alt="dashboard-image" />
          <a href=""> Dashboard</a>
        </div>

        <div className="sidebar-link">
          <img src="brain.svg" alt="ai-image" />
          <a href="">AI Generator</a>
        </div>

        <div className="sidebar-link">
          <img src="todo.svg" alt="todo-image" />
          <a href="">To-Do List</a>
        </div>

        <div className="sidebar-link">
          <img src="timer.svg" alt="" />
          <a href="">Pomodoro</a>
        </div>
      </div>
    </div>
  );
};

export default sidebar;
