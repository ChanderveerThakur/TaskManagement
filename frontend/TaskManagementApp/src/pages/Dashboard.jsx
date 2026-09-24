import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Modals & Toast state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;
    api.get("/tasks/")
      .then((res) => {
        if (isMounted) {
          setTasks(res.data || []);
        }
      })
      .catch((err) => {
        console.error("fetchTasks error:", err);
        if (isMounted && err.response?.status !== 401) {
          setError("Unable to load tasks. Make sure your backend server is running.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateOrUpdateTask = async (taskData) => {
    if (selectedTask) {
      // Update
      const response = await api.put(`/tasks/${selectedTask.id}/`, taskData);
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? response.data : t))
      );
      showToast("Task updated successfully!");
    } else {
      // Create
      const response = await api.post("/tasks/", taskData);
      setTasks((prev) => [response.data, ...prev]);
      showToast("New task created!");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Task deleted.", "info");
    } catch {
      showToast("Failed to delete task.", "error");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data : t))
      );
      showToast(`Status updated to ${newStatus}`);
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  // Metrics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;

    const highPriority = tasks.filter((t) => t.priority?.toLowerCase() === "high").length;
    const medPriority = tasks.filter((t) => t.priority?.toLowerCase() === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority?.toLowerCase() === "low").length;

    return { total, completed, inProgress, pending, highPriority, medPriority, lowPriority };
  }, [tasks]);

  // Dynamic filter toggling from stat cards
  const handleStatCardClick = (targetStatus) => {
    if (targetStatus === "Total") {
      setStatusFilter("All");
    } else if (statusFilter === targetStatus) {
      setStatusFilter("All");
    } else {
      setStatusFilter(targetStatus);
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query);

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
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Task Workspace</h1>
            <p className="dashboard-subtitle">
              Plan, organize, and monitor your personal and team tasks
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Create New Task</span>
          </button>
        </header>

        {/* Dynamic Interactive Stats Grid */}
        <section className="stats-grid" aria-label="Task Statistics">
          {/* Total Tasks */}
          <div
            className={`glass-card stat-card ${statusFilter === "All" ? "active" : ""}`}
            onClick={() => handleStatCardClick("Total")}
            title="Click to show all tasks"
          >
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

          {/* In Progress */}
          <div
            className={`glass-card stat-card ${statusFilter === "In Progress" ? "active" : ""}`}
            onClick={() => handleStatCardClick("In Progress")}
            title="Click to filter by In Progress"
          >
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

          {/* Pending */}
          <div
            className={`glass-card stat-card ${statusFilter === "Pending" ? "active" : ""}`}
            onClick={() => handleStatCardClick("Pending")}
            title="Click to filter by Pending"
          >
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

          {/* Completed */}
          <div
            className={`glass-card stat-card ${statusFilter === "Completed" ? "active" : ""}`}
            onClick={() => handleStatCardClick("Completed")}
            title="Click to filter by Completed"
          >
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
        </section>

        {/* Dynamic Controls Bar */}
        <section className="glass-card controls-panel" aria-label="Filters and search">
          <div className="controls-top">
            {/* Search Bar */}
            <div className="search-wrapper">
              <span className="search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search tasks... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="search-clear"
                  aria-label="Clear search query"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & View Mode Switcher */}
            <div className="controls-actions">
              <div className="sort-group">
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort tasks by"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority (High → Low)</option>
                </select>
              </div>

              {/* View mode toggle (Grid vs List) */}
              <div className="view-switcher" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                  aria-label="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Rows: Status and Priority Pills with dynamic item counts */}
          <div className="filters-row">
            {/* Status Pills */}
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <div className="filter-pills" role="radiogroup">
                {[
                  { id: "All", count: stats.total },
                  { id: "Pending", count: stats.pending },
                  { id: "In Progress", count: stats.inProgress },
                  { id: "Completed", count: stats.completed },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`filter-pill ${statusFilter === item.id ? "active" : ""}`}
                    onClick={() => setStatusFilter(item.id)}
                  >
                    <span>{item.id}</span>
                    <span className="filter-pill-count">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Pills */}
            <div className="filter-group">
              <span className="filter-label">Priority:</span>
              <div className="filter-pills" role="radiogroup">
                {[
                  { id: "All", count: stats.total },
                  { id: "High", count: stats.highPriority },
                  { id: "Medium", count: stats.medPriority },
                  { id: "Low", count: stats.lowPriority },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`filter-pill ${priorityFilter === item.id ? "active" : ""}`}
                    onClick={() => setPriorityFilter(item.id)}
                  >
                    <span>{item.id}</span>
                    <span className="filter-pill-count">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

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
          viewMode === "list" ? (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isListView={true}
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
            <div className="tasks-grid">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isListView={false}
                  onEdit={(taskToEdit) => {
                    setSelectedTask(taskToEdit);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        ) : (
          <div className="glass-card empty-state">
            <div className="empty-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3 className="empty-title">No tasks found</h3>
            <p className="empty-subtitle">
              {searchQuery || statusFilter !== "All" || priorityFilter !== "All"
                ? "No tasks match your current filters. Try changing or clearing your filters."
                : "You don't have any tasks created yet. Click 'Create New Task' to begin organizing!"}
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

      {/* Floating Action Button (FAB) for Mobile Viewports */}
      <button
        className="fab-btn"
        onClick={() => {
          setSelectedTask(null);
          setIsModalOpen(true);
        }}
        aria-label="Create new task"
        title="Create new task"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Dynamic Toast Notifications */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        key={isModalOpen ? (selectedTask ? selectedTask.id : "new-task") : "closed-task"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={selectedTask}
      />
    </>
  );
};

export default Dashboard;
