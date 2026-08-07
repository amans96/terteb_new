import { createBrowserRouter } from "react-router-dom";

import Customer from "./pages/Customer";
import Admin from "./pages/Admin";

import Dashboard from "./comp/Dashboard";
import Menu from "./comp/Menu";
import Categories from "./comp/Categories";
import Orders from "./comp/Orders";
import Sales from "./comp/Sales";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Customer />,
  },

  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "menu",
        element: <Menu />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "sales",
        element: <Sales />,
      },
    ],
  },
]);

export default router;