
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";
import "./App.css";

import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);

  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          try {
            const userDoc = await getDoc(
              doc(db, "users", currentUser.uid)
            );

            if (userDoc.exists()) {
              setRole(userDoc.data().role);
            } else {
              setRole(null);
            }
          } catch (error) {
            console.error("Error getting user role:", error);
            setRole(null);
          }
        } else {
          setRole(null);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const newUser = userCredential.user;

        await setDoc(
          doc(db, "users", newUser.uid),
          {
            email: newUser.email,
            role: "student",
          }
        );

        setMessage("Registration successful!");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage("Login successful!");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Loading screen
  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (user && role === "admin") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // STUDENT DASHBOARD
  if (user && role === "student") {
    return (
      <StudentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // LOGIN / REGISTER PAGE
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="logo">
          <h1>ExamPortal</h1>
          <p>Serverless Online Examination System</p>
        </div>

        <h2>
          {isRegister
            ? "Create Account"
            : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
          >
            {isRegister
              ? "Create Account"
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <button
          className="switch-btn"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
          }}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Create one"}
        </button>

      </div>
    </div>
  );
}

export default App;

