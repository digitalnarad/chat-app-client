import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./index.css";
import { Mail, ShieldCheck, User, MessageSquareHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const signinSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Password is required"),
});
function Signin() {
  const navigate = useNavigate();
  return (
    <div className="login-signin-component">
      <div className="login-signin-card">
        <div className="login-signin-logo">
          <MessageSquareHeart size={35} color="#fff" />
          <h1 className="login-signin-text">Sing-up</h1>
        </div>
        <div className="form">
          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={signinSchema}
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
                    <User size={20} />
                  </label>
                  <Field type="text" name="name" placeholder="Enter Name" />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                </div>
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
              Allready have an account?{" "}
              <span
                className="login-signin-link"
                onClick={() => {
                  navigate(`/login`); // Navigate to the signin page
                }}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
