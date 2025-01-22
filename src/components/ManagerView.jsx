import React, { useEffect, useState } from "react";

const ManagerView = () => {
    const [forms, setForms] = useState([]); // ฟอร์มที่รอดำเนินการ
    const [selectedPendingForm, setSelectedPendingForm] = useState(null); // ฟอร์มที่เลือกจากฟอร์มที่รอดำเนินการ
    const [selectedHRForm, setSelectedHRForm] = useState(null); // ฟอร์มที่เลือกจากฟอร์มที่ส่งให้ HR
    const [managerName, setManagerName] = useState(""); // ชื่อหัวหน้า
    const [managerComment, setManagerComment] = useState(""); // ความคิดเห็นจากหัวหน้า
    const [approvedForms, setApprovedForms] = useState([]); // ฟอร์มที่อนุมัติแล้ว
    const [hrForms, setHrForms] = useState([]); // ฟอร์มที่ส่งให้ HR
    const [selectedFormToDelete, setSelectedFormToDelete] = useState(null); // ฟอร์มที่เลือกจะลบ
    const [isEditing, setIsEditing] = useState(false);
    const closePendingFormModal = () => setSelectedPendingForm(null);
    const closeHRFormModal = () => setSelectedHRForm(null);


    // ตรวจสอบและโหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
    useEffect(() => {
        if (!localStorage.getItem("managerForms")) {
            localStorage.setItem("managerForms", JSON.stringify([]));
        }
        if (!localStorage.getItem("approvedForms")) {
            localStorage.setItem("approvedForms", JSON.stringify([]));
        }
        if (!localStorage.getItem("hrForms")) {
            localStorage.setItem("hrForms", JSON.stringify([]));
        }

        const managerForms = JSON.parse(localStorage.getItem("managerForms")) || [];
        const savedApprovedForms = JSON.parse(localStorage.getItem("approvedForms")) || [];
        const savedHrForms = JSON.parse(localStorage.getItem("hrForms")) || [];
        const savedSelectedForm = JSON.parse(localStorage.getItem("selectedForm"));

        const filteredManagerForms = managerForms.filter((form) =>
            !savedApprovedForms.some((approvedForm) => approvedForm.id === form.id)
        );

        setForms(filteredManagerForms);
        setApprovedForms(savedApprovedForms);
        setHrForms(savedHrForms);
        if (savedSelectedForm) setSelectedPendingForm(savedSelectedForm);
        if (savedSelectedForm) setSelectedHRForm(savedSelectedForm);
    }, []);

    // ฟังก์ชันเพิ่ม id ให้ฟอร์ม (ใช้ Date.now() เพื่อสร้าง id)
    const addIdToForm = (form) => ({
        ...form,
        id: form.id || Date.now(), // สร้าง id ถ้ายังไม่มี
        userId: sessionStorage.getItem("userId"), // เพิ่ม userId จาก sessionStorage
    });
    

    // ฟังก์ชันดูรายละเอียดฟอร์ม
    const viewPendingFormDetails = (form) => {
        setSelectedPendingForm(form);
        setIsEditing(false); // ยกเลิกการแก้ไข
    };

    const viewHRFormDetails = (form) => {
        setSelectedHRForm(form); // สำหรับฟอร์มที่ส่งให้ HR
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
    // ฟังก์ชันอนุมัติฟอร์ม
    const approveForm = (form) => {
        if (!managerName) {
            alert("กรุณากรอกชื่อหัวหน้า!");
            return;
        }

        const updatedForm = addIdToForm({
            ...form,
            managerName,
            managerComment,
            approvedDate: new Date().toLocaleDateString(),
        });

        const updatedApprovedForms = [...approvedForms, updatedForm];
        const updatedManagerForms = forms.filter((f) => f.id !== form.id);

        setApprovedForms(updatedApprovedForms);
        setForms(updatedManagerForms);

        localStorage.setItem("approvedForms", JSON.stringify(updatedApprovedForms));
        localStorage.setItem("managerForms", JSON.stringify(updatedManagerForms));

        setSelectedPendingForm(null);
        setManagerComment("");
        setManagerName("");
    };

    // ฟังก์ชันส่งฟอร์มให้ HR
    const sendToHR = (form) => {
        if (!form.userId) {
            alert("ฟอร์มนี้ไม่มี userId กรุณาตรวจสอบข้อมูลก่อนส่งให้ HR");
            return;
        }
    
        const updatedForm = {
            ...form,
            sentToHRDate: new Date().toLocaleDateString(),
        };
    
        const updatedHrForms = [...hrForms, updatedForm];
        const updatedApprovedForms = approvedForms.filter((f) => f.id !== form.id);
    
        setHrForms(updatedHrForms);
        setApprovedForms(updatedApprovedForms);
    
        localStorage.setItem("hrForms", JSON.stringify(updatedHrForms));
        localStorage.setItem("approvedForms", JSON.stringify(updatedApprovedForms));
    };    
    
    // ฟังก์ชันแก้ไขฟอร์ม
    const editApprovedForm = (form) => {
        setSelectedPendingForm(form);
        setIsEditing(true); // เปิดโหมดแก้ไข
    };

    // ฟังก์ชันบันทึกการแก้ไข
    const saveEditedForm = (editedForm) => {
        const updatedForms = approvedForms.map((form) =>
            form.id === editedForm.id ? editedForm : form
        );
        setApprovedForms(updatedForms);
        localStorage.setItem("approvedForms", JSON.stringify(updatedForms));
        setSelectedPendingForm(null); // ปิด Modal
    };
    // ฟังก์ชันสำหรับตรวจสอบการพิมพ์ว่าเป็นภาษาไทยหรือไม่
    const handleKeyDown = (e) => {
        const key = e.key;
        // เช็คว่าเป็นตัวอักษรภาษาไทยหรือไม่
        const thaiRegex = /^[ก-๙\s]+$/;
        // ถ้ากดปุ่มที่ไม่ใช่ภาษาไทยหรือไม่ใช่การลบ (Backspace หรือ Delete) ก็จะป้องกันการพิมพ์
        if (key && !thaiRegex.test(key) && key !== 'Backspace' && key !== 'Delete') {
            e.preventDefault();
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4 font-FontNoto">ฟอร์มจากพนักงาน</h1>
            {/* ฟอร์มที่รอดำเนินการ */}
            {forms.length > 0 ? (
                <table className="table table-zebra w-full mt-6">
                    <thead>
                        <tr className="text-center bg-blue-100 text-black">
                            <th>#</th>
                            <th className="font-FontNoto">ชื่อพนักงาน</th>
                            <th className="font-FontNoto">วันที่ส่ง</th>
                            <th className="font-FontNoto">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody className="text-center text-black">
                        {forms.map((form, index) => (
                            <tr key={form.id || index}>
                                <td className="font-FontNoto">{index + 1}</td>
                                <td className="font-FontNoto">{form.department}</td>
                                <td className="font-FontNoto">{form.date}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline btn-success font-FontNoto"
                                        onClick={() => viewPendingFormDetails(form)}
                                    >
                                        เซ็นชื่ออนุมัติ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่รอดำเนินการ</p>
            )}

            {/* Modal ดูรายละเอียดฟอร์มที่รอดำเนินการ */}
            {selectedPendingForm && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto text-center">รายละเอียดฟอร์ม</h3>
                        <table className="table table-zebra w-full mt-6">
                            <tbody>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '40px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedPendingForm.department}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ตำแหน่ง :</strong> {selectedPendingForm.position}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {selectedPendingForm.leaveType}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedPendingForm.reason}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {selectedPendingForm.fromDate}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedPendingForm.toDate}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedPendingForm.totalDays} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong> {selectedPendingForm.leT}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {selectedPendingForm.fromd}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedPendingForm.tod}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedPendingForm.totald} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedPendingForm.contact}</div>
                                        <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedPendingForm.phone}</div>
                                    </td>
                                </tr>
                                <tr className="font-FontNoto text-center">
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div className="font-FontNoto text-center">
                                            <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {selectedPendingForm.tt}
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
                                            <td className="font-FontNoto text-center">{selectedPendingForm.sickDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.sickDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.sickDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">กิจส่วนตัว</th>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.personalDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.personalDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.personalDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">พักร้อน</th>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.vacationDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.vacationDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.vacationDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">คลอดบุตร</th>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.maternityDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.maternityDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.maternityDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">บวช</th>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.ordinationDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.ordinationDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedPendingForm.ordinationDaysTotal}</td>
                                        </tr>
                                    </thead>
                                </tr>
                            </tbody>
                        </table>

                        {/* ฟอร์มกรอกข้อมูลอนุมัติ */}
                        <div className="mt-4">
                            <label className="label">
                                <span className="label-text font-FontNoto">ชื่อผู้จัดการทั่วไป :</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full font-FontNoto"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                onKeyDown={handleKeyDown} // ใช้ onKeyDown เพื่อตรวจสอบการพิมพ์
                            />
                            <label className="label mt-2">
                                <span className="label-text font-FontNoto">ความคิดเห็น :</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full font-FontNoto"
                                value={managerComment}
                                onChange={(e) => setManagerComment(e.target.value)}
                                onKeyDown={handleKeyDown} // ใช้ onKeyDown เพื่อตรวจสอบการพิมพ์
                            />
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-success font-FontNoto"
                                onClick={() => approveForm(selectedPendingForm)}
                            >
                                อนุมัติ
                            </button>
                            <button
                                className="btn btn-outline btn-error font-FontNoto"
                                onClick={() => setSelectedPendingForm(null)}
                            >
                                ปิด
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
                                <td className="font-FontNoto">{form.department}</td>
                                <td className="font-FontNoto">{form.approvedDate}</td>
                                <td className="font-FontNoto">{form.managerName}</td>
                                <td className="font-FontNoto">{form.managerComment}</td>
                                <td className="flex flex-col gap-2">
                                    <button
                                        className="btn btn-sm btn-outline btn-primary font-FontNoto"
                                        onClick={() => sendToHR(form)}
                                    >
                                        ส่งให้ HR
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline btn-warning font-FontNoto"
                                        onClick={() => editApprovedForm(form)}
                                    >
                                        แก้ไข
                                    </button>
                                   {/* <button
                                        className="btn btn-sm btn-outline btn-error font-FontNoto"
                                        onClick={() => setSelectedFormToDelete(form)}
                                    >
                                        ลบ
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่อนุมัติ</p>
            )}

            {/* Modal สำหรับการแก้ไขฟอร์ม */}
            {selectedPendingForm && isEditing && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-3 font-FontNoto">แก้ไขข้อมูล</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                saveEditedForm(selectedPendingForm);
                            }}
                        >
                            {/* ฟอร์มแก้ไขข้อมูล */}
                            <label className="label">
                                <span className="label-text font-FontNoto">ความคิดเห็น :</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full font-FontNoto"
                                value={selectedPendingForm.managerComment}
                                onChange={(e) =>
                                    setSelectedPendingForm({
                                        ...selectedPendingForm,
                                        managerComment: e.target.value,
                                    })
                                }
                            />
                            <div className="mb-3"></div>
                            <label className="label">
                                <span className="label-text font-FontNoto">ชื่อผู้จัดการทั่วไป :</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full font-FontNoto"
                                value={selectedPendingForm.managerName}
                                onChange={(e) =>
                                    setSelectedPendingForm({
                                        ...selectedPendingForm,
                                        managerName: e.target.value,
                                    })
                                }
                            />
                            <div className="modal-action">
                                <button className="btn btn-outline btn-success font-FontNoto" type="submit">
                                    บันทึกการแก้ไข
                                </button>
                                <button
                                    className="btn btn-outline btn-error font-FontNoto"
                                    onClick={() => setSelectedPendingForm(null)}
                                >
                                    ปิด
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
            <h2 className="text-xl font-bold mt-8 font-FontNoto">ฟอร์มที่ส่งให้ HR</h2>
            {hrForms.length > 0 ? (
                <table className="table table-zebra mt-6">
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
                        {hrForms.map((form, index) => (
                            <tr key={form.id || index}>
                                <td className="font-FontNoto">{index + 1}</td>
                                <td className="font-FontNoto">{form.department}</td>
                                <td className="font-FontNoto">{form.approvedDate}</td>
                                <td className="font-FontNoto">{form.managerName}</td>
                                <td className="font-FontNoto">{form.managerComment}</td>
                                <td className="flex justify-center items-center gap-2 text-center">
                                    {/* ปุ่มดูข้อมูล และ ปุ่มลบ */}
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
                <p className="font-FontNoto text-center">ยังไม่มีฟอร์มที่ส่งให้ HR</p>
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

            {/* Modal ดูรายละเอียดฟอร์มที่ส่งให้ HR */}
            {selectedHRForm && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg font-FontNoto text-center">รายละเอียดฟอร์ม</h3>
                        <table className="table table-zebra w-full mt-6">
                            <tbody>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '40px' }}><strong className="font-FontNoto">ชื่อ :</strong> {selectedHRForm.department}</div>
                                        <div><strong>ตำแหน่ง :</strong> {selectedHRForm.position}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '100px' }}><strong className="font-FontNoto">ขอลา :</strong> {selectedHRForm.leaveType}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">เนื่องจาก :</strong> {selectedHRForm.reason}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ตั้งแต่วันที่ :</strong> {selectedHRForm.fromDate}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedHRForm.toDate}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedHRForm.totalDays} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">ข้าพเจ้าได้ลา :</strong> {selectedHRForm.leT}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '25px' }}><strong className="font-FontNoto">ครั้งสุดท้าย:</strong> {selectedHRForm.fromd}</div>
                                        <div className="font-FontNoto" style={{ marginRight: '20px' }}><strong className="font-FontNoto">ถึงวันที่ :</strong> {selectedHRForm.tod}</div>
                                        <div className="font-FontNoto"><strong className="font-FontNoto">กำหนด :</strong> {selectedHRForm.totald} วัน </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ display: 'flex' }}>
                                        <div className="font-FontNoto" style={{ marginRight: '50px' }}><strong className="font-FontNoto">ระหว่างลา ติดต่อได้ที่:</strong> {selectedHRForm.contact}</div>
                                        <div><strong className="font-FontNoto">เบอร์ติดต่อ :</strong> {selectedHRForm.phone}</div>
                                    </td>
                                </tr>
                                <tr className="font-FontNoto text-center">
                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div className="font-FontNoto text-center">
                                            <strong className="font-FontNoto text-center">สถิติการลาในปีนี้ วันเริ่มงาน:</strong> {selectedHRForm.tt}
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
                                            <td className="font-FontNoto text-center">{selectedHRForm.sickDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.sickDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.sickDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">กิจส่วนตัว</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.personalDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.personalDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.personalDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">พักร้อน</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.vacationDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.vacationDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.vacationDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">คลอดบุตร</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.maternityDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.maternityDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.maternityDaysTotal}</td>
                                        </tr>
                                        <tr>
                                            <th className="font-FontNoto">บวช</th>
                                            <td className="font-FontNoto text-center">{selectedHRForm.ordinationDaysUsed}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.ordinationDaysCurrent}</td>
                                            <td className="font-FontNoto text-center">{selectedHRForm.ordinationDaysTotal}</td>
                                        </tr>
                                    </thead>
                                </tr>
                            </tbody>
                        </table>

                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-error"
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
