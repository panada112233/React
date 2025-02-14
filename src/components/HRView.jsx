import axios from "axios";
import React, { useState, useEffect } from "react";

const HRView = () => {
    const [hrApprovedForms, setHrApprovedForms] = useState([]); // ฟอร์มที่ HR เซ็นชื่ออนุมัติ
    const [hrForms, setHrForms] = useState([]);
    const [formToApprove, setFormToApprove] = useState(null);
    const [hrName, setHrName] = useState(""); // เพิ่ม state สำหรับชื่อ HR
    const [selectedFormForEdit, setSelectedFormForEdit] = useState(null); // ฟอร์มที่เลือกแก้ไข
    const [selectedFormForDetails, setSelectedFormForDetails] = useState(null); // ฟอร์มที่เลือกดูรายละเอียด
    const currentUserRole = sessionStorage.getItem("role");
    const [roleState, setRolesState] = useState(null)
    const [historyState, sethistoryState] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [leaveTypesState, setleaveTypesState] = useState(null)
    const [newDocument, setNewDocument] = useState({
        category: '',
        file: null,
        description: '',
    });

    useEffect(() => {
        //  loadLocalStorageData();
        fetchHRForms();
        fetchRole()
        fetchLeaveType()
    }, []);
    const fetchRole = async () => {
        const roleRes = await axios.get(`https://localhost:7039/api/Users/GetRoles`);

        setRolesState(roleRes.data)
    }
    const fetchLeaveType = async () => {
        const res = await axios.get(`https://localhost:7039/api/Document/GetLeaveTypes`);

        setleaveTypesState(res.data)
    }
    const handleApprove = async () => {
        if (!hrName) {
            alert("กรุณากรอกชื่อ HR ก่อนอนุมัติ!");
            return;
        }

        if (!formToApprove || !formToApprove.documentId) {
            alert("ไม่พบฟอร์มที่ต้องการอนุมัติ");
            return;
        }

        const approvalData = {
            DocumentID: formToApprove.documentId,
            HRSignature: hrName,
        };

        console.log("✅ Data ที่ส่งไป API:", approvalData);

        try {
            const response = await fetch("https://localhost:7039/api/Document/ApproveByHR", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(approvalData),
            });

            if (response.ok) {
                // 1️⃣ ลบฟอร์มที่อนุมัติแล้วออกจาก `hrForms`
                setHrForms(prevForms => prevForms.filter(form => form.documentId !== formToApprove.documentId));

                // 2️⃣ เพิ่มฟอร์มที่อนุมัติแล้วลงใน `hrApprovedForms`
                setHrApprovedForms(prevApprovedForms => [...prevApprovedForms, {
                    ...formToApprove,
                    hrSignature: hrName,
                    hrApprovedDate: new Date().toISOString() // ✅ อัปเดตวันที่อนุมัติ
                }]);

                // 3️⃣ เคลียร์ค่าฟอร์มที่กำลังอนุมัติและชื่อ HR
                setFormToApprove(null);
                setHrName("");

                console.log("✅ ฟอร์มถูกอนุมัติและย้ายไปแสดงข้างล่างแล้ว!");
            } else {
                const errorText = await response.text();
                console.error("❌ Server error:", errorText);
                alert("❌ เกิดข้อผิดพลาด: " + errorText);
            }
        } catch (error) {
            console.error("❌ Error:", error);
        }
    };

    useEffect(() => {
        fetchApprovedForms(); // ✅ โหลดฟอร์มที่ HR อนุมัติแล้ว
    }, []);


    const setdetailFromView = async (from) => {
        console.log(from)

        setSelectedFormForDetails({
            ...from,
            roleid: from.rolesid,
            leavedType: from.leavedType,
            leaveTypeId: from.leaveTypeId
        })
        await fetchHistory(from.documentId)
        // roleid: roles,
    }
    const fetchHistory = async (documentid) => {
        try {
            const res = await axios.get(`https://localhost:7039/api/Document/GetDocumentWithHistory/${documentid}`);
            console.log("fetchHistory", res.data.historyleave)

            const historyRes = res.data.historyleave;

            sethistoryState(historyRes)
        } catch (e) {
            console.log(e)
        }
    }
    const fetchHRForms = async () => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/GetPendingFormsForHR");

            if (response.ok) {
                const data = await response.json();
                console.log("📌 ฟอร์มที่โหลดมา:", data);
                setHrForms(data); // ✅ โหลดข้อมูลใหม่
            } else {
                console.warn("❌ ไม่พบฟอร์มที่ต้องอนุมัติ");
                setHrForms([]);
            }
        } catch (error) {
            console.error("❌ Error fetching HR pending forms:", error);
        }
    };
    const fetchApprovedForms = async () => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/GetApprovedFormsForHR");

            if (response.ok) {
                const data = await response.json();
                setHrApprovedForms(data); // ✅ โหลดข้อมูลฟอร์มที่ HR อนุมัติแล้วจากฐานข้อมูล
            } else {
                setHrApprovedForms([]); // ตั้งค่าเป็นอาร์เรย์ว่าง
            }
        } catch (error) {
            console.error("❌ Error fetching approved HR forms:", error);
        }
    };

    const handleEditHRSignature = async () => {
        if (!selectedFormForEdit || !selectedFormForEdit.documentId) {
            alert("ไม่พบฟอร์มที่ต้องการแก้ไข");
            return;
        }

        if (!selectedFormForEdit.hrSignature) {
            alert("กรุณากรอกชื่อ HR");
            return;
        }

        const updateData = {
            DocumentID: selectedFormForEdit.documentId,
            HRSignature: selectedFormForEdit.hrSignature,
        };

        try {
            const response = await fetch("https://localhost:7039/api/Document/EditHRSignature", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {

                // ✅ โหลดข้อมูลฟอร์มที่ HR อนุมัติแล้วอีกครั้ง
                await fetchApprovedForms();

                setSelectedFormForEdit(null);
            } else {
                const errorText = await response.text();
                console.error("❌ Server error:", errorText);
                alert("❌ เกิดข้อผิดพลาด: " + errorText);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            alert("❌ เกิดข้อผิดพลาดในการอัปเดตชื่อ HR");
        }
    };

    // ฟังก์ชันแปลงวันที่เป็นรูปแบบ "DD/MM/YYYY"
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };
    const handleSendToEmployee = async (form) => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/SendDocumentToEmployee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: form.userId || 0,
                    fullname: form.fullname || "ไม่ระบุชื่อ",
                    documentId: form.documentId || "",
                    leaveTypeId: form.leaveTypeId || ""
                }),
            });

            if (response.ok) {
                setModalMessage("✅ ส่งเอกสารให้พนักงานสำเร็จ!");

                // ✅ ลบฟอร์มที่ถูกส่งออกจากรายการที่อนุมัติแล้ว
                setHrApprovedForms(prevForms => prevForms.filter(f => f.documentId !== form.documentId));
            } else {
                setModalMessage("❌ ไม่สามารถส่งเอกสารให้พนักงานได้");
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setModalMessage("❌ เกิดข้อผิดพลาดในการส่งเอกสารให้พนักงาน");
        } finally {
            setIsModalOpen(true); // เปิด Modal แจ้งเตือน
        }
    };



    return (
        <div className="p-6">
            {/* ฟอร์มที่หัวหน้าอนุมัติ */}
            <section>
                <h2 className="text-xl font-bold mt-8 font-FontNoto">ฟอร์มที่หัวหน้าอนุมัติ</h2>
                {hrForms.length > 0 ? (
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr className="text-black bg-blue-100">
                                <th>#</th>
                                <th className="font-FontNoto">ชื่อพนักงาน</th>
                                <th className="font-FontNoto">วันที่อนุมัติ</th>
                                <th className="font-FontNoto">ลายเซ็นผู้จัดการทั่วไป</th>
                                <th className="font-FontNoto">ความคิดเห็น</th>
                                <th className="font-FontNoto text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hrForms.map((form, index) => (
                                <tr key={form.id || index}>
                                    <td className="font-FontNoto">{index + 1}</td>
                                    <td className="font-FontNoto">{form.fullname}</td>
                                    <td className="font-FontNoto">{formatDate(form.approvedDate)}</td>
                                    <td className="font-FontNoto">{form.managerName}</td>
                                    <td className="font-FontNoto">{form.managerComment}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline btn-info ml-2 font-FontNoto"
                                            onClick={() => setdetailFromView(form)} // เปิด Modal ดูรายละเอียด
                                        >
                                            ดูรายละเอียด
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline btn-success ml-2 font-FontNoto"
                                            onClick={() => {
                                                if (form) {
                                                    setFormToApprove(form); // ตรวจสอบฟอร์มก่อนเปิด Modal
                                                } else {
                                                    alert("ฟอร์มไม่ถูกต้อง!");
                                                }
                                            }}
                                        >
                                            เซ็นชื่อ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                ) : (
                    <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่หัวหน้าอนุมัติ</p>
                )}
                {formToApprove && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto">เซ็นชื่ออนุมัติ</h3>
                            <p className="font-FontNoto">คุณกำลัง อนุมัติฟอร์มของ : {formToApprove.fullname}</p>
                            <div className="mt-4">
                                <label className="label">
                                    <span className="label-text font-FontNoto">ชื่อ ทรัพยากรบุคคล :</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full font-FontNoto"
                                    value={hrName}
                                    onChange={(e) => {
                                        const onlyText = e.target.value.replace(/[0-9]/g, ""); // ✅ ลบเฉพาะตัวเลขออก
                                        setHrName(onlyText);
                                    }}
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-success font-FontNoto"
                                    onClick={handleApprove} // เรียก handleApprove เมื่อกดปุ่ม
                                >
                                    ยืนยัน
                                </button>
                                <button
                                    className="btn btn-outline btn-error font-FontNoto"
                                    onClick={() => setFormToApprove(null)}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </dialog>
                )}
            </section>

            {/* ฟอร์มที่ HR เซ็นชื่ออนุมัติ */}
            <section className="mt-8">
                <h2 className="text-lg font-bold mb-2 font-FontNoto">ฟอร์มที่ HR อนุมัติแล้ว</h2>
                {hrApprovedForms.length > 0 ? (
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr className="text-black bg-blue-100">
                                <th>#</th>
                                <th className="font-FontNoto text-center">ชื่อพนักงาน</th>
                                {/* <th className="font-FontNoto text-center">วันที่อนุมัติ</th> */}
                                <th className="font-FontNoto text-center">ลายเซ็นการอนุมัติ</th>
                                <th className="font-FontNoto text-center">ความคิดเห็น</th>
                                <th className="font-FontNoto text-center">วันที่อนุมัติ</th>
                                <th className="font-FontNoto text-center">ลายเซ็น HR</th>
                                <th className="font-FontNoto text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hrApprovedForms.map((form, index) => (
                                <tr key={`${form.id}-${index}`}>  {/* ใช้ combination ของ `form.id` และ `index` เพื่อให้ key เป็นเอกลักษณ์ */}
                                    <td className="font-FontNoto text-center">{index + 1}</td>
                                    <td className="font-FontNoto text-center">{form.fullname}</td>
                                    {/* <td className="font-FontNoto text-center">{formatDate(form.approvedDate)}</td> */}
                                    <td className="font-FontNoto text-center">{form.managerName}</td>
                                    <td className="font-FontNoto text-center">{form.managerComment}</td>
                                    <td className="font-FontNoto text-center">{formatDate(form?.hrApprovedDate)}</td>
                                    <td className="font-FontNoto text-center">{form.hrSignature}</td>

                                    <td className="font-FontNoto text-center">
                                        <button
                                            className="btn btn-sm btn-outline btn-primary"
                                            onClick={() => handleSendToEmployee(form)} // ✅ กดแล้วเอกสารจะถูกบันทึกลงฐานข้อมูล
                                        >
                                            ส่งให้พนักงาน
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline btn-warning ml-2"
                                            onClick={() => setSelectedFormForEdit(form)} // เปิด Modal แก้ไข
                                        >
                                            แก้ไข
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                ) : (
                    <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่ HR เซ็นชื่ออนุมัติ</p>
                )}
                {selectedFormForEdit && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto">แก้ไขชื่อทรัพยากรบุคคล</h3>
                            <div className="mt-4">
                                <label className="label">
                                    <span className="label-text font-FontNoto">ชื่อ ทรัพยากรบุคคล :</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full font-FontNoto"
                                    value={selectedFormForEdit.hrSignature}
                                    onChange={(e) => {
                                        const onlyText = e.target.value.replace(/[0-9]/g, ""); // ✅ ลบเฉพาะตัวเลขออก
                                        setSelectedFormForEdit({
                                            ...selectedFormForEdit,
                                            hrSignature: onlyText,
                                        });
                                    }}
                                />
                            </div>
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-success font-FontNoto"
                                    onClick={handleEditHRSignature} // ✅ เรียกใช้ฟังก์ชันอัปเดตชื่อ HR
                                >
                                    บันทึก
                                </button>
                                <button
                                    className="btn btn-outline btn-error font-FontNoto"
                                    onClick={() => setSelectedFormForEdit(null)} // ปิด Modal
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </dialog>
                )}
                {isModalOpen && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto">แจ้งเตือน</h3>
                            <p className="font-FontNoto">{modalMessage}</p>
                            <div className="modal-action">
                                <button className="btn btn-outline btn-success font-FontNoto" onClick={() => setIsModalOpen(false)}>
                                    ตกลง
                                </button>
                            </div>
                        </div>
                    </dialog>
                )}

                {selectedFormForDetails && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto text-center">รายละเอียดฟอร์ม</h3>
                            <table className="table table-zebra w-full mt-6">
                                <tbody>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '40px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedFormForDetails.fullname}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">ตำแหน่ง :</strong> {
                                                roleState.find(x => x.rolesid == selectedFormForDetails.roleid)?.rolesname

                                            }</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {
                                                leaveTypesState.find(x => x.leaveTypeid == selectedFormForDetails.leaveTypeId)?.leaveTypeTh
                                            }
                                            </div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedFormForDetails.reason}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {formatDate(selectedFormForDetails?.startdate)}</div>
                                            <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedFormForDetails?.enddate)}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedFormForDetails.totalleave} วัน </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong>
                                                {leaveTypesState.find(x => x.leaveTypeid == selectedFormForDetails.leavedType)?.leaveTypeTh}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {formatDate(selectedFormForDetails?.leavedStartdate)}</div>
                                            <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedFormForDetails?.leavedEnddate)}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedFormForDetails.totalleaved} วัน </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedFormForDetails?.friendeContact}</div>
                                            <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedFormForDetails?.contact}</div>
                                        </td>
                                    </tr>
                                    <tr className="font-FontNoto text-center">
                                        <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <div className="font-FontNoto text-center">
                                                <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {formatDate(selectedFormForDetails?.workingstart)}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <thead className="text-center font-FontNoto">
                                            <tr>
                                                <th className="font-FontNoto">ประเภทการลา</th>
                                                <th className="font-FontNoto">ลามาแล้ว (วัน)</th>
                                                <th className="font-FontNoto">ลาครั้งนี้ (วัน)</th>
                                                <th className="font-FontNoto">รวม (วัน)</th>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">ป่วย</th>
                                                <td className="font-FontNoto text-center">{historyState?.lastTotalStickDay}</td>
                                                <td className="font-FontNoto text-center">{historyState?.totalStickDay}</td>
                                                <td className="font-FontNoto text-center">{historyState?.sumStickDay}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">กิจส่วนตัว</th>
                                                <td className="font-FontNoto text-center">{historyState?.lastTotalPersonDay}</td>
                                                <td className="font-FontNoto text-center">{historyState?.totalPersonDay}</td>
                                                <td className="font-FontNoto text-center">{historyState?.sumPersonDay}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">พักร้อน</th>
                                                <td className="font-FontNoto text-center">{historyState?.lastTotalVacationDays}</td>
                                                <td className="font-FontNoto text-center">{historyState?.totalVacationDays}</td>
                                                <td className="font-FontNoto text-center">{historyState?.sumVacationDays}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">คลอดบุตร</th>
                                                <td className="font-FontNoto text-center">{historyState?.lastTotalMaternityDaystotal}</td>
                                                <td className="font-FontNoto text-center">{historyState?.totalMaternityDaystotal}</td>
                                                <td className="font-FontNoto text-center">{historyState?.sumMaternityDaystotal}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">บวช</th>
                                                <td className="font-FontNoto text-center">{historyState?.lastTotalOrdinationDays}</td>
                                                <td className="font-FontNoto text-center">{historyState?.totalOrdinationDays}</td>
                                                <td className="font-FontNoto text-center">{historyState?.sumOrdinationDays}</td>
                                            </tr>
                                        </thead>
                                    </tr>
                                </tbody>
                            </table>
                            {/* เพิ่มข้อมูลเพิ่มเติมตามที่คุณต้องการ */}
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-error font-FontNoto"
                                    onClick={() => setSelectedFormForDetails(null)} // ปิด Modal
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </dialog>
                )}

            </section>

        </div>
    );
};

export default HRView;
