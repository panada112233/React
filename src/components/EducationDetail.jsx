import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

const EducationDetail = () => {
    const [educations, setEducations] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
    const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
    const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก 
    const [uploadMessage, setUploadMessage] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [modalEducationID, setModalEducationID] = useState(null); // สถานะสำหรับเก็บ ID ของการศึกษาที่ต้องการลบ
    const { userID } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ดึงข้อมูลการศึกษา
                const educationResponse = await axios.get("https://localhost:7039/api/Admin/Educations");
                const numericUserID = parseInt(userID, 10);
                const filteredEducations = educationResponse.data.filter(
                    (education) => education.userID === numericUserID
                );
                setEducations(filteredEducations);

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

    const levelLabels = {
        Primary: "ประถมศึกษา",
        Secondary: "มัธยมศึกษา",
        Voc: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
        Dip: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
        Bachelor: "ปริญญาตรี",
        Master: "ปริญญาโท",
        Doctorate: "ปริญญาเอก",
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
    // ฟังก์ชันลบข้อมูลการศึกษา
    const handleDelete = () => {
        if (modalEducationID) {
            axios
                .delete(`https://localhost:7039/api/Admin/Educations/${modalEducationID}`)
                .then(() => {
                    setEducations(educations.filter((edu) => edu.educationID !== modalEducationID));
                    setModalEducationID(null); // ปิดโมเดล
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error.response || error);
                    alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
                    setModalEducationID(null); // ปิดโมเดล
                });
        }
    };

    // ฟังก์ชันแก้ไขข้อมูลการศึกษา
    const handleEdit = (id) => {
        navigate(`/educations/edit/${id}`);
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
                                ประวัติการศึกษาของ: {user ? `${user.firstName} ${user.lastName}` : "ไม่พบข้อมูล"}
                            </h2>
                            <button
                                onClick={() => navigate("/EducationList")}
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
                                        <th className="border px-4 py-2 min-w-[100px] font-FontNoto">ระดับการศึกษา</th>
                                        <th className="border px-4 py-2 min-w-[170px] font-FontNoto">สถาบัน</th>
                                        <th className="border px-4 py-2 min-w-[150px] font-FontNoto">สาขาวิชา</th>
                                        <th className="border px-4 py-2 min-w-[120px] font-FontNoto">ปีที่ศึกษา</th>
                                        <th className="border px-4 py-2 min-w-[10px] font-FontNoto">(GPA)</th>
                                        <th className="border px-4 py-2 min-w-[150px] font-FontNoto">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {educations.length > 0 ? (
                                        educations.map((education) => (
                                            <tr key={education.educationID} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 font-FontNoto">
                                                    {levelLabels[education.level] || "ไม่ทราบระดับการศึกษา"}
                                                </td>
                                                <td className="border px-4 py-2 font-FontNoto">{education.institute}</td>
                                                <td className="border px-4 py-2 font-FontNoto">{education.fieldOfStudy}</td>
                                                <td className="border px-4 py-2 font-FontNoto text-center">{education.year}</td>
                                                <td className="border px-4 py-2 font-FontNoto text-center">{education.gpa}</td>
                                                <td className="border px-4 py-2 space-x-2 text-center">
                                                    <button
                                                        className="btn btn-outline btn-warning btn-sm font-FontNoto"
                                                        onClick={() => handleEdit(education.educationID)}
                                                    >
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-error btn-sm font-FontNoto"
                                                        onClick={() => setModalEducationID(education.educationID)}
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="border px-4 py-2 text-center font-FontNoto" colSpan={6}>
                                                ไม่พบข้อมูลการศึกษาสำหรับพนักงานคนนี้
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Confirming Deletion */}
            {modalEducationID && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-left font-FontNoto">คุณแน่ใจหรือไม่?</h3>
                        <p className="py-4 text-left font-FontNoto">การลบข้อมูลการศึกษานี้จะไม่สามารถกู้คืนได้!</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-warning font-FontNoto"
                                onClick={() => setModalEducationID(null)}
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

export default EducationDetail;
