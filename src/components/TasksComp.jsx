// src/components/TasksComp.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  setLoading,
  setError,
  setRunningTask,
} from "../store/tasksSlice";
import CalendarService from "../services/CalendarService";
import Button from "./Button";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";
import { div } from "motion/react-client";

function TasksComp({
  className = "",
  fixedHeight,
  custom,
  totalTime,
  isRunning,
  timer = false,
}) {
  const { tasks, loading, runningTask } = useSelector((state) => state.tasks);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  console.log(runningTask);

  useEffect(() => {
    const fetchTasks = async () => {
      const calendarService = new CalendarService();
      dispatch(setLoading(true));
      try {
        const fetchedTasks = await calendarService.fetchTasks();
        dispatch(setTasks(fetchedTasks));
      } catch (error) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchTasks();
  }, [dispatch]);

  const toggleTaskStatus = async (task) => {
    const calendarService = new CalendarService();
    const newStatus = !task.done;
    try {
      await calendarService.updateTaskStatus(task.id, newStatus);
      dispatch(setLoading(true));
      const fetchedTasks = await calendarService.fetchTasks();
      dispatch(setTasks(fetchedTasks));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredTasks = tasks.filter((task) => {
    if (filter === "done") return task.done;
    if (filter === "today") {
      // Compare local dates
      const taskDate = new Date(task.start).toLocaleDateString();
      const todayLocal = new Date().toLocaleDateString();
      return taskDate === todayLocal;
    }
    return true;
  });

  const handlePlayTask = (task) => {
    const startDate = new Date(task.start);
    const endDate = new Date(task.end);
    const totalSeconds = Math.floor((endDate - startDate) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    custom(h, m, s);
    dispatch(setRunningTask(task));
  };

  useEffect(() => {
    if (totalTime === 0 && runningTask) {
      toggleTaskStatus(runningTask);
    }
  }, [totalTime, runningTask]);

  return (
    <div className={className}>
      <h2 className="text-lg text-center mb-2 bg-secondary font-bold text-gray-800">
        Tasks
      </h2>
      <div className="flex justify-start gap-2 mb-2">
        <button
          className={`px-3 py-0 h-6 text-sm font-bold rounded cursor-pointer ${
            filter === "all" ? "bg-slate-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-0 h-6 text-sm font-bold rounded cursor-pointer ${
            filter === "done" ? "bg-slate-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("done")}
        >
          Done
        </button>
        <button
          className={`px-3 py-0 h-6 text-sm font-bold rounded cursor-pointer ${
            filter === "today" ? "bg-slate-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("today")}
        >
          Today
        </button>
      </div>
      <div className={fixedHeight}>
        {filteredTasks.length === 0 ? (
          <p>No tasks available...</p>
        ) : (
          <ul className="space-y-4 py-2">
            {filteredTasks.map((task) => (
              <li
                onClick={
                  timer && !task.done ? () => handlePlayTask(task) : () => {}
                }
                key={task.id}
                className={`px-2 flex gap-2 items-center justify-between relative border border-slate-300 rounded shadow-sm transition-all duration-200 cursor-pointer ${
                  (task.done ? "!bg-green-200 " : "bg-white",
                  runningTask.id == task.id
                    ? "bg-yellow-200"
                    : task.done
                    ? "bg-green-200"
                    : "bg-white")
                }`}
              >
                <div className="flex flex-col justify-center">
                  <h2 className="font-bold text-lg">{task.title}</h2>
                  {!task.done && (
                    <>
                      <p className="text-xs">
                        <span className="font-semibold text-sm">Start:</span>{" "}
                        {new Date(task.start).toLocaleString()}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold text-sm">End:</span>{" "}
                        {new Date(task.end).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                {timer ? (
                  <></>
                ) : (
                  <div className="flex items-center justify-center ">
                    {loading ? (
                      <div>
                        <Spin indicator={<LoadingOutlined spin />} />
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all duration-200 cursor-pointer hover:rotate-12 hover:scale-105 ${
                          task.done
                            ? "border-green-500 bg-green-400"
                            : "border-gray-400 hover:bg-green-200 bg-white"
                        }`}
                      >
                        {task.done && (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TasksComp;
