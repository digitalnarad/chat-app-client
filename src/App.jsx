import { useState } from "react";
import "./App.css";
import Login from "./page/Login/Login";
import Chat from "./page/Chat/Chat";
import Singup from "./page/Singup/Singup";
import { Navigate, Route, Routes } from "react-router-dom";

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
            <Route path="/singup" element={<Singup />} />

            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
