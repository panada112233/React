import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import { GetUser } from '../function/apiservice';


const sexLabels = {
  Male: "ชาย",
  Female: "หญิง",
};
const roleMapping = {
  Hr: "ทรัพยากรบุคคล",
  GM: "ผู้จัดการทั่วไป",
  Dev: "นักพัฒนาระบบ",
  BA: "นักวิเคราะห์ธุรกิจ",
  Employee: "พนักงาน",
};
// ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบ DD-MM-YYYY
const formatDateForDisplay = (date) => {
  if (!date) return "-";
  const nDate = new Date(date);
  if (isNaN(nDate)) return "-";

  const day = String(nDate.getDate()).padStart(2, "0");
  const month = String(nDate.getMonth() + 1).padStart(2, "0");
  const year = nDate.getFullYear();
  return `${day}-${month}-${year}`; // รูปแบบ DD-MM-YYYY
};

const UserDetails = () => {
  const { UserID } = useParams();  // ดึง UserID จาก URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [error, setError] = useState(null);
  const profileImageUrl = `https://localhost:7039/api/Files/GetProfileImage?userID=${UserID}`;
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้งาน
  useEffect(() => {
    if (!UserID) {
      navigate("/UserList");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7039/api/Admin/Users/${UserID}`
        );
        setUser(response.data || null);
      } catch (error) {
        setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [UserID, navigate]);

  // ดึงข้อมูลแอดมิน
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

  // ฟังก์ชันอัปโหลดรูปโปรไฟล์
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
  

  if (loading) {
    return <div className="text-center py-6">กำลังโหลดข้อมูล...</div>;
  }

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
            <li><Link to="/AdminDashboard" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">Dashboard</Link></li>
            <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
            <li><NavLink to="/UserList" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>ข้อมูลพนักงาน</NavLink></li>
            <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
            <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
            <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-4 font-FontNoto">รายละเอียดผู้ใช้งาน</h1>

            <div className="flex justify-center mb-6">
              <img
                src={profileImageUrl || "/placeholder.jpg"}
                alt="โปรไฟล์"
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 ">
              <div>
                <p className="text-lg font-semibold font-FontNoto">ชื่อ:</p>
                <p className="font-FontNoto">{user.firstName}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">นามสกุล:</p>
                <p className="font-FontNoto">{user.lastName}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">อีเมล:</p>
                <p className="font-FontNoto">{user.email}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">เบอร์โทรศัพท์:</p>
                <p className="font-FontNoto">{user.contact}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">แผนก:</p>
                <p className="font-FontNoto">{roleMapping[user.role]}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">ตำแหน่ง:</p>
                <p className="font-FontNoto">{user.designation}</p>
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">วันที่เข้าร่วม:</p>
                <p className="font-FontNoto">{formatDateForDisplay(user.jDate)}</p> {/* ใช้ฟังก์ชัน formatDateForDisplay กับ user.jDate */}
              </div>
              <div>
                <p className="text-lg font-semibold font-FontNoto">เพศ:</p>
                <p className="font-FontNoto">{sexLabels[user.gender] || "ไม่ระบุ"}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => navigate("/UserList")}
                className="btn btn-outline btn-error font-FontNoto"
              >
                กลับไปยังรายการ
              </button>
              <Link to={`/users/edit/${user.userID}`} className="btn btn-outline btn-warning font-FontNoto">
                แก้ไขข้อมูล
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
