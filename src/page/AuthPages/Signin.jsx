import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./index.css";
import {
  Mail,
  ShieldCheck,
  User,
  MessageSquareHeart,
  ShieldUser,
  CheckCheck,
  ShieldX,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { handelCatch, showSuccess, throwError } from "../../store/globalSlice";
import { Spinner } from "react-bootstrap";
import { useCallback, useState } from "react";
import { debounce } from "../../assets/helper";

const signinSchema = Yup.object().shape({
  first_name: Yup.string()
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
  user_name: Yup.string().required("Username is required"),
});
function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userVerifiedStatus, setUserVerifiedStatus] = useState({
    verified: false,
    message: "",
  });
  const [isVerifiedLoader, setIsVerifiedLoader] = useState(false);
  const [verifiedUserName, setVerifiedUserName] = useState("");

  const handleSignin = async (val) => {
    try {
      const req = val;
      const res = await api.post("/user/sign-up", {
        ...req,
        user_name: verifiedUserName,
      });
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

  const verifiedUserNameFunc = async (user_name) => {
    try {
      if (!user_name) {
        setUserVerifiedStatus({
          verified: false,
          message: `Username is required`,
        });
      }
      const regex = /^[a-zA-Z0-9_.]+$/;

      const isValid = regex.test(user_name);

      if (!isValid) {
        setUserVerifiedStatus({
          verified: false,
          message:
            "Username can only contain letters, numbers, underscores, and dots.",
        });
      }

      const res = await api.post("/user/user-name-verification", { user_name });
      if (res.status === 200) {
        setUserVerifiedStatus({
          verified: true,
          message: "",
        });
        setVerifiedUserName(user_name);
      } else {
        dispatch(throwError(res.data.message));
        setUserVerifiedStatus({
          verified: false,
          message: res.data.message,
        });
      }
    } catch (error) {
      dispatch(handelCatch(error));
      setUserVerifiedStatus({
        verified: false,
        message: "Internal error",
      });
    } finally {
      setIsVerifiedLoader(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((val) => verifiedUserNameFunc(val), 1000),
    []
  );

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
              user_name: "",
            }}
            validationSchema={signinSchema}
          >
            {({ values, isValid, setFieldValue }) => (
              <Form className="form" autoComplete="off">
                <div className="input-box">
                  <label>
                    <ShieldUser size={20} />
                  </label>
                  <Field
                    type="text"
                    name="user_name"
                    placeholder="Enter user name it`s can be uniq.. "
                    autoComplete="new-username"
                    onChange={(e) => {
                      const userName = e.target.value.trim().toLowerCase();
                      const regex = /^[a-zA-Z0-9_.]+$/;
                      if (!userName) {
                        setFieldValue("user_name", "");
                      }
                      const isValidUserName = regex.test(userName);
                      if (!isValidUserName) return;
                      setFieldValue("user_name", userName);
                      setIsVerifiedLoader(true);
                      setUserVerifiedStatus({
                        verified: false,
                        message: "",
                      });
                      debouncedSearch(userName);
                    }}
                  />
                  <ErrorMessage
                    name="user_name"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                  {values?.user_name && (
                    <div
                      className={`verified-user ${
                        userVerifiedStatus.verified
                          ? "success-user"
                          : "error-user"
                      }`}
                    >
                      {!isVerifiedLoader ? (
                        userVerifiedStatus.verified ? (
                          <BadgeCheck size={18} />
                        ) : (
                          <ShieldX size={18} />
                        )
                      ) : (
                        ""
                      )}
                      {isVerifiedLoader && (
                        <Spinner
                          animation="grow"
                          size="sm"
                          style={{ color: "#000" }}
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="input-box">
                  <label>
                    <User size={20} />
                  </label>
                  <Field
                    type="text"
                    name="first_name"
                    placeholder="Enter first name"
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
                  onClick={() => {
                    if (!isValid) return;
                    handleSignin(values);
                  }}
                >
                  Submit
                </button>
              </Form>
            )}
          </Formik>
          <div className="login-signin-footer">
            <p className="login-signin-footer-text">
              Already have an account?{" "}
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
