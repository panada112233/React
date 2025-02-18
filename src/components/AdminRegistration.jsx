import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { GetUser } from '../function/apiservice';
import logo from "../assets/1.png";


const AdminRegistration = () => {
  const [formData, setFormData] = useState({
    username: "",
    passwordHash: "",
    email: "",
    profilePictureUrl: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPassword, setShowPassword] = useState({
    passwordHash: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/RegisterAdmin",
        {
          adminID: 0, // ค่า default
          username: formData.username,
          passwordHash: formData.passwordHash,
          email: formData.email,
          createdAt: new Date().toISOString(),
          isActive: true,
          profilePictureUrl: formData.profilePictureUrl || null,
        }
      );

      if (response.status === 201) {
        setMessage("สมัครแอดมินสำเร็จ!");
        setFormData({
          username: "",
          passwordHash: "",
          email: "",
          profilePictureUrl: "",
        });
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครแอดมิน"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await GetUser(); // ใช้ฟังก์ชันจาก apiservice
        setAdminName(response.name || "ไม่มีชื่อแอดมิน");
        setProfilePic(
          response.profilePictureUrl
            ? `http://localhost${response.profilePictureUrl}`
            : "/uploads/admin/default-profile.jpg"
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      }
    };

    fetchAdminInfo();
  }, []);


  const handleProfilePicChange = (event) => {
    const file = event.target.files[0]; // เลือกไฟล์แรกจากไฟล์ที่เลือก
    if (file) {
      setSelectedFile(file); // เก็บไฟล์ที่เลือกลงใน state
      // อัปเดตข้อความแสดงชื่อไฟล์
      document.getElementById("fileName").textContent = file.name;
    } else {
      // ถ้าไม่ได้เลือกไฟล์ ให้แสดงข้อความเริ่มต้น
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


  // อัปโหลดรูปโปรไฟล์ใหม่
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
        <div className="flex-1 p-10 bg-white shadow-lg rounded-lg ml-1">
          <Link to="/UserList" className="btn btn-outline btn-success font-FontNoto mt-2" style={{ marginRight: '10px' }}>
            ข้อมูลพนักงาน
          </Link>
          <Link to="/AdminRegistration" className="btn btn-outline btn-secondary font-FontNoto mt-2" style={{ marginRight: '10px' }}>
            เพิ่มแอดมิน
          </Link>
          <Link to="/UserForm/create" className="btn btn-outline btn-primary font-FontNoto mt-2" style={{ marginRight: '10px' }}>
            เพิ่มผู้ใช้งาน
          </Link>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-10">
            <h2 className="text-2xl font-bold text-black font-FontNoto text-center">เพิ่มแอดมิน</h2>
            {message && (
              <div
                className={`alert ${message.includes("สำเร็จ") ? "alert-success" : "alert-error"
                  } shadow-lg mb-4`}
              >
                <span>{message}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label htmlFor="username" className="label">
                  <span className="label-text font-FontNoto">ชื่อผู้ใช้</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z0-9]*$/.test(value)) {
                      handleChange(e); // อัปเดตค่าเมื่อเป็นตัวอักษรอังกฤษหรือตัวเลข
                    }
                  }}
                  required
                  className="input input-bordered w-full font-FontNoto"
                />
              </div>
              <div className="form-control mb-4">
                <label htmlFor="passwordHash" className="label">
                  <span className="label-text font-FontNoto">รหัสผ่าน</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword.passwordHash ? "text" : "password"}
                    id="passwordHash"
                    name="passwordHash"
                    value={formData.passwordHash}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z0-9]*$/.test(value)) {
                        handleChange(e); // อัปเดตค่าเมื่อเป็นตัวอักษรอังกฤษหรือตัวเลข
                      }
                    }}
                    required
                    className="input input-bordered w-full font-FontNoto bg-gray-700 text-white py-3 px-4 rounded-md border border-gray-600"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 font-FontNoto"
                    onClick={() => togglePasswordVisibility("passwordHash")}
                  >
                    {showPassword.passwordHash ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-control mb-4">
                <label htmlFor="email" className="label">
                  <span className="label-text font-FontNoto">อีเมล</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    const allowedCharacters = /^[a-zA-Z0-9@._-]*$/; // กรองเฉพาะอักขระที่ใช้ในอีเมล
                    if (allowedCharacters.test(value) || value === "") {
                      handleChange(e); // อัปเดตค่าเมื่อข้อมูลถูกต้อง
                    }
                  }}
                  required
                  className="input input-bordered w-full font-FontNoto"
                />
              </div>

              <button
                type="submit"
                className={`btn btn-warning w-full font-FontNoto${loading ? "loading" : ""
                  }`}
                disabled={loading}
              >
                {loading ? "กำลังสมัคร..." : "บันทึกข้อมูล"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
