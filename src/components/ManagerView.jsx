import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagerView = () => {

    const [pendingForms, setPendingForms] = useState([]); // ฟอร์มที่รออนุมัติจาก GM
    const [selectedForm, setSelectedForm] = useState(null);
    const [rolesState, setRolesState] = useState([]); // 🔥 โหลดข้อมูลแผนก
    const [leavetpyeState, setLeavetpyeState] = useState([]); // 🔥 โหลดประเภทการลา

    const [managerName, setManagerName] = useState("");
    const [managerComment, setManagerComment] = useState("");
    const [approvedForms, setApprovedForms] = useState([]); // ฟอร์มที่อนุมัติแล้ว
    const [selectedFormForEdit, setSelectedFormForEdit] = useState(null);

    const roleName = rolesState.find(item => item.rolesid === selectedForm?.rolesid)?.rolesname || "ไม่ระบุ";
    const leaveTypeName = leavetpyeState.find(item => item.leaveTypeid === selectedForm?.leaveTypeId)?.leaveTypeTh || "ไม่ระบุ";

    const [lastleaveTypeName, setlastleaveTypeName] = useState("ไม่ระบุ")

    const [isEditing, setIsEditing] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success", // success | error
    });
    const [forms, setForms] = useState([]); // ฟอร์มที่รอดำเนินการ
    const [selectedPendingForm, setSelectedPendingForm] = useState(null); // ฟอร์มที่เลือกจากฟอร์มที่รอดำเนินการ
    const [selectedHRForm, setSelectedHRForm] = useState(null); // ฟอร์มที่เลือกจากฟอร์มที่ส่งให้ HR

    const [hrForms, setHrForms] = useState([]); // ฟอร์มที่ส่งให้ HR
    const [selectedFormToDelete, setSelectedFormToDelete] = useState(null); // ฟอร์มที่เลือกจะลบ

    const closePendingFormModal = () => setSelectedPendingForm(null);
    const closeHRFormModal = () => setSelectedHRForm(null);

    // ตรวจสอบและโหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
    useEffect(() => {
        fetchPendingForms();
        fetchRoles();
        fetchLeaveTypes();
        fetchDocumentByHRView();

    }, []);
    const fetchDocumentByHRView = async (docstatus) => {


        const response = await fetch(`https://localhost:7039/api/Document/GetPendingFormsForHR`);
        if (response.ok) {
            const data = await response.json();
            setApprovedForms(data);
        }
    }
    const addIdToForm = (form) => ({
        ...form,
        id: form.id || Date.now(), // สร้าง id ถ้ายังไม่มี
        userId: form.userId || sessionStorage.getItem("userId"), // เก็บ userId เดิมถ้ามีอยู่
    });

    // ฟังก์ชันดูรายละเอียดฟอร์ม
    const viewPendingFormDetails = (form) => {
        setSelectedPendingForm(form);
        setIsEditing(false); // ยกเลิกการแก้ไข
    };

    const viewHRFormDetails = async (form) => {
        try {
            const response = await fetch(`https://localhost:7039/api/Document/GetDocumentWithHistory/${form.documentId}`);
            if (response.ok) {
                const data = await response.json();

                setTimeout(() => {
                    let roleName = rolesState.find(x => x.rolesid === data.rolesid)?.rolesname || "ไม่ระบุ";
                    let leaveTypeTh = leavetpyeState.find(x => x.leaveTypeid === data.leaveTypeId)?.leaveTypeTh || "ไม่ระบุ";

                    setSelectedHRForm({
                        ...data,
                        roleName,
                        leaveTypeTh,
                        historyRequset: data.historyleave || {
                            lastTotalStickDay: 0,
                            totalStickDay: 0,
                            sumStickDay: 0,
                            lastTotalPersonDay: 0,
                            totalPersonDay: 0,
                            sumPersonDay: 0,
                            lastTotalVacationDays: 0,
                            totalVacationDays: 0,
                            sumVacationDays: 0,
                            lastTotalMaternityDaystotal: 0,
                            totalMaternityDaystotal: 0,
                            sumMaternityDaystotal: 0,
                            lastTotalOrdinationDays: 0,
                            totalOrdinationDays: 0,
                            sumOrdinationDays: 0,
                        },
                    });

                    setlastleaveTypeName(leaveTypeTh);
                }, 500); // ✅ รอให้ข้อมูลโหลดครบ
            } else {

                setSelectedHRForm(null);
            }
        } catch (error) {

        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/GetRoles");
            if (response.ok) {
                const data = await response.json();
                setRolesState(data);
            }
        } catch (error) {
        }
    };
    const fetchLeaveTypes = async () => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/GetLeaveTypes");
            if (response.ok) {
                const data = await response.json();
                setLeavetpyeState(data);
                console.log(data)
            }
        } catch (error) {
            console.error("❌ Error fetching leave types:", error);
        }
    };

    // ✅ โหลดฟอร์มที่รอ GM อนุมัติจาก API
    const fetchPendingForms = async () => {
        try {
            const response = await fetch("https://localhost:7039/api/Document/GetPendingFormsForManager");
            if (response.ok) {
                const data = await response.json();
                console.log("📌 ข้อมูลที่ได้จาก API:", data); // ✅ ดูว่ามี historyRequset หรือไม่
                setPendingForms(data);
            } else {
                console.warn("❌ ไม่พบเอกสารที่ต้องอนุมัติ");
                setPendingForms([]);
            }
        } catch (error) {
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

    // ✅ เปิดดูข้อมูลฟอร์ม และแก้ไขได้
    const viewFormDetails = async (form) => {
        try {
            const response = await fetch(`https://localhost:7039/api/Document/GetDocumentWithHistory/${form.documentId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("📌 ข้อมูลจาก API:", data);

                // ✅ กำหนดค่า `lastleaveTypeName` จาก `leavetpyeState`
                let leaveTypeTh = leavetpyeState.find(x => x.leaveTypeid === data.leavedType)?.leaveTypeTh || "ไม่ระบุ";

                setSelectedForm({
                    ...data,
                    historyRequset: data.historyleave || {
                        lastTotalStickDay: 0,
                        totalStickDay: 0,
                        sumStickDay: 0,
                        lastTotalPersonDay: 0,
                        totalPersonDay: 0,
                        sumPersonDay: 0,
                        lastTotalVacationDays: 0,
                        totalVacationDays: 0,
                        sumVacationDays: 0,
                        lastTotalMaternityDaystotal: 0,
                        totalMaternityDaystotal: 0,
                        sumMaternityDaystotal: 0,
                        lastTotalOrdinationDays: 0,
                        totalOrdinationDays: 0,
                        sumOrdinationDays: 0,
                    },
                });

                setlastleaveTypeName(leaveTypeTh); // ✅ อัปเดตค่าชื่อประเภทการลา
            } else {
                setSelectedForm(null);
            }
        } catch (error) {

        }
    };

    // ฟังก์ชันลบฟอร์ม
    const deleteForm = (formId) => {
        const updatedHrForms = hrForms.filter((form) => form.id !== formId);
        setHrForms(updatedHrForms);
        localStorage.setItem("hrForms", JSON.stringify(updatedHrForms));
    };

    // ฟังก์ชันแสดง Modal ยืนยันการลบ
    const confirmDelete = (form) => {
        setSelectedFormToDelete(form);
    };

    // ฟังก์ชันปิด Modal
    const closeDeleteModal = () => {
        setSelectedFormToDelete(null);
    };
    const approveForm = async () => {
        if (!selectedForm) return;

        // ตรวจสอบว่าชื่อ GM ถูกกรอกหรือไม่
        if (!managerName.trim()) {
            setModalState({
                isOpen: true,
                title: "⚠️ กรุณากรอกชื่อก่อนทำการอนุมัติ",
                message: "คุณต้องใส่ชื่อก่อนทำการอนุมัติฟอร์ม",
                type: "error",
            });
            return;
        }

        // ตรวจสอบค่า DocumentID
        if (!selectedForm.documentId || typeof selectedForm.documentId !== "string") {
            setModalState({
                isOpen: true,
                title: "⚠️ ข้อมูลผิดพลาด!",
                message: "DocumentID ของฟอร์มไม่ถูกต้อง กรุณาลองใหม่",
                type: "error",
            });
            return;
        }

        const approvalData = {
            DocumentID: selectedForm.documentId,
            ManagerName: managerName.trim(),
            ManagerComment: managerComment.trim(),
            HRSignature: "", // ✅ ยังไม่ส่งไป HR
        };

        try {
            const response = await fetch("https://localhost:7039/api/Document/ApproveByManager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(approvalData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setModalState({
                    isOpen: true,
                    title: "✅ อนุมัติฟอร์มสำเร็จ!",
                    message: "ฟอร์มใบลาอนุมัติเรียบร้อยแล้ว! แต่ยังไม่ส่งไป HR",
                    type: "success",
                });

                setApprovedForms((prev) => {
                    const updatedForms = [
                        ...prev,
                        {
                            ...selectedForm,
                            approvedDate: new Date().toISOString(),
                            managerName,
                            managerComment,
                        },
                    ];

                    // ✅ บันทึกลง LocalStorage เพื่อให้ข้อมูลไม่หาย
                    localStorage.setItem("approvedForms", JSON.stringify(updatedForms));

                    return updatedForms;
                });

                // เอาฟอร์มออกจากรายการรออนุมัติ
                setPendingForms((prev) =>
                    prev.filter((form) => form.documentId !== selectedForm.documentId)
                );

                setSelectedForm(null);
            } else {
                setModalState({
                    isOpen: true,
                    title: "⚠️ เกิดข้อผิดพลาด!",
                    message: "ไม่สามารถอนุมัติฟอร์มได้ กรุณาลองใหม่อีกครั้ง",
                    type: "error",
                });
            }
        } catch (error) {
            setModalState({
                isOpen: true,
                title: "❌ เกิดข้อผิดพลาด!",
                message: "ไม่สามารถอนุมัติฟอร์มได้ กรุณาลองใหม่อีกครั้ง",
                type: "error",
            });
        }
    };


    // ฟังก์ชันส่งฟอร์มให้ HR
    const sendToHR = (form) => {
        if (!form.userId) {
            setModalState({
                isOpen: true,
                title: "⚠️ ไม่สามารถส่งให้ HR ได้",
                message: "ฟอร์มนี้ไม่มี userId กรุณาตรวจสอบข้อมูลก่อนส่งให้ HR",
                type: "error",
            });
            return;
        }

        // ✅ เพิ่มวันที่ส่งให้ HR
        const updatedForm = {
            ...form,
            sentToHRDate: new Date().toLocaleDateString(),
        };

        // ✅ อัปเดตรายการฟอร์มที่ส่งให้ HR
        const updatedHrForms = [...hrForms, updatedForm];

        // ✅ เอาฟอร์มนี้ออกจากรายการที่ GM เห็น
        const updatedApprovedForms = approvedForms.filter((f) => f.documentId !== form.documentId);

        // ✅ อัปเดต state และ localStorage
        setHrForms(updatedHrForms);
        setApprovedForms(updatedApprovedForms);
        localStorage.setItem("hrForms", JSON.stringify(updatedHrForms));
        localStorage.setItem("approvedForms", JSON.stringify(updatedApprovedForms));

        setModalState({
            isOpen: true,
            title: "📩 ส่งฟอร์มไป HR สำเร็จ!",
            message: "HR จะเห็นฟอร์มนี้แล้ว",
            type: "success",
        });
    };


    // ฟังก์ชันแก้ไขฟอร์ม
    const editApprovedForm = (form) => {
        setSelectedFormForEdit({ ...form }); // ตั้งค่าฟอร์มที่ต้องการแก้ไข
    };
    // ฟังก์ชันบันทึกการแก้ไข
    const saveEditedForm = async () => {
        console.log(selectedFormForEdit)


        if (!selectedFormForEdit) return;

        try {
            const response = await fetch("https://localhost:7039/api/Document/UpdateApprovedForm", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    DocumentID: selectedFormForEdit.documentId,
                    ManagerName: selectedFormForEdit.managerName.trim(),
                    ManagerComment: selectedFormForEdit.managerComment.trim(),
                    HRSignature: "",
                }),
            });

            if (response.ok) {
                setApprovedForms((prev) =>
                    prev.map((form) =>
                        form.documentId === selectedFormForEdit.documentId ? selectedFormForEdit : form
                    )
                );

                // ✅ อัปเดต LocalStorage ด้วยข้อมูลใหม่
                localStorage.setItem("approvedForms", JSON.stringify(approvedForms));

                setSelectedFormForEdit(null); // ปิด Modal

                setModalState({
                    isOpen: true,
                    title: "✅ บันทึกสำเร็จ!",
                    message: "ข้อมูลที่แก้ไขถูกอัปเดตลงฐานข้อมูลแล้ว",
                    type: "success",
                });
            } else {
                throw new Error("ไม่สามารถบันทึกข้อมูลได้");
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setModalState({
                isOpen: true,
                title: "❌ เกิดข้อผิดพลาด!",
                message: "ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่",
                type: "error",
            });
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4 font-FontNoto">ฟอร์มจากพนักงาน</h1>
            {/* ฟอร์มที่รอดำเนินการ */}
            {pendingForms.length > 0 ? (
                <table className="table table-zebra w-full mt-6">
                    <thead>
                        <tr className="text-center bg-blue-100 text-black">
                            <th>#</th>
                            <th className="font-FontNoto">ชื่อพนักงาน</th>
                            <th className="font-FontNoto">วันที่ส่ง</th>
                            <th className="font-FontNoto">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-center text-black">
                        {pendingForms.map((form, index) => (
                            <tr key={form.documentId}>
                                <td className="font-FontNoto">{index + 1}</td>
                                <td className="font-FontNoto">{form.fullname}</td>
                                <td className="font-FontNoto">{formatDate(form.createdate)}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline btn-info font-FontNoto mr-2"
                                        onClick={() => viewFormDetails(form)}
                                    >
                                        👁️ ดูข้อมูล
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่รอดำเนินการ</p>
            )}

            {/* ✅ Modal ดูรายละเอียดฟอร์ม */}
            {selectedForm && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto text-center">รายละเอียดฟอร์ม</h3>

                        <table className="table table-zebra w-full mt-6">
                            <tbody>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '60px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedForm.fullname}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ตำแหน่ง :</strong> {roleName}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {leaveTypeName}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedForm.reason}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}>
                                            <strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {formatDate(selectedForm?.startdate)}
                                        </div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}>
                                            <strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedForm?.enddate)}
                                        </div>

                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedForm.totalleave} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong> {lastleaveTypeName}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}>
                                            <strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {formatDate(selectedForm?.leavedStartdate)}
                                        </div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}>
                                            <strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedForm?.leavedEnddate)}
                                        </div>

                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedForm.totalleaved} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedForm.friendeContact}</div>
                                        <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedForm.contact}</div>
                                    </td>
                                </tr>
                                <tr className="font-FontNoto text-center">
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div className="font-FontNoto text-center">
                                            <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {formatDate(selectedForm?.workingstart)}

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
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.lastTotalStickDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.totalStickDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.sumStickDay ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">กิจส่วนตัว</th>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.lastTotalPersonDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.totalPersonDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.sumPersonDay ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">พักร้อน</th>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.lastTotalVacationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.totalVacationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.sumVacationDays ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">คลอดบุตร</th>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.lastTotalMaternityDaystotal ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.totalMaternityDaystotal ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.sumMaternityDaystotal ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">บวช</th>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.lastTotalOrdinationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.totalOrdinationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedForm.historyRequset?.sumOrdinationDays ?? 0}</td>
                                        </tr>

                                    </thead>
                                </tr>
                            </tbody>
                        </table>

                        {/* ✅ ช่องกรอกข้อมูลอนุมัติก่อนส่ง */}
                        <div className="mt-4">
                            <label className="label">
                                <span className="label-text font-FontNoto">ชื่อ GM :</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full font-FontNoto"
                                value={managerName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTimeout(() => {
                                        const onlyText = value.replace(/[0-9]/g, ""); // ✅ ลบเฉพาะตัวเลข
                                        setManagerName(onlyText);
                                    }, 0); // ✅ ป้องกันปัญหาสระไทยหาย
                                }}

                            />
                            <label className="label mt-2">
                                <span className="label-text font-FontNoto">ความคิดเห็น :</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full font-FontNoto"
                                value={managerComment}
                                onChange={(e) => setManagerComment(e.target.value)}
                            />
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-success font-FontNoto"
                                onClick={approveForm}
                            >
                                ✅ อนุมัติ
                            </button>
                            <button
                                className="btn btn-outline btn-error font-FontNoto"
                                onClick={() => setSelectedForm(null)}
                            >
                                ❌ ปิด
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
            {/* ฟอร์มที่อนุมัติแล้ว */}
            <h2 className="text-xl font-bold mt-8 font-FontNoto">ฟอร์มที่อนุมัติแล้ว</h2>
            {approvedForms.length > 0 ? (
                <table className="table table-zebra w-full text-black">
                    <thead>
                        <tr className="text-black bg-blue-100">
                            <th>#</th>
                            <th className="font-FontNoto">ชื่อพนักงาน</th>
                            <th className="font-FontNoto">วันที่อนุมัติ</th>
                            <th className="font-FontNoto">ลายเซ็นการอนุมัติ</th>
                            <th className="font-FontNoto">ความคิดเห็น</th>
                            <th className="font-FontNoto text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedForms.map((form, index) => (
                            <tr key={form.id || index}>
                                <td className="font-FontNoto">{index + 1}</td>
                                <td className="font-FontNoto">{form.fullname}</td>
                                <td className="font-FontNoto">{formatDate(form.approvedDate)}</td>
                                <td className="font-FontNoto">{form.managerName}</td>
                                <td className="font-FontNoto">{form.managerComment}</td>
                                <td className="flex flex-col gap-2">

                                    <button
                                        className="btn btn-sm btn-outline btn-warning font-FontNoto"
                                        onClick={() => editApprovedForm(form)}
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline btn-secondary font-FontNoto"
                                        onClick={() => viewHRFormDetails(form)}
                                    >
                                        ดูข้อมูล
                                    </button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่อนุมัติ</p>
            )}

            {/* Modal สำหรับการแก้ไขฟอร์ม */}
            {selectedFormForEdit && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto">แก้ไขข้อมูล</h3>
                        <label className="label">
                            <span className="label-text font-FontNoto">ชื่อ GM:</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full font-FontNoto"
                            value={selectedFormForEdit.managerName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setTimeout(() => {
                                    const onlyText = value.replace(/[0-9]/g, ""); // ✅ ลบเฉพาะตัวเลข
                                    setSelectedFormForEdit({ ...selectedFormForEdit, managerName: onlyText });
                                }, 0); // ✅ ป้องกันปัญหาสระไทยหาย
                            }}
                        />

                        <label className="label mt-2">
                            <span className="label-text font-FontNoto">ความคิดเห็น:</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full font-FontNoto"
                            value={selectedFormForEdit.managerComment}
                            onChange={(e) =>
                                setSelectedFormForEdit({ ...selectedFormForEdit, managerComment: e.target.value })
                            }
                        />

                        <div className="modal-action">
                            <button className="btn btn-outline btn-success font-FontNoto" onClick={saveEditedForm}>
                                บันทึกการแก้ไข
                            </button>
                            <button className="btn btn-outline btn-error font-FontNoto" onClick={() => setSelectedFormForEdit(null)}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </dialog>
            )}


            {/* Modal ยืนยันการลบฟอร์ม */}
            {selectedFormToDelete && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto">ยืนยันการลบ</h3>
                        <p className="font-FontNoto">คุณแน่ใจหรือไม่ว่าจะลบฟอร์มนี้?</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-error font-FontNoto"
                                onClick={() => {
                                    deleteForm(selectedFormToDelete.id);
                                    closeDeleteModal();
                                }}
                            >
                                ตกลง
                            </button>
                            <button
                                className="btn btn-outline btn-warning font-FontNoto"
                                onClick={closeDeleteModal}
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
            {modalState.isOpen && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className={`font-bold text-lg font-FontNoto ${modalState.type === "success" ? "text-green-600" : "text-red-600"}`}>
                            {modalState.title}
                        </h3>
                        <p className="py-4 font-FontNoto">{modalState.message}</p>
                        <div className="modal-action">
                            <button className={`btn font-FontNoto ${modalState.type === "success" ? "btn-success" : "btn btn-outline btn-error font-FontNoto"}`}
                                onClick={() => setModalState({ ...modalState, isOpen: false })}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
            {/* Modal ดูรายละเอียดฟอร์มที่ส่งให้ HR */}
            {selectedHRForm && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto text-center">รายละเอียดฟอร์ม</h3>
                        <table className="table table-zebra w-full mt-6">
                            <tbody>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '40px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedHRForm.fullname}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ตำแหน่ง :</strong> {selectedHRForm?.roleName || "ไม่ระบุ"}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {selectedHRForm?.leaveTypeTh || "ไม่ระบุ"}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedHRForm.reason}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {formatDate(selectedHRForm?.startdate)}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedHRForm?.enddate)}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedHRForm.totalleave} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong> {lastleaveTypeName}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {formatDate(selectedHRForm?.leavedStartdate)}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {formatDate(selectedHRForm?.leavedEnddate)}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedHRForm.totalleaved} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedHRForm.friendeContact}</div>
                                        <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedHRForm.contact}</div>
                                    </td>
                                </tr>
                                <tr className="font-FontNoto text-center">
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div className="font-FontNoto text-center">
                                            <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {formatDate(selectedHRForm?.workingstart)}
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
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.lastTotalStickDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.totalStickDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.sumStickDay ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">กิจส่วนตัว</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.lastTotalPersonDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.totalPersonDay ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.sumPersonDay ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">พักร้อน</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.lastTotalVacationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.totalVacationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.sumVacationDays ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">คลอดบุตร</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.lastTotalMaternityDaystotal ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.totalMaternityDaystotal ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.sumMaternityDaystotal ?? 0}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">บวช</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.lastTotalOrdinationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.totalOrdinationDays ?? 0}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.historyRequset?.sumOrdinationDays ?? 0}</td>
                                        </tr>
                                    </thead>
                                </tr>
                            </tbody>
                        </table>

                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-error font-FontNoto"
                                onClick={() => closeHRFormModal(null)}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default ManagerView;
