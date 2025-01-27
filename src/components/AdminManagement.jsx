import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { GetUser } from "../function/apiservice";

const AdminManagement = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await GetUser(); // ดึงข้อมูลแอดมินจาก API
        setAdmin(response); // เก็บข้อมูลทั้งหมดในตัวแปร admin
        setAdminName(response.name || "ไม่มีชื่อแอดมิน");
        setProfilePic(
          response.profilePictureUrl
            ? `http://localhost${response.profilePictureUrl}`
            : "/uploads/admin/default-profile.jpg"
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false); // ปิดสถานะการโหลด
      }
    };

    fetchAdminInfo();
  }, []);


  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      document.getElementById("fileName").textContent = file.name;
    } else {
      document.getElementById("fileName").textContent = "ไม่ได้เลือกไฟล์";
    }
  };

  const handleNameUpdate = async () => {
    if (!adminName) {
      console.error("Admin name is empty, cannot update.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">กรุณากรอกชื่อแอดมิน</p>);
      return;
    }

    // ดึงข้อมูล User ID จาก localStorage
    const userInfo = JSON.parse(localStorage.getItem("userinfo"));
    if (!userInfo || !userInfo.userid) {
      console.error("User ID is missing in localStorage.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">ไม่พบข้อมูลผู้ใช้</p>);
      return;
    }

    const formData = new FormData();
    formData.append("name", adminName);
    formData.append("id", userInfo.userid);

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setIsEditingName(false);
      setUploadMessage(<p className="text-green-500 font-FontNoto">บันทึกชื่อสำเร็จ!</p>);
    } catch (error) {
      console.error("Error updating admin name:", error.response?.data || error);
      setUploadMessage(<p className="text-red-500 font-FontNoto">เกิดข้อผิดพลาดในการบันทึกชื่อ</p>);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage(
        <p className="font-FontNoto text-red-500">กรุณาเลือกไฟล์ก่อนอัปโหลด</p>
      );
      return;
    }

    var userinfolocalStorage = localStorage.getItem('userinfo')
    const objUser = JSON.parse(userinfolocalStorage)
    console.log(objUser.userid)


    const formData = new FormData();
    formData.append("profilePictures", selectedFile); // ส่งเฉพาะรูปภาพ
    formData.append("id", objUser.userid);
    console.log(formData)
    try {
      const response = await axios.post("https://localhost:7039/api/Admin/UpdateAdminInfo", formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.profilePictureUrl) {
        const profilePictureUrl = `http://localhost/${response.data.profilePictureUrl}`;
        setProfilePic(profilePictureUrl);
        setUploadMessage(
          <p className="font-FontNoto text-green-500">อัปโหลดสำเร็จ!</p>
        );
      } else {
        setUploadMessage(
          <p className="font-FontNoto text-red-500">
            อัปโหลดสำเร็จ แต่ไม่ได้รับ URL ของรูปโปรไฟล์
          </p>
        );
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);

      const errorMessage =
        error.response?.data?.Message || "เกิดข้อผิดพลาดในการอัปโหลด";
      setUploadMessage(
        <p className="font-FontNoto text-red-500">{errorMessage}</p>
      );
    }
  };
  const handleRemoveAdmin = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userinfo"));
      if (!userInfo || !userInfo.userid) {
        console.error("User ID not found in localStorage.");
        return;
      }
  
      // เรียก API เพื่อลบแอดมิน
      const response = await axios.delete(`https://localhost:7039/api/Admin/DeleteAdmin/${userInfo.userid}`);
      if (response.status === 200) {
        // ลบข้อมูลใน localStorage
        localStorage.removeItem("userinfo");
  
        // เปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ
        window.location.href = "/";
      } else {
        console.error("Failed to remove admin.");
      }
    } catch (error) {
      console.error("Error during admin removal:", error.response?.data || error);
    }
  };
  


  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="navbar bg-amber-400 shadow-lg">
        <div className="flex-1">
          <div className="text-xl font-bold text-black bg-amber-400 p-4 rounded-md font-FontNoto">
            ระบบจัดเก็บเอกสารพนักงาน
          </div>
        </div>
      </div>
      <div className="flex min-h-screen bg-base-200">
        {/* Sidebar */}
        <div className="w-1/6 bg-white shadow-lg p-6 rounded-lg">
          <div className="">
            <div className="font-FontNoto">
              {uploadMessage && <div>{uploadMessage}</div>}
            </div>

            <div className="flex flex-col items-center justify-center">
              {profilePic && (
                <img
                  src={profilePic}
                  alt="Admin Profile"
                  className="rounded-full border-4 border-yellow-500 object-cover w-32 h-32"
                />
              )}
              <p className="text-lg text-black font-FontNoto mt-4">
                {adminName || "กำลังโหลด..."}
              </p>
            </div>
            <div className="mt-4">
              {!isEditingName ? (
                <div className="flex items-center">

                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-2 text-sm text-blue-500 hover:underline font-FontNoto"
                  >
                    คลิกเพื่อเปลี่ยนชื่อแอดมิน
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="border border-gray-300 rounded-md p-1 bg-white text-black font-FontNoto"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="ml-2 text-sm text-green-500 hover:underline font-FontNoto"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="ml-2 text-sm text-red-500 hover:underline font-FontNoto"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center space-x-2">
              <div className="flex items-center space-x-1 p-0.25 border border-gray-200 rounded-md w-48">
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-xs py-1 px-2 bg-gray-200 text-black rounded-md font-FontNoto"
                >
                  เลือกไฟล์
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
                <span id="fileName" className="text-xs text-black font-FontNoto py-1 px-2 ">
                  ไม่ได้เลือกไฟล์
                </span>
              </div>

              <button
                onClick={handleUpload}
                className="cursor-pointer text-xs py-1 px-2 bg-gray-200 rounded-md font-FontNoto"
              >
                อัปโหลด
              </button>
            </div>
          </div>

          <ul className="menu bg-base-100 text-black rounded-box w-full text-lg">
            <li><NavLink to="/AdminDashboard" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>Dashboard</NavLink></li>
            <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
            <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>
        {/* Content */}
        <div className="flex-1 p-10 bg-white shadow-lg rounded-lg ml-1">
          <h1 className="text-2xl font-bold mb-4 font-FontNoto">ข้อมูลแอดมิน</h1>
          {admin ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4">
              <p className="font-FontNoto text-center">
                <strong className="font-FontNoto">ชื่อผู้ใช้:</strong> {admin.name}
              </p>
              <p className="font-FontNoto text-center">
                <strong className="font-FontNoto">อีเมล:</strong> {admin.email}
              </p>
              <div className="flex flex-col items-center mt-4">
                <img
                  src={`${profilePic}?t=${new Date().getTime()}`} // เพิ่ม query string เพื่อป้องกันแคช
                  alt="Profile"
                  className="rounded-full border-4 border-yellow-500 object-cover w-48 h-48 mt-2"
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="btn font-FontNoto"
                  style={{ color: "red" }}
                  onClick={() => document.getElementById('confirmModal').showModal()}
                >
                  ลบตัวเองออกจากการเป็นแอดมิน
                </button>
              </div>

              <dialog id="confirmModal" className="modal">
                <div className="modal-box">
                  <h3 className="font-bold text-lg font-FontNoto">ยืนยันการลบ</h3>
                  <p className="py-4 font-FontNoto">คุณแน่ใจหรือไม่ว่าต้องการลบตัวเองออกจากการเป็นแอดมิน ?</p>
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn btn-outline btn-warning font-FontNoto">ยกเลิก</button>
                    </form>
                    <button className="btn btn-outline btn-error font-FontNoto" onClick={handleRemoveAdmin}>
                      ตกลง
                    </button>
                  </div>
                </div>
              </dialog>

            </div>
          ) : (
            <p className="font-FontNoto">ไม่พบข้อมูลแอดมิน</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminManagement;
