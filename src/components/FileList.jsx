import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import { Link, useNavigate } from "react-router-dom";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const navigate = useNavigate();

  const roleMapping = {
    Hr: "ทรัพยากรบุคคล",
    GM: "ผู้จัดการทั่วไป",
    Dev: "นักพัฒนาระบบ",
    BA: "นักวิเคราะห์ธุรกิจ",
    Employee: "พนักงาน",
  };

  // ดึงข้อมูลไฟล์และผู้ใช้จาก API
  useEffect(() => {
    axios
      .get("https://localhost:7039/api/Admin/files")
      .then((response) => {
        setFiles(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading file data:", error);
        setLoading(false);
      });

    axios
      .get("https://localhost:7039/api/Admin/Users")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        }
      })
      .catch((error) => console.error("Error loading user data:", error));
  }, []);

  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  // กรองรายชื่อผู้ใช้ไม่ให้ซ้ำ
  const uniqueUsers = Array.from(new Set(filteredFiles.map((file) => file.userID)))
    .map((userID) => users.find((user) => user.userID === userID))
    .filter((user) => user); // กรองผู้ใช้ที่ไม่มีข้อมูลออก

  const handleSearch = () => {
    if (!searchName.trim()) {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter((file) => {
        const user = users.find((u) => u.userID === file.userID);
        const fullName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : "";
        return fullName.includes(searchName.toLowerCase());
      });
      setFilteredFiles(filtered);
    }
  };

  const getUserDetails = (userID) => {
    const user = users.find((u) => u.userID === userID);
    return user
      ? {
        fullName: `${user.firstName} ${user.lastName}`,
        department: user.department || "ไม่ระบุ",
        designation: user.designation || "ไม่ระบุ",
      }
      : { fullName: "ไม่พบข้อมูล", department: "ไม่พบข้อมูล", designation: "ไม่พบข้อมูล" };
  };

  const getUserFullName = (userID) => {
    const user = users.find((u) => u.userID === userID);
    return user ? `${user.firstName} ${user.lastName}` : "ไม่พบข้อมูล";
  };
  useEffect(() => {
    axios.get('https://localhost:7039/api/Admin/GetAdminInfo')
      .then(response => {
        console.log("API Response:", response.data); // ตรวจสอบผลลัพธ์
        setAdminName(response.data.name || "ไม่มีชื่อแอดมิน"); // ใช้ Name หรือข้อความเริ่มต้น
        const profileUrls = response.data.profilePictureUrl || [];
        setProfilePic(profileUrls.length ? `http://localhost/${profileUrls}` : '/uploads/admin/default-profile.jpg');
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      });
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
    const formData = new FormData();
    console.log("Name to update:", adminName); // ล็อกชื่อที่จะอัปเดต

    if (adminName) formData.append("name", adminName);

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setIsEditingName(false);
      setUploadMessage(<p className="text-green-500 font-FontNoto">บันทึกชื่อสำเร็จ!</p>);
    } catch (error) {
      console.error("Error updating admin name:", error);
      setUploadMessage(
        <p className="text-red-500 font-FontNoto">เกิดข้อผิดพลาดในการบันทึกชื่อ</p>
      );
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

    const formData = new FormData();
    formData.append("profilePictures", selectedFile); // ส่งเฉพาะรูปภาพ

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
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
            <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
            <li><NavLink to="/FileList" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>จัดการเอกสาร</NavLink></li>
            <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
            <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">

          <h2 className="text-2xl font-bold text-black font-FontNoto">จัดการไฟล์พนักงาน</h2>
          <div className="flex items-center justify-end gap-4 mb-4">
            <input
              type="text"
              className="input input-bordered font-FontNoto"
              placeholder="ค้นหาชื่อ-นามสกุล..."
              style={{ width: "250px" }}
              value={searchName}
              onChange={(e) => {
                const input = e.target.value;
                if (/^[ก-๙\s]*$/.test(input)) {
                  setSearchName(input);
                }
              }}
            />
            <button className="btn btn-outline btn-success font-FontNoto" onClick={handleSearch}>ค้นหา</button>
          </div>
          <div> <span className="font-FontNoto text-lg">จำนวนพนักงาน: {uniqueUsers.length} คน</span></div>
          {loading ? (
            <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 font-FontNoto">ชื่อ-นามสกุล</th>
                    <th className="border px-4 py-2 font-FontNoto">แผนก</th>
                    <th className="border px-4 py-2 font-FontNoto">ตำแหน่ง</th>
                    <th className="border px-4 py-2 font-FontNoto">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueUsers.length > 0 ? (
                    uniqueUsers.map((user) => (
                      <tr key={user.userID} className="hover:bg-gray-50">
                        <td className="border px-4 py-2 font-FontNoto">
                          {`${user.firstName} ${user.lastName}`}
                        </td>
                        <td className="border px-4 py-2 font-FontNoto">
                        {roleMapping[user.role]}
                        </td>
                        <td className="border px-4 py-2 font-FontNoto">
                          {user.designation || "ไม่ระบุ"}
                        </td>
                        <td className="border px-4 py-2 font-FontNoto flex justify-center">
                          {/* ดึง fileID ของไฟล์ล่าสุดของพนักงานเพื่อดูรายละเอียด */}
                          <button
                            className="btn btn-outline btn-info btn-sm font-FontNoto"
                            onClick={() => {
                              const file = filteredFiles.find(f => f.userID === user.userID);
                              if (file) {
                                navigate(`/FileDetail/${user.userID}`);
                              } else {
                                alert("ไม่พบไฟล์สำหรับพนักงานคนนี้");
                              }
                            }}
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border px-4 py-2 text-center font-FontNoto" colSpan={4}>
                        ไม่มีผู้ใช้ที่ตรงกับการค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default FileList;
