import { Mail, MessagesSquare, ShieldCheck, User } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import "./index.css";
import { useNavigate } from "react-router-dom";
// Create a Yup schema for validation
const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Password is required"),
});
function Login() {
  const navigate = useNavigate();

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
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                setSubmitting(false);
              }, 400);
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
                    navigate(`/forgot-password`); // Navigate to the forgot password page
                  }}
                >
                  Forgot Password?
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-signin-btn"
                >
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
