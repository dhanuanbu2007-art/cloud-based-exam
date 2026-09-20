import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function ExamPage({ examId, onBack }) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const examDoc = await getDoc(doc(db, "exams", examId));

        if (examDoc.exists()) {
          setExam({
            id: examDoc.id,
            ...examDoc.data(),
          });
        }

        const questionsSnapshot = await getDocs(
          collection(db, "exams", examId, "questions")
        );

        const questionList = questionsSnapshot.docs.map((questionDoc) => ({
          id: questionDoc.id,
          ...questionDoc.data(),
        }));

        setQuestions(questionList);
      } catch (error) {
        console.error("Error loading exam:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  const handleAnswer = (answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questions[currentQuestion].id]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  const submitExam = () => {
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        "You have not answered all questions. Do you want to submit anyway?"
      );

      if (!confirmSubmit) {
        return;
      }
    }

    alert("Exam submitted successfully!");
  };

  if (loading) {
    return (
      <div className="exam-page">
        <div className="exam-loading-card">
          <div className="exam-spinner"></div>
          <h2>Loading Exam</h2>
          <p>Please wait while we prepare your examination.</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-page">
        <div className="exam-error-card">
          <div className="exam-error-icon">!</div>
          <h2>Exam Not Found</h2>
          <p>We could not find the examination.</p>

          <button className="exam-back-btn" onClick={onBack}>
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="exam-page">
        <div className="exam-error-card">
          <div className="exam-error-icon">!</div>
          <h2>{exam.title}</h2>
          <p>No questions have been added to this exam yet.</p>

          <button className="exam-back-btn" onClick={onBack}>
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const answeredCount = Object.keys(answers).length;

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="exam-page">

      <div className="exam-topbar">
        <button
          className="exam-back-link"
          onClick={onBack}
        >
          Back to Exams
        </button>

        <div className="exam-brand">
          <div className="exam-brand-icon">E</div>

          <div>
            <strong>ExamPortal</strong>
            <span>Online Examination</span>
          </div>
        </div>

        <div className="exam-status">
          <span className="status-dot"></span>
          Examination in progress
        </div>
      </div>

      <div className="exam-info">
        <div>
          <p className="exam-label">EXAMINATION</p>

          <h1>{exam.title}</h1>

          <p className="exam-description">
            {exam.description || "Complete all questions carefully."}
          </p>
        </div>

        <div className="exam-summary">

          <div className="summary-item">
            <span className="summary-icon">Q</span>

            <div>
              <small>QUESTIONS</small>
              <strong>{questions.length}</strong>
            </div>
          </div>

          <div className="summary-item">
            <span className="summary-icon">✓</span>

            <div>
              <small>ANSWERED</small>
              <strong>{answeredCount}</strong>
            </div>
          </div>

        </div>
      </div>

      <div className="exam-progress-card">

        <div className="progress-top">

          <div>
            <span className="progress-question">
              Question {currentQuestion + 1}
            </span>

            <span className="progress-total">
              {" "}of {questions.length}
            </span>
          </div>

          <strong>
            {Math.round(progress)}%
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: progress + "%",
            }}
          ></div>

        </div>
      </div>

      <div className="exam-content">

        <div className="question-card">

          <div className="question-number">
            QUESTION {currentQuestion + 1}
          </div>

          <h2>{question.question}</h2>

          <p className="question-hint">
            Select one answer from the options below.
          </p>

          <div className="options">

            {["A", "B", "C", "D"].map((option) => {

              const optionText =
                question["option" + option];

              const selected =
                selectedAnswer === option;

              return (
                <button
                  key={option}
                  className={
                    selected
                      ? "option-card selected"
                      : "option-card"
                  }
                  onClick={() => handleAnswer(option)}
                >

                  <span
                    className={
                      selected
                        ? "option-letter selected-letter"
                        : "option-letter"
                    }
                  >
                    {option}
                  </span>

                  <span className="option-text">
                    {optionText}
                  </span>

                  {selected && (
                    <span className="option-check">
                      ✓
                    </span>
                  )}

                </button>
              );
            })}

          </div>
        </div>

        <div className="question-sidebar">

          <div className="navigator-card">

            <h3>Question Navigator</h3>

            <p>
              {answeredCount} of {questions.length} answered
            </p>

            <div className="question-grid">

              {questions.map((item, index) => {

                const isAnswered =
                  answers[item.id] !== undefined;

                const isCurrent =
                  index === currentQuestion;

                let buttonClass = "question-number-btn";

                if (isCurrent) {
                  buttonClass =
                    buttonClass + " current";
                }

                if (isAnswered) {
                  buttonClass =
                    buttonClass + " answered";
                }

                return (
                  <button
                    key={item.id}
                    className={buttonClass}
                    onClick={() =>
                      setCurrentQuestion(index)
                    }
                  >
                    {index + 1}
                  </button>
                );
              })}

            </div>

            <div className="navigator-legend">

              <div>
                <span className="legend-box current-box"></span>
                Current
              </div>

              <div>
                <span className="legend-box answered-box"></span>
                Answered
              </div>

              <div>
                <span className="legend-box unanswered-box"></span>
                Unanswered
              </div>

            </div>

          </div>
        </div>

      </div>

      <div className="exam-navigation">

        <button
          className="exam-secondary-btn"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (

          <button
            className="exam-submit-btn"
            onClick={submitExam}
          >
            Submit Exam
          </button>

        ) : (

          <button
            className="exam-next-btn"
            onClick={nextQuestion}
          >
            Next Question
          </button>

        )}

      </div>

    </div>
  );
}

export default ExamPage;