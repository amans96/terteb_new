import { createBrowserRouter } from "react-router-dom";



import Login from "../pages/Login.jsx";
import Customer from "../pages/Customer.jsx";
import Admin from "../pages/Admin.jsx";

import Dashboard from "../comp/Dashboard.jsx";
import Menu from "../comp/Menu.jsx";
import Categories from "../comp/Categories.jsx";
import Orders from "../comp/Orders.jsx";
import Sales from "../comp/Sales.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Customer />,
  },

  {
    path: "/login",
    element: <Login />,
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