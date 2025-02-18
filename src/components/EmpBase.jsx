import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";
import logo from "../assets/1.png";

const EmpBase = () => {
  const [currentProfileImage, setCurrentProfileImage] = useState("");
  const [userName, setUserName] = useState("กำลังโหลด...");
  const [role, setRole] = useState(null); // state สำหรับ role

  // ดึง userID จาก sessionStorage
  const userID = sessionStorage.getItem("userId") || "";


  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (userID) {
      fetchProfileImageAndUserData();
      if (storedRole) {
        setRole(storedRole);
        console.log("Role from sessionStorage:", storedRole);
      } else {
        fetchRole();
      }
    }

  }, [userID]);

  const fetchRole = async () => {
    try {
      const response = await axios.get("/api/admin/GetUserRole");
      if (response.status === 200) {
        const userRole = response.data.Role;
        setRole(userRole);
        sessionStorage.setItem("role", userRole); // เก็บ role ใน sessionStorage
      } else {
        console.error("Failed to fetch user role");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchProfileImageAndUserData = async () => {
    try {

      // ดึงข้อมูลโปรไฟล์รูปภาพ
      const profileResponse = await axios.get(
        `https://localhost:7039/api/Files/GetProfileImage?userID=${userID}`
      );
      setCurrentProfileImage(profileResponse)

      if (profileResponse.status === 200) {
        const fullImageUrl = `https://localhost:7039/api/Files/GetProfileImage?userID=${userID}`;

        setCurrentProfileImage(fullImageUrl);
      }

      // ดึงข้อมูลผู้ใช้งาน
      const userResponse = await axios.get(
        `https://localhost:7039/api/Users/Getbyid/${userID}`
      );
      console.log(userResponse)
      if (userResponse.status === 200) {
        const userData = userResponse.data;
        setUserName(
          `${userData.firstName} ${userData.lastName}` || "ไม่ทราบชื่อ"
        );
      }
    } catch (error) {
      console.error("Error fetching profile image or user data:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="navbar bg-amber-400 shadow-lg flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <div
            className="flex items-center"
            style={{
              backgroundColor: "white",
              border: "2px solid white",
              borderRadius: "10px",
              padding: "5px 10px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img src={logo} className="h-8 w-auto mr-2" alt="Logo" />
            <span style={{ color: "black", fontWeight: "bold" }}>THE </span>
            &nbsp;
            <span style={{ color: "#FF8800", fontWeight: "bold" }}>EXPERTISE </span>
            &nbsp;
            <span style={{ color: "black", fontWeight: "bold" }}>CO, LTD.</span>
          </div>
        </div>
        <div className="text-xl font-bold text-black bg-amber-400 p-4 rounded-md font-FontNoto">
          ระบบจัดเก็บเอกสารพนักงาน
        </div>
      </div>

      <div className="flex flex-1 py-2">
        {/* Sidebar */}
        <div className="w-[15vw] bg-white shadow-md text-white min-h-full p-6 flex flex-col items-center">
          {/* Profile Image */}
          <div className="avatar mb-4">
            <div className="ring-amber-400 ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
              <img
                src={currentProfileImage}
                alt="โปรไฟล์พนักงาน"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* User Name Display */}
          <div className="text-center mt-4">
            <h4 className="text-xl text-black font-FontNoto">{userName}</h4>
          </div>

          {/* Sidebar Links */}
          <ul className="menu bg-white text-black rounded-box w-full text-lg">

            <li>
              <Link
                to="/EmpHome"
                className="hover:bg-orange-400 hover:text-black font-FontNoto font-bold"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/EmpHome/Document"
                className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
              >
                จัดการเอกสาร
              </Link>
            </li>
            <li>
              <Link
                to="/EmpHome/Profile"
                className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
              >
                ข้อมูลส่วนตัว
              </Link>
            </li>
            {role === "Hr" ? (
              <>
                <li>
                  <Link
                    to="/EmpHome/HRView"
                    className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
                  >
                    ใบลาพนักงาน
                  </Link>
                </li>

              </>
            ) : null}
            {role === "GM" ? (
              <>
                <li>
                  <Link
                    to="/EmpHome/ManagerView"
                    className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
                  >
                    ใบลาพนักงาน
                  </Link>
                </li>
              </>
            ) : null}
            {role === "GM" || role === "Hr" ? (
              <>
                <li>
                  <Link
                    to="/EmpHome/TrendStatistics"
                    className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
                  >
                    สถิติพนักงาน
                  </Link>
                </li>
                <li>
                  <Link
                    to="/EmpHome/Allemployee"
                    className="hover:bg-slate-100 hover:text-black font-FontNoto font-bold"
                  >
                    ข้อมูลพนักงาน
                  </Link>
                </li>
              </>
            ) : null}

            <li>
              <Link
                to="/EmpHome/Logout"
                className="hover:bg-error hover:text-white font-FontNoto font-bold"
              >
                ออกจากระบบ
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="w-[75vw] m-4">
          <div className="w-full rounded-lg shadow-md p-6 bg-slate-50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpBase;
