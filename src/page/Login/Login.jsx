import { Mail, MessagesSquare, User } from "lucide-react";
import "./login.css";
import TextInput from "../../components/Inputs/TextInput";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Create a Yup schema for validation
const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Password is required"),
});
function Login() {
  return (
    <div className="login-component">
      <div className="login-card">
        <div className="login-logo">
          <MessagesSquare size={35} color="#fff" />
          <h1>Login</h1>
        </div>

        <div className="form">
          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={SignupSchema}
            onSubmit={(values, { setSubmitting }) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                setSubmitting(false);
              }, 400);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="">
                <div className="input-box">
                  <label>
                    <User strokeWidth={2} size={26} />
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
                    <Mail strokeWidth={2} size={26} />
                  </label>
                  <Field type="email" name="email" placeholder="Enter Email" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                    style={{ color: "red" }}
                  />
                </div>
                <div>
                  <label>Password:</label>
                  <Field type="password" name="password" />
                  <ErrorMessage
                    name="password"
                    component="div"
                    style={{ color: "red" }}
                  />
                </div>
                <button type="submit" disabled={isSubmitting}>
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default Login;
