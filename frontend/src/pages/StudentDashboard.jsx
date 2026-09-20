import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ExamPage from "./ExamPage";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

function StudentDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "exams"));

        const examList = snapshot.docs.map((examDoc) => ({
          id: examDoc.id,
          ...examDoc.data(),
        }));

        setExams(examList);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleNavigation = (page) => {
    setActivePage(page);
  };

  const startExam = (examId) => {
    setSelectedExamId(examId);
  };

  const goBackFromExam = () => {
    setSelectedExamId(null);
  };

  // Show the actual exam page
  if (selectedExamId) {
    return (
      <ExamPage
        examId={selectedExamId}
        onBack={goBackFromExam}
      />
    );
  }

  const renderDashboard = () => {
    return (
      <>
        <div className="welcome-card">
          <div>
            <p className="welcome-small">WELCOME BACK</p>

            <h1>Welcome, Student! 👋</h1>

            <p>
              Ready to continue your learning journey? Take your exams
              and check your results here.
            </p>
          </div>

          <div className="welcome-icon">
            🎓
          </div>
        </div>

        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>Your examination activity</p>
          </div>
        </div>

        <div className="stats">

          <StatCard
            title="Available Exams"
            value={exams.length}
            icon="📝"
          />

          <StatCard
            title="Completed Exams"
            value="0"
            icon="✅"
          />

          <StatCard
            title="Results"
            value="0"
            icon="📊"
          />

        </div>

        <div className="content-card">

          <div className="section-heading">
            <div>
              <h2>Available Exams</h2>
              <p>Start your examination from here</p>
            </div>
          </div>

          {loading ? (
            <p>Loading exams...</p>
          ) : exams.length === 0 ? (
            <div className="student-empty-card">
              <h3>No exams available</h3>
              <p>
                Your administrator has not created any exams yet.
              </p>
            </div>
          ) : (
            exams.map((exam) => (
              <div
                className="student-mini-card"
                key={exam.id}
              >
                <div className="exam-card-icon">
                  📝
                </div>

                <div className="exam-card-content">

                  <h3>{exam.title}</h3>

                  <p>
                    {exam.description ||
                      "Test your knowledge with this examination."}
                  </p>

                  <div className="exam-meta">
                    <span>
                      ⏱ {exam.duration || 30} minutes
                    </span>

                    <span>
                      📋 Questions available
                    </span>
                  </div>

                </div>

                <button
                  className="start-exam-btn"
                  onClick={() => startExam(exam.id)}
                >
                  Start Exam
                </button>

              </div>
            ))
          )}

        </div>
      </>
    );
  };

  const renderExams = () => {
    return (
      <>
        <div className="section-heading">
          <div>
            <h2>Available Exams</h2>
            <p>Choose an exam to start</p>
          </div>
        </div>

        {loading ? (
          <p>Loading exams...</p>
        ) : exams.length === 0 ? (
          <div className="student-empty-card">
            <h3>No Exams Available</h3>

            <p>
              Your administrator has not created any exams yet.
            </p>
          </div>
        ) : (
          <div className="exam-grid">

            {exams.map((exam) => (
              <div
                className="student-exam-card"
                key={exam.id}
              >

                <div className="exam-card-icon">
                  📝
                </div>

                <div className="exam-card-content">

                  <h3>{exam.title}</h3>

                  <p>
                    {exam.description ||
                      "Test your knowledge with this examination."}
                  </p>

                  <div className="exam-meta">

                    <span>
                      ⏱ {exam.duration || 30} minutes
                    </span>

                    <span>
                      📋 Questions available
                    </span>

                  </div>

                </div>

                <button
                  className="start-exam-btn"
                  onClick={() => startExam(exam.id)}
                >
                  Start Exam
                </button>

              </div>
            ))}

          </div>
        )}
      </>
    );
  };

  const renderResults = () => {
    return (
      <>
        <div className="section-heading">
          <div>
            <h2>My Results</h2>

            <p>
              View your examination results
            </p>
          </div>
        </div>

        <div className="empty-state">

          <div className="empty-icon">
            📊
          </div>

          <h3>No Results Yet</h3>

          <p>
            You haven't completed any exams yet.
            Your results will appear here after completing an exam.
          </p>

          <button
            className="primary-action"
            onClick={() => setActivePage("exams")}
          >
            Browse Exams
          </button>

        </div>
      </>
    );
  };

  const renderPage = () => {

    if (activePage === "exams") {
      return renderExams();
    }

    if (activePage === "results") {
      return renderResults();
    }

    return renderDashboard();
  };

  return (
    <div className="dashboard">

      <Sidebar
        role="student"
        onLogout={onLogout}
        activePage={activePage}
        onNavigate={handleNavigation}
      />

      <main className="main-content">

        <header className="topbar">

          <div>

            <p className="page-label">
              STUDENT PORTAL
            </p>

            <h2>
              {activePage === "dashboard" && "Dashboard"}

              {activePage === "exams" && "Exams"}

              {activePage === "results" && "Results"}
            </h2>

          </div>

          <div className="user-info">

            <div className="top-avatar">
              S
            </div>

            <div>

              <strong>
                Student
              </strong>

              <span>
                {user?.email}
              </span>

            </div>

          </div>

        </header>

        <section className="page-content">
          {renderPage()}
        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;