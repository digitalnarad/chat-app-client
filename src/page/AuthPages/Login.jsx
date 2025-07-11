import { Mail, MessagesSquare, ShieldCheck, User } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import "./index.css";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import {
  handelCatch,
  setAuthToken,
  showSuccess,
  throwError,
} from "../../store/globalSlice";
// Create a Yup schema for validation
const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Password is required"),
});
function Login() {
  const reduxData = useSelector((state) => state.global);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (value) => {
    try {
      const res = await api.post("/user/sign-in", value);
      console.log("res", res);
      if (res.status === 200) {
        const token = res.data.response.token;
        console.log("token", token);
        localStorage.setItem("token", token);
        dispatch(setAuthToken(token));
        dispatch(showSuccess(res.data.message));
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (error) {
      console.log("error", error);
      dispatch(handelCatch(error));
    }
  };

  return (
    <div className="login-signin-component">
      <div className="login-signin-card">
        <div className="login-signin-logo">
          <MessagesSquare size={35} color="#fff" />
          <h1 className="login-signin-text">Login</h1>
        </div>

        <div className="form">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSubmit(values, setSubmitting);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="form">
                <div className="input-box">
                  <label>
                    <Mail size={20} />
                  </label>
                  <Field type="email" name="email" placeholder="Enter Email" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                </div>
                <div className="input-box">
                  <label>
                    <ShieldCheck size={20} />
                  </label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter Email"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                </div>
                <div
                  className="forgot-password"
                  onClick={() => {
                    // navigate(`/forgot-password`); // Navigate to the forgot password page
                    console.log("reduxData", reduxData);
                  }}
                >
                  Forgot Password?
                </div>
                <button type="submit" className="login-signin-btn">
                  Submit
                </button>
              </Form>
            )}
          </Formik>

          <div className="login-signin-footer">
            <p className="login-signin-footer-text">
              Don't have an account?{" "}
              <span
                className="login-signin-link"
                onClick={() => {
                  navigate(`/signin`); // Navigate to the signup page
                }}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
