import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { GetUser } from '../function/apiservice';


const categoryMapping = {
    Identification: "ลาพักร้อน",
    WorkContract: "ใบลากิจ",
    Certificate: "ใบลาป่วย",
    Others: "อื่นๆ",
};

const FileDetail = () => {
    const [files, setFiles] = useState([]); // เก็บข้อมูลไฟล์ที่เกี่ยวข้อง
    const [user, setUser] = useState(null); // สถานะสำหรับข้อมูลผู้ใช้
    const [modalFileID, setModalFileID] = useState(null); // เก็บ ID ไฟล์ที่ต้องการลบ
    const [loading, setLoading] = useState(true); // สถานะการโหลด
    const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์ 
    const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
    const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
    const [uploadMessage, setUploadMessage] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const { userID } = useParams(); // รับ userID จาก URL
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ดึงข้อมูลไฟล์
                const fileResponse = await axios.get("https://localhost:7039/api/Admin/files");
                const numericUserID = parseInt(userID, 10);
                const filteredFiles = fileResponse.data.filter((file) => file.userID === numericUserID);
                setFiles(filteredFiles);

                // ดึงข้อมูลผู้ใช้
                const userResponse = await axios.get(`https://localhost:7039/api/Admin/users/${userID}`);
                setUser(userResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userID]);
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

    const handleDelete = async () => {
        if (!modalFileID) return;

        try {
            await axios.delete(`https://localhost:7039/api/Admin/files/${modalFileID}`);
            setFiles(files.filter((file) => file.fileID !== modalFileID)); // อัปเดตไฟล์ที่เหลือ
            setModalFileID(null); // ปิด modal หลังลบเสร็จ
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    if (loading) {
        return <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>;
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

            {/* Main Content */}
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
                        <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
                        <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
                        <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
                        <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
                    </ul>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
                    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-4">
                        <div className="mt-6 flex justify-between">
                            <h2 className="text-2xl font-bold text-black font-FontNoto mb-4">
                                ไฟล์ของพนักงาน ชื่อ: {user ? `${user.firstName} ${user.lastName}` : "ไม่พบข้อมูล"}
                            </h2>
                            <button
                                onClick={() => navigate("/FileList")}
                                className="btn btn-outline btn-error font-FontNoto"
                            >
                                กลับไปยังรายการ
                            </button>
                        </div>
                        <div className="mt-3 flex justify-between">
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 font-FontNoto">หมวดหมู่</th>
                                        <th className="border px-4 py-2 font-FontNoto">คำอธิบาย</th>
                                        <th className="border px-4 py-2 font-FontNoto">ประเภทไฟล์</th>
                                        <th className="border px-4 py-2 font-FontNoto">นามสกุลไฟล์</th>
                                        <th className="border px-4 py-2 font-FontNoto">วันที่อัพโหลด</th>
                                        <th className="border px-4 py-2 font-FontNoto">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.length > 0 ? (
                                        files.map((file) => (
                                            <tr key={file.fileID} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 font-FontNoto">{categoryMapping[file.category]}</td>
                                                <td className="border px-4 py-2 font-FontNoto">{file.description}</td>
                                                <td className="border px-4 py-2 font-FontNoto text-center">{file.fileType}</td>
                                                <td className="border px-4 py-2 font-FontNoto text-center">{file.filePath.split('.').pop()}</td>
                                                <td className="border px-4 py-2 font-FontNoto text-center">{file.uploadDate}</td>
                                                <td className="border px-4 py-2 space-x-2 text-center">
                                                    <a
                                                        href={`https://localhost:7039${file.filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline btn-info btn-sm font-FontNoto"
                                                    >
                                                        ดูไฟล์
                                                    </a>
                                                    <button
                                                        className="btn btn-outline btn-error btn-sm font-FontNoto"
                                                        onClick={() => setModalFileID(file.fileID)}
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="border px-4 py-2 text-center font-FontNoto" colSpan={6}>
                                                ไม่พบไฟล์สำหรับพนักงานคนนี้
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal ยืนยันการลบ */}
            {modalFileID && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-left font-FontNoto">คุณแน่ใจหรือไม่?</h3>
                        <p className="py-4 text-left font-FontNoto">การลบไฟล์นี้จะไม่สามารถกู้คืนได้!</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-warning font-FontNoto"
                                onClick={() => setModalFileID(null)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-success font-FontNoto"
                                onClick={handleDelete}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default FileDetail;
