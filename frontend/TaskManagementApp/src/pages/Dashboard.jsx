import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/tasks/");
      setTasks(response.data || []);
    } catch (err) {
      console.error("fetchTasks error:", err);
      if (err.response?.status !== 401) {
        setError("Unable to load tasks. Make sure your backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTask = async (taskData) => {
    if (selectedTask) {
      // Update
      const response = await api.put(`/tasks/${selectedTask.id}/`, taskData);
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? response.data : t))
      );
    } else {
      // Create
      const response = await api.post("/tasks/", taskData);
      setTasks((prev) => [response.data, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data : t))
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Metrics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const matchesSearch =
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus =
          statusFilter === "All" || task.status === statusFilter;

        // Priority filter
        const matchesPriority =
          priorityFilter === "All" ||
          task.priority?.toLowerCase() === priorityFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === "dueDate") {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        }
        if (sortBy === "priority") {
          const weights = { High: 3, Medium: 2, Low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("newest");
  };

  return (
    <>
      <Navbar user={user} onLogout={() => setUser(null)} />

      <main className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="dashboard-title">My Tasks</h1>
            <p className="dashboard-subtitle">
              Manage, organize, and prioritize your daily workflow
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
            id="create-task-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Task
          </button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-info">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <div className="stat-label">In Progress</div>
              <div className="stat-value" style={{ color: "#60a5fa" }}>{stats.inProgress}</div>
            </div>
            <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: "#fbbf24" }}>{stats.pending}</div>
            </div>
            <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-info">
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color: "#34d399" }}>{stats.completed}</div>
            </div>
            <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Controls Panel (Search, Filter by Status, Filter by Priority, Sort) */}
        <div className="glass-card controls-panel">
          <div className="controls-top">
            <div className="search-wrapper">
              <span className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label htmlFor="sort-select" className="filter-label">Sort By:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Filter Rows: Status and Priority */}
          <div className="filters-row">
            {/* Filter by Status */}
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <div className="filter-pills">
                {["All", "Pending", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    className={`filter-pill ${statusFilter === status ? "active" : ""}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Priority */}
            <div className="filter-group" style={{ marginLeft: "auto" }}>
              <span className="filter-label">Priority:</span>
              <div className="filter-pills">
                {["All", "Low", "Medium", "High"].map((priority) => (
                  <button
                    key={priority}
                    className={`filter-pill ${priorityFilter === priority ? "active" : ""}`}
                    onClick={() => setPriorityFilter(priority)}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {/* Task List / Empty State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px", color: "var(--text-secondary)" }}>
            Loading your tasks...
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(taskToEdit) => {
                  setSelectedTask(taskToEdit);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card empty-state">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3 className="empty-title">No tasks found</h3>
            <p className="empty-subtitle">
              {searchQuery || statusFilter !== "All" || priorityFilter !== "All"
                ? "No tasks match your current filter criteria. Try resetting your filters."
                : "You don't have any tasks created yet. Click 'Create New Task' to get started!"}
            </p>
            {searchQuery || statusFilter !== "All" || priorityFilter !== "All" ? (
              <button onClick={resetFilters} className="btn btn-secondary btn-sm">
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </main>

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={selectedTask}
      />
    </>
  );
};

export default Dashboard;
