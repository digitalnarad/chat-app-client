// App.jsx
import { useEffect, useState } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Login from "./page/AuthPages/Login";
import Signin from "./page/AuthPages/Signin";
import ForgotPassword from "./page/AuthPages/ForgotPassword";
import ChatLayout from "./page/Chat/ChatLayout";
import PopupAlert from "./components/PopupAlert/PopupAlert";
import { setAuthToken } from "./store/globalSlice"; // adjust import to your slice
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.global);
  const token = localStorage.getItem("token");
  const isAuth = !!token;

  useEffect(() => {
    const save = localStorage.getItem("token");
    dispatch(setAuthToken({ token: save }));
  }, []);

  return (
    <div className="app">
      <PopupAlert />
      <Routes>
        {isAuth ? (
          <>
            <Route path="/" element={<ChatLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
