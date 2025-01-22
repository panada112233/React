import React, { useState, useEffect } from "react";

const HRView = () => {
    const [approvedForms, setApprovedForms] = useState([]); // ฟอร์มที่หัวหน้าอนุมัติ
    const [hrApprovedForms, setHrApprovedForms] = useState([]); // ฟอร์มที่ HR เซ็นชื่ออนุมัติ
    const [sentToEmployeesForms, setSentToEmployeesForms] = useState([]); // ฟอร์มที่ส่งให้พนักงาน
    const [hrForms, setHrForms] = useState([]);
    const [formToApprove, setFormToApprove] = useState(null);
    const [selectedHRForm, setSelectedHRForm] = useState(null); // ฟอร์ม HR ที่เลือกดู
    const [selectedFormToDelete, setSelectedFormToDelete] = useState(null); // ฟอร์มที่เลือกเพื่อลบ
    const [hrName, setHrName] = useState(""); // เพิ่ม state สำหรับชื่อ HR
    const [selectedFormForEdit, setSelectedFormForEdit] = useState(null); // ฟอร์มที่เลือกแก้ไข
    const [selectedFormForDelete, setSelectedFormForDelete] = useState(null); // ฟอร์มที่เลือกเพื่อลบ
    const [selectedFormForDetails, setSelectedFormForDetails] = useState(null); // ฟอร์มที่เลือกดูรายละเอียด
    const currentUserRole = sessionStorage.getItem("role");

    // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
    const loadLocalStorageData = () => {
        const savedForms = {
            hrForms: JSON.parse(localStorage.getItem("hrForms")) || [],
            hrApprovedForms: JSON.parse(localStorage.getItem("hrApprovedForms")) || [],
            sentToEmployeesForms: JSON.parse(localStorage.getItem("sentToEmployeesForms")) || [],
        };

        console.log("All HR Forms in localStorage:", savedForms.hrForms);
        console.log("Approved HR Forms in localStorage:", savedForms.hrApprovedForms);

        // Set all forms for HR without filtering
        setHrForms(savedForms.hrForms);
        setHrApprovedForms(savedForms.hrApprovedForms);
        setSentToEmployeesForms(savedForms.sentToEmployeesForms);
    };

    useEffect(() => {
        loadLocalStorageData();
    }, []);

    const handleApprove = () => {
        if (!/^[ก-๙\s]+$/.test(hrName)) {
            alert("กรุณากรอกชื่อ HR เป็นภาษาไทย!");
            return;
        }

        const updatedForm = {
            ...formToApprove,
            hrApprovedDate: new Date().toLocaleDateString(),
            hrSignature: hrName,
        };

        // เพิ่มฟอร์มที่เซ็นชื่อแล้วใน hrApprovedForms
        const updatedApprovedForms = [...hrApprovedForms, updatedForm];
        const remainingHrForms = hrForms.filter((f) => f.id !== formToApprove.id);

        setHrApprovedForms(updatedApprovedForms);
        setHrForms(remainingHrForms); // เอาฟอร์มออกจาก hrForms

        // บันทึกข้อมูลลง localStorage
        localStorage.setItem("hrApprovedForms", JSON.stringify(updatedApprovedForms));
        localStorage.setItem("hrForms", JSON.stringify(remainingHrForms));

        // alert(`ฟอร์มของ ${formToApprove.department} ได้รับการเซ็นชื่อแล้ว`);
        setFormToApprove(null); // ปิด Modal
        setHrName(""); // ล้างค่าชื่อ HR
    };

    const sendDocumentToEmployee = (form) => {
        const userIdFromSession = sessionStorage.getItem("userId");  // ดึง userId จาก sessionStorage
        const userIdFromForm = form.userId;  // userId จากฟอร์ม
    
        // ตรวจสอบว่า userId ตรงกันหรือไม่
        if (userIdFromSession !== userIdFromForm) {
            console.error("UserId mismatch, expected userId is:", userIdFromSession, "but received:", userIdFromForm);
            return;  // ถ้าไม่ตรงให้หยุดการทำงาน
        }
    
        // โหลดเอกสารที่ส่งให้พนักงานจาก localStorage
        const savedDocuments = JSON.parse(localStorage.getItem("sentToEmployeesForms")) || [];
        
        // กรองเอกสารเก่าที่มี userId ซ้ำออก และเพิ่มเอกสารใหม่ที่ส่งให้พนักงาน
        const updatedDocuments = [
            ...savedDocuments.filter(doc => doc.userId !== userIdFromForm),  // ลบเอกสารที่มี userId ซ้ำ
            { ...form, userId: userIdFromForm }  // เก็บ userId ของพนักงานที่ถูกต้อง
        ];
    
        // อัปเดต localStorage เพื่อเก็บเอกสารของพนักงาน
        localStorage.setItem("sentToEmployeesForms", JSON.stringify(updatedDocuments));
    
        // อัปเดต state สำหรับการส่งฟอร์มให้พนักงาน
        setSentToEmployeesForms(updatedDocuments);
    
        console.log(`Document successfully sent to employee with ID: ${userIdFromForm}`);
    };
        
    // ฟังก์ชันแปลงฟอร์มเป็น PDF และดาวน์โหลด
    const downloadPDF = (form) => {
        const content = `ฟอร์มพนักงาน\n\nชื่อพนักงาน: ${form.department}\nตำแหน่ง: ${form.position}\nวันที่ลา: ${form.fromDate} ถึง ${form.toDate}\nความคิดเห็นหัวหน้า: ${form.managerComment}\nความคิดเห็น HR: ${form.hrComment || ""}`;
        const blob = new Blob([content], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `form_${form.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ฟังก์ชันปิด Modal ดูรายละเอียดฟอร์ม
    const closeHRFormModal = () => {
        setSelectedHRForm(null);
    };


    // ฟังก์ชันลบฟอร์ม
    const deleteForm = (id) => {
        const updatedForms = hrApprovedForms.filter((form) => form.id !== id);
        setHrApprovedForms(updatedForms);
        localStorage.setItem("hrApprovedForms", JSON.stringify(updatedForms));
    };

    // ฟังก์ชันปิด Modal ลบฟอร์ม
    const closeDeleteModal = () => {
        setSelectedFormToDelete(null);
    };
    // เพิ่มฟังก์ชันลบฟอร์มที่ส่งให้พนักงาน
    const deleteEmployeeForm = (formId) => {
        const updatedForms = sentToEmployeesForms.filter((form) => form.id !== formId);
        setSentToEmployeesForms(updatedForms);
        localStorage.setItem("sentToEmployeesForms", JSON.stringify(updatedForms));
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
                                    <td className="font-FontNoto">{form.department}</td>
                                    <td className="font-FontNoto">{form.approvedDate}</td>
                                    <td className="font-FontNoto">{form.managerName}</td>
                                    <td className="font-FontNoto">{form.managerComment}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline btn-info ml-2 font-FontNoto"
                                            onClick={() => setSelectedFormForDetails(form)} // เปิด Modal ดูรายละเอียด
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
                            <p className="font-FontNoto">คุณกำลัง อนุมัติฟอร์มของ : {formToApprove.department}</p>
                            <div className="mt-4">
                                <label className="label">
                                    <span className="label-text font-FontNoto">ชื่อ ทรัพยากรบุคคล :</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full font-FontNoto"
                                    value={hrName}
                                    onChange={(e) => setHrName(e.target.value)}
                                    onKeyDown={(e) => {
                                        const key = e.key;
                                        // ตรวจสอบเฉพาะตัวอักษรภาษาไทยและปุ่ม Backspace/Delete
                                        const thaiRegex = /^[ก-๙\s]+$/;
                                        if (!thaiRegex.test(key) && key !== "Backspace" && key !== "Delete") {
                                            e.preventDefault();
                                        }
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
                                <th className="font-FontNoto text-center">วันที่ HR อนุมัติ</th>
                                <th className="font-FontNoto text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hrApprovedForms.map((form, index) => (
                                <tr key={`${form.id}-${index}`}>  {/* ใช้ combination ของ `form.id` และ `index` เพื่อให้ key เป็นเอกลักษณ์ */}
                                    <td className="font-FontNoto">{index + 1}</td>
                                    <td className="font-FontNoto text-center">{form.department}</td>
                                    <td className="font-FontNoto text-center">{form.hrApprovedDate}</td>
                                    <td className="font-FontNoto text-center">
                                        <button
                                            className="btn btn-sm btn-outline btn-primary"
                                            onClick={() => sendDocumentToEmployee(form)} // เรียกใช้ฟังก์ชันเมื่อกดปุ่ม
                                        >
                                            ส่งให้พนักงาน
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline btn-warning ml-2"
                                            onClick={() => setSelectedFormForEdit(form)} // เปิด Modal แก้ไข
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline btn-error ml-2"
                                            onClick={() => setSelectedFormForDelete(form)} // เปิด Modal ยืนยันการลบ
                                        >
                                            ลบ
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
                                    onChange={(e) =>
                                        setSelectedFormForEdit({
                                            ...selectedFormForEdit,
                                            hrSignature: e.target.value, // อัปเดตชื่อ HR
                                        })
                                    }
                                />
                            </div>
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-success font-FontNoto"
                                    onClick={() => {
                                        const updatedForms = hrApprovedForms.map((f) =>
                                            f.id === selectedFormForEdit.id ? selectedFormForEdit : f
                                        );
                                        setHrApprovedForms(updatedForms);
                                        localStorage.setItem(
                                            "hrApprovedForms",
                                            JSON.stringify(updatedForms)
                                        );
                                        setSelectedFormForEdit(null); // ปิด Modal
                                    }}
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
                {selectedFormForDelete && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto">ยืนยันการลบ</h3>
                            <p className="font-FontNoto">คุณแน่ใจหรือไม่ว่าจะลบฟอร์มนี้ ?</p>
                            <div className="modal-action font-FontNoto">
                                <button
                                    className="btn btn-outline btn-error"
                                    onClick={() => {
                                        const updatedForms = hrApprovedForms.filter(
                                            (f) => f.id !== selectedFormForDelete.id
                                        );
                                        setHrApprovedForms(updatedForms);
                                        localStorage.setItem(
                                            "hrApprovedForms",
                                            JSON.stringify(updatedForms)
                                        );
                                        setSelectedFormForDelete(null); // ปิด Modal
                                    }}
                                >
                                    ลบ
                                </button>
                                <button
                                    className="btn btn-outline btn-warning"
                                    onClick={() => setSelectedFormForDelete(null)} // ปิด Modal
                                >
                                    ยกเลิก
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
                                            <div className="font-FontNoto" style={{ marginRight: '40px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedFormForDetails.department}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">ตำแหน่ง :</strong> {selectedFormForDetails.position}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {selectedFormForDetails.leaveType}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedFormForDetails.reason}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {selectedFormForDetails.fromDate}</div>
                                            <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedFormForDetails.toDate}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedFormForDetails.totalDays} วัน </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong> {selectedFormForDetails.leT}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {selectedFormForDetails.fromd}</div>
                                            <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedFormForDetails.tod}</div>
                                            <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedFormForDetails.totald} วัน </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ display: 'flex' }}>
                                            <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedFormForDetails.contact}</div>
                                            <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedFormForDetails.phone}</div>
                                        </td>
                                    </tr>
                                    <tr className="font-FontNoto text-center">
                                        <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <div className="font-FontNoto text-center">
                                                <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {selectedFormForDetails.tt}
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
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.sickDaysUsed}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.sickDaysCurrent}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.sickDaysTotal}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">กิจส่วนตัว</th>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.personalDaysUsed}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.personalDaysCurrent}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.personalDaysTotal}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">พักร้อน</th>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.vacationDaysUsed}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.vacationDaysCurrent}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.vacationDaysTotal}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">คลอดบุตร</th>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.maternityDaysUsed}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.maternityDaysCurrent}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.maternityDaysTotal}</td>
                                            </tr>
                                            <tr>
                                                <th className="font-FontNoto">บวช</th>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.ordinationDaysUsed}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.ordinationDaysCurrent}</td>
                                                <td className="font-FontNoto text-center">{selectedFormForDetails.ordinationDaysTotal}</td>
                                            </tr>
                                        </thead>
                                    </tr>
                                </tbody>
                            </table>
                            {/* เพิ่มข้อมูลเพิ่มเติมตามที่คุณต้องการ */}
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-error"
                                    onClick={() => setSelectedFormForDetails(null)} // ปิด Modal
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </dialog>
                )}

            </section>

            {/* ฟอร์มที่ส่งให้พนักงาน */}
            <section className="mt-8">
                <h2 className="text-lg font-bold mb-2 font-FontNoto">ฟอร์มที่ส่งให้พนักงาน</h2>
                {sentToEmployeesForms.length > 0 ? (
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th className="font-FontNoto">ชื่อพนักงาน</th>
                                <th className="font-FontNoto">วันที่ HR อนุมัติ</th>
                                <th className="font-FontNoto">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sentToEmployeesForms.map((form, index) => (
                                <tr key={form.id}>
                                    <td className="font-FontNoto">{index + 1}</td>
                                    <td className="font-FontNoto">{form.department}</td>
                                    <td className="font-FontNoto">{form.hrApprovedDate}</td>
                                    <td className="font-FontNoto">
                                        <button
                                            className="btn btn-sm btn-outline btn-secondary"
                                            onClick={() => downloadPDF(form)}
                                        >
                                            ดาวน์โหลด PDF
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline btn-error ml-2"
                                            onClick={() => deleteEmployeeForm(form.id)}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่ส่งให้พนักงาน</p>
                )}
            </section>

            {/* Modal ยืนยันการลบฟอร์ม */}
            {selectedFormToDelete && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">ยืนยันการลบ</h3>
                        <p>คุณแน่ใจหรือไม่ว่าจะลบฟอร์มนี้?</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-error"
                                onClick={() => {
                                    deleteForm(selectedFormToDelete.id);
                                    closeDeleteModal();
                                }}
                            >
                                ยืนยัน
                            </button>
                            <button
                                className="btn btn-outline btn-warning"
                                onClick={closeDeleteModal}
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal ดูรายละเอียดฟอร์มที่ส่งให้ HR */}
            {selectedHRForm && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">รายละเอียดฟอร์ม</h3>
                        <p><strong>ชื่อพนักงาน:</strong> {selectedHRForm.department}</p>
                        <p><strong>ตำแหน่ง:</strong> {selectedHRForm.position}</p>
                        <p><strong>ประเภทการลา:</strong> {selectedHRForm.leaveType}</p>
                        <p><strong>เหตุผล:</strong> {selectedHRForm.reason}</p>
                        <p><strong>วันที่ลา:</strong> {selectedHRForm.fromDate} ถึง {selectedHRForm.toDate}</p>
                        <p><strong>จำนวนวันลา:</strong> {selectedHRForm.totalDays} วัน</p>
                        <p><strong>ติดต่อ:</strong> {selectedHRForm.contact} ({selectedHRForm.phone})</p>

                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-error"
                                onClick={closeHRFormModal}
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

export default HRView;
