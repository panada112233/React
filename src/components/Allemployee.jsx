import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
// ข้อมูลพนักงานในระบบ
const Allemployee = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("https://localhost:7039/api/Admin/Users")
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                    setFilteredUsers(response.data); // ตั้งค่า filteredUsers
                } else {
                    console.error("Data is not an array:", response.data);
                    setUsers([]);
                    setFilteredUsers([]);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading user data:", error);
                setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
                setLoading(false);
            });
    }, []);


    const handleSearch = () => {
        if (!/^[ก-๙\s]*$/.test(searchTerm)) {
            alert("กรุณาป้อนเฉพาะตัวอักษรภาษาไทย");
            return;
        }

        const results = users.filter((user) =>
            user.firstName.includes(searchTerm) || user.lastName.includes(searchTerm)
        );
        setFilteredUsers(results);
    };


    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex min-h-screen bg-base-200">
                {/* Content */}
                <div className="flex-1 p-6 bg-white shadow-lg rounded-lg ml-1">
                    <Link to="/EmpHome/Allemployee" className="btn btn-outline font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        พนักงานในระบบ
                    </Link>
                    <Link to="/EmpHome/Alldocuments" className="btn btn-outline btn-success font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        เอกสารพนักงาน
                    </Link>
                    <Link to="/EmpHome/Allexperiences" className="btn btn-outline btn-info font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        ประสบการณ์ทำงาน
                    </Link>
                    <Link to="/EmpHome/Alleducation" className="btn btn-outline btn-primary font-FontNoto mt-2">
                        การศึกษาพนักงาน
                    </Link>

                    <div className="mb-6"></div>
                        <h2 className="text-2xl font-bold text-black font-FontNoto">ข้อมูลพนักงานในระบบ</h2>
                    {/* Search Form */}
                    <div className="flex items-center justify-end gap-2 mt-4">
                        {/* Search and Search Button */}
                        <input
                            type="text"
                            className="input input-bordered font-FontNoto"
                            placeholder="ค้นหาชื่อ-นามสกุล..."
                            style={{ width: "200px" }}
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^[ก-๙\s]*$/.test(value)) {
                                    setSearchTerm(value); // อัปเดตเฉพาะค่าที่เป็นภาษาไทย
                                }
                            }}
                        />
                        <button className="btn btn-outline btn-success font-FontNoto" onClick={handleSearch}>
                            ค้นหา
                        </button>
                    </div>
                    <div> <span className="font-FontNoto text-lg">จำนวนพนักงานทั้งหมด: {users.length} คน</span></div>
                    {loading ? (
                        <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>
                    ) : error ? (
                        <div className="text-center py-6 text-red-500 font-FontNoto">{error}</div>
                    ) : (
                        <>
                            {/* Responsive Table */}
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border px-4 py-2 font-FontNoto">รูปโปรไฟล์</th>
                                            <th className="border px-4 py-2 font-FontNoto">ชื่อ</th>
                                            <th className="border px-4 py-2 font-FontNoto">นามสกุล</th>
                                            <th className="border px-4 py-2 font-FontNoto">อีเมล</th>
                                            <th className="border px-4 py-2 font-FontNoto">เบอร์โทรศัพท์</th>
                                            <th className="border px-4 py-2 font-FontNoto">แผนก</th>
                                            <th className="border px-4 py-2 font-FontNoto">ตำแหน่ง</th>
                                            <th className="border px-4 py-2 font-FontNoto">วันทีเข้าร่วม</th>
                                            <th className="border px-4 py-2 font-FontNoto">เพศ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(searchTerm ? filteredUsers : users).length > 0 ? (
                                            (searchTerm ? filteredUsers : users).map((user) => {
                                                const profileImageUrl = `https://localhost:7039/api/Files/GetProfileImage?userID=${user.userID}`;
                                                return (
                                                    <tr key={user.userID} className="hover:bg-gray-50">
                                                        <td className="border py-2 font-FontNoto">
                                                            <div className="flex justify-center">
                                                                <img
                                                                    src={profileImageUrl || "/placeholder.jpg"}
                                                                    alt="โปรไฟล์"
                                                                    className="w-32 h-32 rounded-lg object-cover border-2 border-yellow-500 font-FontNoto"
                                                                />
                                                            </div>
                                                        </td>

                                                        <td className="border px-4 py-2 font-FontNoto">{user.firstName}</td>
                                                        <td className="border px-4 py-2 font-FontNoto">{user.lastName}</td>
                                                        <td className="border px-4 py-2 font-FontNoto">{user.email}</td>
                                                        <td className="border px-4 py-2 font-FontNoto text-center">{user.contact}</td>
                                                        <td className="border px-4 py-2 font-FontNoto">{roleMapping[user.role]}</td>
                                                        <td className="border px-4 py-2 font-FontNoto">{user.designation}</td>
                                                        <td className="border px-4 py-2 font-FontNoto text-center">{formatDateForDisplay(user.jDate)}</td>
                                                        <td className="border px-4 py-2 font-FontNoto text-center">{sexLabels[user.gender]}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td className="border px-4 py-2 text-center font-FontNoto" colSpan="10">
                                                    ไม่มีข้อมูล
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>


                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Allemployee;
