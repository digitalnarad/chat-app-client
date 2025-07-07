/* eslint-disable no-unused-vars */
import { useState } from "react";
import "./App.css";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./page/AuthPages/Login";
import Signin from "./page/AuthPages/Signin";
import ForgotPassword from "./page/AuthPages/ForgotPassword";
import ChatLayout from "./page/Chat/ChatLayout";

function App() {
  const [isAuth, setIsAuth] = useState(true);
  return (
    <div className="app">
      <Routes>
        {isAuth ? (
          <>
            <Route path="/" element={<ChatLayout />} />

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
