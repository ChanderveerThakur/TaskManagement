import React from "react";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress":
        return "badge-status-in-progress";
      case "Completed":
        return "badge-status-completed";
      default:
        return "badge-status-pending";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-priority-high";
      case "medium":
        return "badge-priority-medium";
      default:
        return "badge-priority-low";
    }
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === "Completed") return false;
    const due = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className={`glass-card task-card priority-${task.priority?.toLowerCase() || 'medium'}`}>
      <div>
        <div className="task-card-header">
          <h4 className="task-card-title">{task.title}</h4>
          <div className="task-card-actions">
            <button
              onClick={() => onEdit(task)}
              className="btn-icon"
              title="Edit Task"
              aria-label="Edit"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="btn-icon"
              title="Delete Task"
              aria-label="Delete"
              style={{ color: "#f87171" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}
      </div>

      <div className="task-card-footer">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Status badge with interactive dropdown */}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className={`badge ${getStatusClass(task.status)}`}
            style={{
              padding: "4px 8px",
              cursor: "pointer",
              border: "1px solid var(--border-subtle)",
              background: "inherit"
            }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority badge */}
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {task.due_date && (
          <div className={`task-due-date ${overdue ? "overdue" : ""}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formatDate(task.due_date)}</span>
            {overdue && <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>• Overdue</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
