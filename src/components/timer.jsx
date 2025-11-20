import { useState, useEffect } from "react";

export default function Pomodoro() {
  // settings
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // state
  const [sessionType, setSessionType] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // total seconds for current session
  const totalSeconds =
    (sessionType === "focus" ? focusMinutes : breakMinutes) * 60;

  const progress =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  // keep secondsLeft in sync when settings change (while not running)
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(
        (sessionType === "focus" ? focusMinutes : breakMinutes) * 60
      );
    }
  }, [focusMinutes, breakMinutes, sessionType, isRunning]);

  // timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return prev; // will be overwritten in handleSessionComplete
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, sessionType, focusMinutes, breakMinutes]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (sessionType === "focus") {
      setSessionsCompleted((prev) => prev + 1);
      setSessionType("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setSessionType("focus");
      setSecondsLeft(focusMinutes * 60);
    }
  };

  const handleStartPause = () => {
    if (secondsLeft === 0) {
      // if finished, restart current session
      setSecondsLeft(
        (sessionType === "focus" ? focusMinutes : breakMinutes) * 60
      );
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(
      (sessionType === "focus" ? focusMinutes : breakMinutes) * 60
    );
  };

  const handleSetFocus = () => {
    setIsRunning(false);
    setSessionType("focus");
    setSecondsLeft(focusMinutes * 60);
  };

  const handleSetBreak = () => {
    setIsRunning(false);
    setSessionType("break");
    setSecondsLeft(breakMinutes * 60);
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Pomodoro Timer
        </h1>
        <p className="text-gray-600 text-sm">
          Stay focused, one session at a time.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Session info + timer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            {sessionType === "focus" ? "Focus Session" : "Break Time"}
          </p>
          <div className="text-6xl sm:text-7xl font-mono font-bold">
            {formatTime(secondsLeft)}
          </div>

          {/* Simple progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleStartPause}
            className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-100 transition"
          >
            Reset
          </button>
        </div>

        {/* Session type buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleSetFocus}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              sessionType === "focus"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Focus
          </button>
          <button
            onClick={handleSetBreak}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              sessionType === "break"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Break
          </button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={focusMinutes}
              disabled={isRunning}
              onChange={(e) =>
                setFocusMinutes(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              disabled={isRunning}
              onChange={(e) =>
                setBreakMinutes(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
