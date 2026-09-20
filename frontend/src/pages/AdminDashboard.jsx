import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  // Create exam
  const [showCreateExam, setShowCreateExam] = useState(false);

  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [examDuration, setExamDuration] = useState("");

  // Exams
  const [exams, setExams] = useState([]);

  // Messages
  const [message, setMessage] = useState("");

  // Selected exam for question management
  const [selectedExam, setSelectedExam] = useState(null);

  // Questions
  const [questions, setQuestions] = useState([]);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // --------------------------------
  // LOAD EXAMS
  // --------------------------------

  const fetchExams = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "exams")
      );

      const examList = snapshot.docs.map((examDoc) => ({
        id: examDoc.id,
        ...examDoc.data(),
      }));

      setExams(examList);
    } catch (error) {
      console.error("Error loading exams:", error);

      setMessage(
        "Unable to load exams: " + error.message
      );
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // --------------------------------
  // CREATE EXAM
  // --------------------------------

  const createExam = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const examData = {
        title: examTitle.trim(),
        description: examDescription.trim(),
        duration: Number(examDuration),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };

      const examRef = await addDoc(
        collection(db, "exams"),
        examData
      );

      console.log(
        "Exam created with ID:",
        examRef.id
      );

      setExamTitle("");
      setExamDescription("");
      setExamDuration("");

      setShowCreateExam(false);

      setMessage(
        "Exam created successfully!"
      );

      await fetchExams();

      setActivePage("exams");
    } catch (error) {
      console.error(
        "CREATE EXAM ERROR:",
        error
      );

      setMessage(
        "Exam creation failed: " +
          error.message
      );
    }
  };

  // --------------------------------
  // LOAD QUESTIONS
  // --------------------------------

  const fetchQuestions = async (examId) => {
    try {
      setLoadingQuestions(true);

      const snapshot = await getDocs(
        collection(
          db,
          "exams",
          examId,
          "questions"
        )
      );

      const questionList =
        snapshot.docs.map((questionDoc) => ({
          id: questionDoc.id,
          ...questionDoc.data(),
        }));

      setQuestions(questionList);
    } catch (error) {
      console.error(
        "Error loading questions:",
        error
      );

      setMessage(
        "Unable to load questions: " +
          error.message
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  // --------------------------------
  // OPEN QUESTION MANAGEMENT
  // --------------------------------

  const manageQuestions = async (exam) => {
    setSelectedExam(exam);

    setActivePage("questions");

    setMessage("");

    setShowAddQuestion(false);

    await fetchQuestions(exam.id);
  };

  // --------------------------------
  // ADD QUESTION
  // --------------------------------

  const addQuestion = async (e) => {
    e.preventDefault();

    if (!selectedExam) {
      return;
    }

    setMessage("");

    try {
      const questionData = {
        question: questionText.trim(),

        optionA: optionA.trim(),

        optionB: optionB.trim(),

        optionC: optionC.trim(),

        optionD: optionD.trim(),

        correctAnswer,

        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(
          db,
          "exams",
          selectedExam.id,
          "questions"
        ),
        questionData
      );

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");

      setShowAddQuestion(false);

      setMessage(
        "Question added successfully!"
      );

      await fetchQuestions(selectedExam.id);
    } catch (error) {
      console.error(
        "ADD QUESTION ERROR:",
        error
      );

      setMessage(
        "Question creation failed: " +
          error.message
      );
    }
  };

  // --------------------------------
  // SIDEBAR NAVIGATION
  // --------------------------------

  const handleNavigation = (page) => {
    setActivePage(page);

    setMessage("");

    if (page === "exams") {
      fetchExams();
    }
  };

  // --------------------------------
  // DASHBOARD
  // --------------------------------

  const renderDashboard = () => {
    return (
      <>
        <div className="welcome-card">
          <div>
            <p className="welcome-small">
              WELCOME BACK 👋
            </p>

            <h2>
              Manage your examinations
            </h2>

            <p>
              Create exams, manage questions and
              monitor student performance from one
              place.
            </p>
          </div>

          <div className="welcome-icon">
            ✦
          </div>
        </div>

        <section className="stats-section">
          <div className="section-heading">
            <h2>Overview</h2>

            <span>
              System statistics
            </span>
          </div>

          <div className="stats">
            <StatCard
              title="Total Exams"
              value={exams.length}
              icon="▣"
            />

            <StatCard
              title="Total Questions"
              value="0"
              icon="☷"
            />

            <StatCard
              title="Total Students"
              value="0"
              icon="◉"
            />
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>
                Exam Management
              </h2>

              <span>
                Create and manage your
                examinations
              </span>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setShowCreateExam(true)
              }
            >
              + Create Exam
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ▣
              </div>

              <h3>
                No exams created yet
              </h3>

              <p>
                Create your first examination
                to get started.
              </p>

              <button
                className="primary-action"
                onClick={() =>
                  setShowCreateExam(true)
                }
              >
                Create Your First Exam
              </button>
            </div>
          ) : (
            <div className="exam-grid">
              {exams.slice(0, 3).map((exam) => (
                <div
                  className="student-exam-card"
                  key={exam.id}
                >
                  <div className="exam-card-icon">
                    ▣
                  </div>

                  <div className="exam-card-content">
                    <h3>
                      {exam.title}
                    </h3>

                    <p>
                      {exam.description}
                    </p>

                    <div className="exam-meta">
                      <span>
                        ⏱ {exam.duration} Minutes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  // --------------------------------
  // EXAMS
  // --------------------------------

  const renderExams = () => {
    return (
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>
              Exam Management
            </h2>

            <span>
              All examinations created by
              the administrator
            </span>
          </div>

          <button
            className="primary-action"
            onClick={() =>
              setShowCreateExam(true)
            }
          >
            + Create Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ▣
            </div>

            <h3>
              No exams available
            </h3>

            <p>
              Create your first examination.
            </p>

            <button
              className="primary-action"
              onClick={() =>
                setShowCreateExam(true)
              }
            >
              Create Exam
            </button>
          </div>
        ) : (
          <div className="exam-grid">
            {exams.map((exam) => (
              <div
                className="student-exam-card"
                key={exam.id}
              >
                <div className="exam-card-icon">
                  ▣
                </div>

                <div className="exam-card-content">
                  <h3>
                    {exam.title}
                  </h3>

                  <p>
                    {exam.description}
                  </p>

                  <div className="exam-meta">
                    <span>
                      ⏱ {exam.duration} Minutes
                    </span>
                  </div>

                  <button
                    className="start-exam-btn"
                    onClick={() =>
                      manageQuestions(exam)
                    }
                  >
                    Manage Questions →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // --------------------------------
  // QUESTIONS
  // --------------------------------

  const renderQuestions = () => {
    if (!selectedExam) {
      return (
        <section className="content-card">
          <div className="empty-state">
            <div className="empty-icon">
              ☷
            </div>

            <h3>
              Select an examination
            </h3>

            <p>
              Select an exam from Exam
              Management to add questions.
            </p>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("exams")
              }
            >
              View Exams
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>
              {selectedExam.title}
            </h2>

            <span>
              Manage questions for this
              examination
            </span>
          </div>

          <button
            className="primary-action"
            onClick={() =>
              setShowAddQuestion(true)
            }
          >
            + Add Question
          </button>
        </div>

        {showAddQuestion && (
          <form
            onSubmit={addQuestion}
            className="content-card"
          >
            <h3>
              Add New Question
            </h3>

            <div className="form-group">
              <label>
                Question
              </label>

              <textarea
                placeholder="Enter question"
                value={questionText}
                onChange={(e) =>
                  setQuestionText(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Option A
              </label>

              <input
                type="text"
                placeholder="Enter option A"
                value={optionA}
                onChange={(e) =>
                  setOptionA(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Option B
              </label>

              <input
                type="text"
                placeholder="Enter option B"
                value={optionB}
                onChange={(e) =>
                  setOptionB(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Option C
              </label>

              <input
                type="text"
                placeholder="Enter option C"
                value={optionC}
                onChange={(e) =>
                  setOptionC(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Option D
              </label>

              <input
                type="text"
                placeholder="Enter option D"
                value={optionD}
                onChange={(e) =>
                  setOptionD(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Correct Answer
              </label>

              <select
                value={correctAnswer}
                onChange={(e) =>
                  setCorrectAnswer(
                    e.target.value
                  )
                }
              >
                <option value="A">
                  Option A
                </option>

                <option value="B">
                  Option B
                </option>

                <option value="C">
                  Option C
                </option>

                <option value="D">
                  Option D
                </option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-action"
              >
                Save Question
              </button>

              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  setShowAddQuestion(false)
                }
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: "20px" }}>
          {loadingQuestions ? (
            <p>
              Loading questions...
            </p>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ☷
              </div>

              <h3>
                No questions yet
              </h3>

              <p>
                Add the first question to
                this examination.
              </p>
            </div>
          ) : (
            questions.map(
              (question, index) => (
                <div
                  className="student-mini-card"
                  key={question.id}
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  <div className="exam-card-content">
                    <h3>
                      {index + 1}.{" "}
                      {question.question}
                    </h3>

                    <p>
                      A. {question.optionA}
                    </p>

                    <p>
                      B. {question.optionB}
                    </p>

                    <p>
                      C. {question.optionC}
                    </p>

                    <p>
                      D. {question.optionD}
                    </p>

                    <strong>
                      Correct Answer:{" "}
                      {question.correctAnswer}
                    </strong>
                  </div>
                </div>
              )
            )
          )}
        </div>

        <button
          className="secondary-action"
          onClick={() => {
            setSelectedExam(null);
            setQuestions([]);
            setActivePage("exams");
          }}
        >
          ← Back to Exams
        </button>
      </section>
    );
  };

  // --------------------------------
  // RESULTS
  // --------------------------------

  const renderResults = () => {
    return (
      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>
              Student Results
            </h2>

            <span>
              Monitor student examination
              performance
            </span>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-icon">
            ◉
          </div>

          <h3>
            No results yet
          </h3>

          <p>
            Student results will appear here
            after students complete
            examinations.
          </p>
        </div>
      </section>
    );
  };

  // --------------------------------
  // CREATE EXAM FORM
  // --------------------------------

  const renderCreateExam = () => {
    if (!showCreateExam) {
      return null;
    }

    return (
      <div className="content-card">
        <div className="section-heading">
          <div>
            <h2>
              Create New Examination
            </h2>

            <span>
              Enter the examination details
            </span>
          </div>
        </div>

        <form onSubmit={createExam}>
          <div className="form-group">
            <label>
              Exam Title
            </label>

            <input
              type="text"
              placeholder="Example: Python Fundamentals"
              value={examTitle}
              onChange={(e) =>
                setExamTitle(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              placeholder="Enter exam description"
              value={examDescription}
              onChange={(e) =>
                setExamDescription(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Duration in minutes
            </label>

            <input
              type="number"
              min="1"
              placeholder="30"
              value={examDuration}
              onChange={(e) =>
                setExamDuration(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-action"
            >
              Create Exam
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() =>
                setShowCreateExam(false)
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --------------------------------
  // MAIN
  // --------------------------------

  return (
    <div className="dashboard">

      <Sidebar
        role="admin"
        onLogout={onLogout}
        activePage={activePage}
        onNavigate={handleNavigation}
      />

      <main className="main-content">

        <div className="topbar">

          <div>
            <p className="page-label">
              ADMIN PORTAL
            </p>

            <h1>
              {activePage === "dashboard" &&
                "Dashboard"}

              {activePage === "exams" &&
                "Exam Management"}

              {activePage === "questions" &&
                "Questions"}

              {activePage === "results" &&
                "Student Results"}
            </h1>
          </div>

          <div className="user-info">

            <div className="top-avatar">
              A
            </div>

            <div>
              <strong>
                Administrator
              </strong>

              <span>
                {user.email}
              </span>
            </div>

          </div>

        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {renderCreateExam()}

        {!showCreateExam &&
          activePage === "dashboard" &&
          renderDashboard()}

        {!showCreateExam &&
          activePage === "exams" &&
          renderExams()}

        {!showCreateExam &&
          activePage === "questions" &&
          renderQuestions()}

        {!showCreateExam &&
          activePage === "results" &&
          renderResults()}

      </main>

    </div>
  );
}

export default AdminDashboard;