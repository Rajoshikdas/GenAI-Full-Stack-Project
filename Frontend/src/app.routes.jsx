import { createBrowserRouter } from "react-router-dom";

import Login from "./features/auth/pages/login";
import Register from "./features/auth/pages/Register";

import Protected from "./features/auth/components/Protected";

import Home from "./features/interview/pages/Home";

// IMPORTANT:
// Make sure this file exists:
// src/features/interview/pages/Interview.jsx
import Interview from "./features/interview/pages/interview";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/interview/:interviewId",
    element: (
      <Protected>
        <Interview />
      </Protected>
    ),
  },
]);