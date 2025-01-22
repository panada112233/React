import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Alldocuments = () => {
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");
    const [filteredFiles, setFilteredFiles] = useState([]);

    const roleMapping = {
        Hr: "ทรัพยากรบุคคล",
        GM: "ผู้จัดการทั่วไป",
        Dev: "นักพัฒนาระบบ",
        BA: "นักวิเคราะห์ธุรกิจ",
        Employee: "พนักงาน",
    };
    const categoryMapping = {
        Identification: "ลาพักร้อน",
        WorkContract: "ใบลากิจ",
        Certificate: "ใบลาป่วย",
        Others: "อื่นๆ",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fileResponse, userResponse] = await Promise.all([
                    axios.get("https://localhost:7039/api/Admin/files"),
                    axios.get("https://localhost:7039/api/Admin/Users"),
                ]);

                // Filter only 'Document' type files
                const documentFiles = fileResponse.data.filter(file => file.fileType === 'Document');

                setFiles(documentFiles);
                setUsers(userResponse.data || []);
                setFilteredFiles(documentFiles);
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

    const groupedData = filteredFiles.reduce((acc, file) => {
        const user = users.find((u) => u.userID === file.userID);
        if (user) {
            const userKey = `${user.userID}`;
            if (!acc[userKey]) {
                acc[userKey] = {
                    user,
                    documents: []
                };
            }
            acc[userKey].documents.push(file);
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
                    <Link to="/EmpHome/Alleducation" className="btn btn-outline btn-primary font-FontNoto mt-2">
                        การศึกษาพนักงาน
                    </Link>

                    <div className="mb-6"></div>

                    <h2 className="text-2xl font-bold text-black font-FontNoto">ข้อมูลเอกสารพนักงาน</h2>
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

                    {loading ? (
                        <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            {Object.values(groupedData).map(({ user, documents }) => (
                                <div key={user.userID} className="mb-6 p-4 border rounded-lg shadow">
                                    <h3 className="text-xl font-bold mb-2 font-FontNoto">
                                        ชื่อ : {`${user.firstName} ${user.lastName}`} ({roleMapping[user.role]})
                                    </h3>
                                    <p className="font-FontNoto mb-1">ตำแหน่ง : {user.designation || "ไม่ระบุ"}</p>
                                    <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border px-4 py-2 font-FontNoto">หมวดหมู่</th>
                                                <th className="border px-4 py-2 font-FontNoto">คำอธิบาย</th>
                                                <th className="border px-4 py-2 font-FontNoto">วันที่อัปโหลด</th>
                                                <th className="border px-4 py-2 font-FontNoto">ไฟล์เอกสาร</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map((file) => (
                                                <tr key={file.fileID} className="hover:bg-gray-50">
                                                    <td className="border px-4 py-2 font-FontNoto">{categoryMapping[file.category]}</td>
                                                    <td className="border px-4 py-2 font-FontNoto">{file.description}</td>
                                                    <td className="border px-4 py-2 font-FontNoto text-center">{file.uploadDate}</td>
                                                    <td className="border px-4 py-2 font-FontNoto text-center">
                                                        <a
                                                            href={`https://localhost:7039${file.filePath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline btn-info btn-sm font-FontNoto"
                                                        >
                                                            ดูเอกสาร
                                                        </a>
                                                    </td>
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

export default Alldocuments;
