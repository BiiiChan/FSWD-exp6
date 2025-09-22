import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const api = {
  setToken: (token) => {
    if (token)
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete instance.defaults.headers.common["Authorization"];
  },
  register: (data) => instance.post("/auth/register", data),
  login: (data) => instance.post("/auth/login", data),
  getTasks: () => instance.get("/tasks"),
  createTask: (data) => instance.post("/tasks", data),
  updateTask: (id, data) => instance.put(`/tasks/${id}`, data),
  deleteTask: (id) => instance.delete(`/tasks/${id}`),
};

export default api;
