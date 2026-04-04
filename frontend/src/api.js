import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "https://hemanth0127.pythonanywhere.com/api"
  : "http://localhost:5000/api";

const API = axios.create({ baseURL: API_URL });

// Auth
export const verifyToken = (email) =>
  API.post("/verify-token", { email }).then((r) => r.data);

// Menu
export const getMenu = (date) =>
  API.get("/menu", { params: { date } }).then((r) => r.data);

export const saveMenu = (payload) =>
  API.post("/menu", payload).then((r) => r.data);

// Votes
export const castVote = (payload) =>
  API.post("/vote", payload).then((r) => r.data);

export const getVotes = (date) =>
  API.get("/votes", { params: { date } }).then((r) => r.data);

export const getStudentVote = (email, date) =>
  API.get("/student-vote", { params: { email, date } }).then((r) => r.data);

// Winners
export const finalizeWinners = (date) =>
  API.post("/finalize", { date }).then((r) => r.data);

export const getWinners = (date) =>
  API.get("/winners", { params: { date } }).then((r) => r.data);

// Export
export const getExportUrl = (date) =>
  `${API_URL}/export?date=${date}`;

// Feedback
export const submitFeedback = (payload) =>
  API.post("/feedback", payload).then((r) => r.data);

export const getFeedback = () =>
  API.get("/feedback").then((r) => r.data);
export const deleteFeedback = (id) =>
  API.delete(`/feedback/${id}`).then((r) => r.data);
