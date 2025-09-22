import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function TaskForm({ onCreate, editing, onCancel }) {
  const [form, setForm] = useState(
    editing || { title: "", description: "", dueDate: "", priority: "Medium" }
  );

  useEffect(() => {
    setForm(
      editing || { title: "", description: "", dueDate: "", priority: "Medium" }
    );
  }, [editing]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate(form);
    setForm({ title: "", description: "", dueDate: "", priority: "Medium" });
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <input
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
      />
      <div className="row">
        <input
          name="dueDate"
          type="date"
          value={form.dueDate ? form.dueDate.slice(0, 10) : ""}
          onChange={handleChange}
        />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <div className="row actions">
        <button className="btn" type="submit">
          {editing ? "Update" : "Add Task"}
        </button>
        {editing && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createOrUpdate = async (data) => {
    try {
      if (editing) {
        const res = await api.updateTask(editing._id, data);
        setTasks(tasks.map((t) => (t._id === res.data._id ? res.data : t)));
        setEditing(null);
      } else {
        const res = await api.createTask(data);
        setTasks([res.data, ...tasks]);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await api.updateTask(task._id, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t._id === res.data._id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task) => setEditing(task);
  const cancelEdit = () => setEditing(null);

  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Completed") return t.completed;
    if (filter === "Active") return !t.completed;
    if (filter === "High") return t.priority === "High";
    return true;
  });

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1 className="brand">PinkTasks</h1>
        <div className="user-area">
          <div className="user-name">Hi, {user?.name}</div>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content">
        <div className="left">
          <TaskForm
            onCreate={createOrUpdate}
            editing={editing}
            onCancel={cancelEdit}
          />
          <div className="filters">
            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => setFilter("All")}
            >
              All
            </button>
            <button
              className={filter === "Active" ? "active" : ""}
              onClick={() => setFilter("Active")}
            >
              Active
            </button>
            <button
              className={filter === "Completed" ? "active" : ""}
              onClick={() => setFilter("Completed")}
            >
              Completed
            </button>
            <button
              className={filter === "High" ? "active" : ""}
              onClick={() => setFilter("High")}
            >
              High Priority
            </button>
          </div>
        </div>

        <div className="right">
          <h2>Tasks</h2>
          {loading ? (
            <div>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="muted">No tasks yet.</div>
          ) : (
            <ul className="task-list">
              {filtered.map((task) => (
                <li
                  key={task._id}
                  className={`task ${task.completed ? "done" : ""}`}
                >
                  <div className="task-left">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                    />
                    <div>
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        {task.priority} •{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </div>
                      {task.description && (
                        <div className="task-desc">{task.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn ghost small"
                      onClick={() => startEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger small"
                      onClick={() => remove(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="footer">
        <div>Made with ♥ · PinkTasks</div>
      </footer>
    </div>
  );
}
