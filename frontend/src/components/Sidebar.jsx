
function Sidebar({ role, onLogout, activePage, onNavigate }) {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">

        <div className="logo-icon">
          E
        </div>

        <div>
          <h2>ExamPortal</h2>
          <span>Online Examination</span>
        </div>

      </div>


      {/* Menu */}
      <div className="sidebar-section">

        <p className="sidebar-label">
          MENU
        </p>


        {/* Dashboard */}
        <button
          className={`sidebar-item ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          <span>▣</span>
          Dashboard
        </button>


        {/* Exams */}
        <button
          className={`sidebar-item ${
            activePage === "exams" ? "active" : ""
          }`}
          onClick={() => onNavigate("exams")}
        >
          <span>◫</span>
          Exams
        </button>


        {/* Questions - Admin only */}
        {role === "admin" && (
          <button
            className={`sidebar-item ${
              activePage === "questions" ? "active" : ""
            }`}
            onClick={() => onNavigate("questions")}
          >
            <span>☷</span>
            Questions
          </button>
        )}


        {/* Results */}
        <button
          className={`sidebar-item ${
            activePage === "results" ? "active" : ""
          }`}
          onClick={() => onNavigate("results")}
        >
          <span>◉</span>
          Results
        </button>

      </div>


      {/* Bottom */}
      <div className="sidebar-bottom">

        <div className="profile-box">

          <div className="profile-avatar">
            {role === "admin" ? "A" : "S"}
          </div>

          <div>

            <strong>
              {role === "admin"
                ? "Administrator"
                : "Student"}
            </strong>

            <span>
              {role === "admin"
                ? "Admin Account"
                : "Student Account"}
            </span>

          </div>

        </div>


        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;



