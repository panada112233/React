import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Allexperiences = () => {
    const [workExperiences, setWorkExperiences] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");
    const [filteredExperiences, setFilteredExperiences] = useState([]);

    const roleMapping = {
        Hr: "ทรัพยากรบุคคล",
        GM: "ผู้จัดการทั่วไป",
        Dev: "นักพัฒนาระบบ",
        BA: "นักวิเคราะห์ธุรกิจ",
        Employee: "พนักงาน",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expResponse, userResponse] = await Promise.all([
                    axios.get("https://localhost:7039/api/Admin/WorkExperiences"),
                    axios.get("https://localhost:7039/api/Admin/Users"),
                ]);

                setWorkExperiences(expResponse.data || []);
                setUsers(userResponse.data || []);
                setFilteredExperiences(expResponse.data || []);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = () => {
        if (!searchName.trim()) {
            setFilteredExperiences(workExperiences);
        } else {
            const filtered = workExperiences.filter((exp) => {
                const user = users.find((u) => u.userID === exp.userID);
                const fullName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : "";
                return fullName.includes(searchName.toLowerCase());
            });
            setFilteredExperiences(filtered);
        }
    };

    const groupedData = filteredExperiences.reduce((acc, exp) => {
        const user = users.find((u) => u.userID === exp.userID);
        if (user) {
            const userKey = `${user.userID}`;
            if (!acc[userKey]) {
                acc[userKey] = {
                    user,
                    experiences: [],
                };
            }
            acc[userKey].experiences.push(exp);
        }
        return acc;
    }, {});

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex min-h-screen bg-base-200">
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
                    <Link to="/EmpHome/Alleducation" className="btn btn-outline btn-primary font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        การศึกษาพนักงาน
                    </Link>
                    <Link to="/EmpHome/Allcreate" className="btn btn-outline btn-secondary font-FontNoto mt-2">
                        เพิ่มพนักงานใหม่
                    </Link>
                    <div className="mb-6"></div>
                    <h2 className="text-2xl font-bold text-black font-FontNoto mb-4">ข้อมูลประสบการณ์ทำงาน</h2>
                    <div className="flex items-center justify-end gap-4 mb-4">
                        <input
                            type="text"
                            className="input input-bordered font-FontNoto"
                            placeholder="ค้นหาชื่อ-นามสกุล..."
                            style={{ width: "250px" }}
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <button className="btn btn-outline btn-success font-FontNoto" onClick={handleSearch}>
                            ค้นหา
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {Object.values(groupedData).map(({ user, experiences }) => (
                                <div key={user.userID} className="mb-6 p-4 border rounded-lg shadow">
                                    <h3 className="text-xl font-bold mb-2 font-FontNoto">
                                        ชื่อ : {`${user.firstName} ${user.lastName}`} ({roleMapping[user.role]})
                                    </h3>
                                    <p className="font-FontNoto mb-1">ตำแหน่ง : {user.designation || "ไม่ระบุ"}</p>

                                    <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border px-4 py-2 font-FontNoto">บริษัท</th>
                                                <th className="border px-4 py-2 font-FontNoto">ตำแหน่ง</th>
                                                <th className="border px-4 py-2 font-FontNoto">เงินเดือน</th>
                                                <th className="border px-4 py-2 font-FontNoto">ปีเริ่มต้น</th>
                                                <th className="border px-4 py-2 font-FontNoto">ปีสิ้นสุด</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {experiences.map((exp) => (
                                                <tr key={exp.experienceID} className="hover:bg-gray-50">
                                                    <td className="border px-4 py-2 font-FontNoto">{exp.companyName}</td>
                                                    <td className="border px-4 py-2 font-FontNoto">{exp.jobTitle}</td>
                                                    <td className="border px-4 py-2 font-FontNoto text-center">{exp.salary}</td>
                                                    <td className="border px-4 py-2 font-FontNoto text-center">{exp.startDate}</td>
                                                    <td className="border px-4 py-2 font-FontNoto text-center">{exp.endDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Allexperiences;
