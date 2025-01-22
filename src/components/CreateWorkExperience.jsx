import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function CreateWorkExperience() {
    const [newExperience, setNewExperience] = useState({
        companyName: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        salary: "",
    });

    const [users, setUsers] = useState([]);
    const [selectedUserID, setSelectedUserID] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
    const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
    const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
    const [uploadMessage, setUploadMessage] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://localhost:7039/api/Admin/users");
                setUsers(response.data);
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน:", error);
            }
        };
        fetchUsers();
    }, []);
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        // ตรวจสอบชื่อบริษัทและตำแหน่งว่าต้องเป็นภาษาไทยเท่านั้น
        if ((name === "companyName" || name === "jobTitle") && !/^[ก-๙\s]*$/.test(value)) {
            return; // หยุดการอัปเดต state ถ้าไม่ใช่ภาษาไทย
        }
        // ตรวจสอบปีเริ่มต้นและปีสิ้นสุดให้กรอกเฉพาะตัวเลข 4 หลัก
        if ((name === "startDate" || name === "endDate") && !/^\d{0,4}$/.test(value)) {
            return; // หยุดการอัปเดต state ถ้าค่าไม่ใช่ตัวเลข 4 หลัก
        }

        // ตรวจสอบเงินเดือนว่าห้ามติดลบ
        if (name === "salary" && value < 0) {
            return; // หยุดการอัปเดต state ถ้าเงินเดือนเป็นค่าติดลบ
        }

        setNewExperience({ ...newExperience, [name]: value });
    };

    const handleUserChange = (e) => {
        setSelectedUserID(e.target.value);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false); // ปิด Modal
        navigate("/WorkExperienceList"); // เด้งกลับไปหน้า WorkExperienceList
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // ตรวจสอบว่า companyName และ jobTitle เป็นภาษาไทย
        const thaiRegex = /^[ก-๙\s]+$/;
        if (!thaiRegex.test(newExperience.companyName)) {
            newErrors.companyName = "กรุณากรอกชื่อบริษัทเป็นภาษาไทยเท่านั้น";
        }
        if (!thaiRegex.test(newExperience.jobTitle)) {
            newErrors.jobTitle = "กรุณากรอกตำแหน่งเป็นภาษาไทยเท่านั้น";
        }

        // ตรวจสอบว่า salary ไม่ติดลบ
        const salary = parseFloat(newExperience.salary);
        if (salary < 0) {
            newErrors.salary = "เงินเดือนไม่สามารถเป็นค่าติดลบได้";
        }

        // หากมีข้อผิดพลาดให้แสดงข้อความและหยุดการดำเนินการ
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({}); // ล้างข้อผิดพลาดเมื่อไม่มีปัญหา

        try {
            const response = await axios.post("https://localhost:7039/api/Admin/WorkExperiences", {
                userID: parseInt(selectedUserID),
                companyName: newExperience.companyName,
                jobTitle: newExperience.jobTitle,
                startDate: newExperience.startDate,
                endDate: newExperience.endDate || null, // อนุญาตให้ endDate เป็น null
                salary: salary,
            });

            console.log("เพิ่มข้อมูลประสบการณ์ทำงานสำเร็จ", response.data);

            setNewExperience({
                companyName: "",
                jobTitle: "",
                startDate: "",
                endDate: "",
                salary: "",
            });
            setSelectedUserID("");
            setIsModalOpen(true); // เปิด Modal
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
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
                        <li><Link to="/AdminDashboard" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">Dashboard</Link></li>
                        <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
                        <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
                        <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
                        <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
                        <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
                        <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
                    </ul>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                            <h2 className="text-xl font-bold text-center mb-4 font-FontNoto">เพิ่มข้อมูลสำเร็จ</h2>
                            <p className="text-center font-FontNoto">ข้อมูลประสบการณ์ทำงานถูกบันทึกเรียบร้อยแล้ว</p>
                            <div className="mt-4 flex justify-center">
                                <button
                                    className="btn btn-primary font-FontNoto"
                                    onClick={() => handleCloseModal(false)} // ปิด Modal
                                >
                                    ตกลง
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Main Content */}
                <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
                    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-2xl font-bold text-center mb-4 font-FontNoto">เพิ่มประสบการณ์ทำงาน</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-FontNoto">เลือกพนักงาน</span>
                                </label>
                                <select
                                    className="select select-bordered text-black bg-white focus:bg-white focus:text-black font-FontNoto"
                                    value={selectedUserID}
                                    onChange={handleUserChange}
                                    required
                                >
                                    <option value="" disabled>กรุณาเลือกพนักงาน</option>
                                    {users.map((user) => (
                                        <option key={user.userID} value={user.userID}>
                                            {user.firstName || ''} {user.lastName || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ชื่อบริษัท</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        className="input input-bordered font-FontNoto"
                                        placeholder="กรอกชื่อบริษัท"
                                        value={newExperience.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ตำแหน่ง</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        className="input input-bordered font-FontNoto"
                                        placeholder="กรอกตำแหน่ง"
                                        value={newExperience.jobTitle}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">เงินเดือน</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="salary"
                                        className="input input-bordered font-FontNoto"
                                        placeholder="กรอกเงินเดือน"
                                        value={newExperience.salary}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ปีที่เริ่มต้น</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="startDate"
                                        className="input input-bordered font-FontNoto"
                                        placeholder="กรอกปีที่เริ่มต้น (ตัวอย่าง: 2567)"
                                        value={newExperience.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ปีที่สิ้นสุด</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="endDate"
                                        className="input input-bordered font-FontNoto"
                                        placeholder="กรอกปีที่สิ้นสุด (ตัวอย่าง: 2568)"
                                        value={newExperience.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-warning w-full font-FontNoto">เพิ่มประสบการณ์ทำงาน</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateWorkExperience;
