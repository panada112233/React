import React, { useState, useEffect } from 'react';

const EmployeeView = () => {
    const [documents, setDocuments] = useState([]);
    const userId = sessionStorage.getItem("userId");  // Get userId from sessionStorage
    console.log("Logged in userId: ", userId);
    const role = sessionStorage.getItem("role");  // Get role from sessionStorage


    useEffect(() => {
      const fetchDocuments = () => {
          try {
              // โหลดเอกสารที่ส่งจาก HR ไปยังพนักงาน
              const savedDocuments = JSON.parse(localStorage.getItem("sentToEmployeesForms")) || [];
  
              // กรองเอกสารตาม userId ของพนักงาน
              const employeeDocuments = savedDocuments.filter(doc => doc.userId === userId);
  
              // ตั้งค่าเอกสารที่กรองแล้ว
              setDocuments(employeeDocuments);
          } catch (error) {
              console.error("Error loading documents:", error);
          }
      };
  
      fetchDocuments();
  }, [userId]);
  

    const downloadDocument = (doc) => {
        try {
            const content = `รายละเอียดเอกสาร:\n\n` +
                `ชื่อพนักงาน: ${doc.department}\n` +
                `ตำแหน่ง: ${doc.position}\n` +
                `วันที่ลา: ${doc.fromDate} ถึง ${doc.toDate}\n` +
                `ความคิดเห็น HR: ${doc.hrComment || "ไม่มี"}`;

            const blob = new Blob([content], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `document_${doc.id}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">เอกสารที่ได้รับจาก HR</h1>
            {documents.length > 0 ? (
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">#</th>
                            <th className="border border-gray-300 px-4 py-2">ชื่อเอกสาร</th>
                            <th className="border border-gray-300 px-4 py-2">วันที่ส่ง</th>
                            <th className="border border-gray-300 px-4 py-2">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc, index) => (
                            <tr key={doc.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{`เอกสารลาของ ${doc.department}`}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">{doc.hrApprovedDate}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => downloadDocument(doc)}
                                    >
                                        ดาวน์โหลด
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-500">ยังไม่มีเอกสารที่ส่งจาก HR</p>
            )}
        </div>
    );
};

export default EmployeeView;
