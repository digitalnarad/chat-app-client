import "./PopupAlert.css";
import { setErrorData } from "../../store/globalSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Alert, AlertTitle } from "@mui/material";

const PopupAlert = () => {
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.global);
  const { errorData } = reduxData || {};
  const { show, type, message } = errorData || {};

  const resetError = () => {
    dispatch(
      setErrorData({
        show: false,
        message: "",
        type: "",
      })
    );
  };

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        resetError();
      }, 3000);
    }
  }, [show]);

  return (
    <div id="PopupAlert-container">
      {show && (
        <Alert severity={type}>
          <AlertTitle>{type === "success" ? "Success" : "Error"}</AlertTitle>
          {message}
        </Alert>
      )}
    </div>
  );
};

export default PopupAlert;
