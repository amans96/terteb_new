import { Outlet } from "react-router-dom";
import Sidebar from "../comp/Sidebar";
import Topbar from "../comp/Topbar";

const Admin = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;