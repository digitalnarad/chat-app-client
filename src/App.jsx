/* eslint-disable no-unused-vars */
import { useState } from "react";
import "./App.css";
import Chat from "./page/Chat/Chat";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./page/AuthPages/Login";
import Signin from "./page/AuthPages/Signin";
import ForgotPassword from "./page/AuthPages/ForgotPassword";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  return (
    <div className="app">
      <Routes>
        {isAuth ? (
          <>
            <Route path="/" element={<Chat />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
