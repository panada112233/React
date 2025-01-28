import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

const Alldocuments = () => {
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

   
    if (loading) {
        return <div className="text-center py-6 font-FontNoto">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Content */}
            <div className="flex min-h-screen bg-base-200">
            
                {/* Content Area */}
                <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
                    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-4">
                        <div className="mt-6 flex justify-between">
                            <h2 className="text-2xl font-bold text-black font-FontNoto mb-4">
                                ประวัติการศึกษาของ: {user ? `${user.firstName} ${user.lastName}` : "ไม่พบข้อมูล"}
                            </h2>
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

export default Alldocuments;
