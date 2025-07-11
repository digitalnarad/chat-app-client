import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./index.css";
import { Mail, ShieldCheck, User, MessageSquareHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { handelCatch, showSuccess, throwError } from "../../store/globalSlice";

const signinSchema = Yup.object().shape({
  fist_name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  last_name: Yup.string()
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
  const dispatch = useDispatch();

  const handleSignin = async (val) => {
    try {
      const req = val;
      const res = await api.post("/user/sign-up", req);
      if (res.status === 200) {
        dispatch(showSuccess(res.data.message));
        navigate("/login");
      } else {
        dispatch(throwError(res.data.message));
      }
    } catch (error) {
      dispatch(handelCatch(error));
    }
  };
  return (
    <div className="login-signin-component">
      <div className="login-signin-card">
        <div className="login-signin-logo">
          <MessageSquareHeart size={35} color="#fff" />
          <h1 className="login-signin-text">Sing-up</h1>
        </div>
        <div className="form">
          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              email: "",
              password: "",
            }}
            validationSchema={signinSchema}
          >
            {({ values }) => (
              <Form className="form">
                <div className="input-box">
                  <label>
                    <User size={20} />
                  </label>
                  <Field
                    type="text"
                    name="first_name"
                    placeholder="Enter Name"
                  />
                  <ErrorMessage
                    name="first_name"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                </div>
                <div className="input-box">
                  <label>
                    <User size={20} />
                  </label>
                  <Field
                    type="text"
                    name="last_name"
                    placeholder="Enter Last Name"
                  />
                  <ErrorMessage
                    name="last_name"
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
                  className="login-signin-btn"
                  onClick={() => handleSignin(values)}
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
