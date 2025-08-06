import axios from "axios";

const baseURL = "http://localhost:8000/api/v1";
// const baseURL = "https://chat-app-server-54ar.onrender.com/api/v1";

const api = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // flip to true if you need cookies
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or Context, Redux, etc.
    if (token) config.headers.Authorization = `Bearer ${token ? token : ""}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error);
  }
);

const get = (url, params = {}, config = {}) =>
  api.get(url, { params, ...config });
const post = (url, data = {}, config = {}) => api.post(url, data, config);
const put = (url, data = {}, config = {}) => api.put(url, data, config);
const del = (url, config = {}) => api.delete(url, config);

// Export them in whatever shape you like
export default { get, post, put, delete: del };
