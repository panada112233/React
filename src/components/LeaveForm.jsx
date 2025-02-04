import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { pdfMake, font } from "../libs/pdfmake";

const LeaveForm = () => {

    const userId = sessionStorage.getItem("userId");
    const [formData, setFormData] = useState({
        userid: userId,
        leaveTypeId: "",
        createdate: "",
        fullname: "",
        rolesid: "",
        reason: "",
        startdate: "",
        enddate: "",
        totalleave: 0,
        leavedType: "",
        leaved_startdate: "",
        leaved_enddate: "",
        totalleaved: 0,
        friendeContact: "",
        contact: "",
        workingstart: "",
        approvedDate: "",
        hrApprovedDate: "",
        sentToHRDate: "",
        hrSignature: "",
        managerName: "",
        managerComment: "",
    });

    const [savedForms, setSavedForms] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");

    const [leavetpyeState, setleavetpyeState] = useState([]);
    const [rolesState, setrolesState] = useState([]);
    const leaveTypeName = leavetpyeState.find(item => item.leaveTypeid === formData.leaveTypeId)?.leaveTypeTh || "ไม่ระบุ";
    const roleName = rolesState.find(item => item.rolesid === formData.rolesid)?.rolesname || "ไม่ระบุ";
    const leavedTypeName = leavetpyeState.find(item => item.leaveTypeid === formData.leavedType)?.leaveTypeTh || "ไม่ระบุ";

    useEffect(() => {
        if (userId) {
            fetchSavedForms();
            fetchLeaveType();
            fetchRoles();
        }
    }, [userId]);
    const fetchLeaveType = async () => {

        try {
            const response = await fetch(`https://localhost:7039/api/Document/GetLeaveTypes`);
            if (response.ok) {
                const data = await response.json();

                setleavetpyeState(data)
            } else {
                console.warn("ไม่พบฟอร์มที่บันทึก");

            }
        } catch (error) {
            console.error("Error fetching saved forms:", error);
        }
    }
    const fetchRoles = async () => {

        try {
            const response = await fetch(`https://localhost:7039/api/Document/GetRoles`);
            if (response.ok) {
                const data = await response.json();
                setrolesState(data)
            } else {
                console.warn("ไม่พบฟอร์มที่บันทึก");

            }
        } catch (error) {
            console.error("Error fetching saved forms:", error);
        }
    }
    const handleChange = (e) => {

        const { name, value } = e.target;
        // console.log(value)
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // ✅ โหลดข้อมูลที่บันทึกไว้จาก Local Storage เมื่อเปิดหน้า
    useEffect(() => {
        const storedForms = localStorage.getItem("savedForms");
        if (storedForms) {
            setSavedForms(JSON.parse(storedForms));
        }
    }, []);

    // ✅ อัปเดต Local Storage ทุกครั้งที่ savedForms เปลี่ยนแปลง
    useEffect(() => {
        localStorage.setItem("savedForms", JSON.stringify(savedForms));
    }, [savedForms]);

    const fetchSavedForms = async () => {
        if (!userId) {
            alert("ไม่สามารถดึงข้อมูลฟอร์มได้ กรุณาลองเข้าสู่ระบบใหม่");
            return;
        }

        try {
            const response = await fetch(`https://localhost:7039/api/Document/GetDocumentsByUser/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSavedForms(data);
            } else {
                console.warn("ไม่พบฟอร์มที่บันทึก");
                setSavedForms([]); // ตั้งค่าเป็นอาร์เรย์ว่างถ้าไม่มีข้อมูล
            }
        } catch (error) {
            console.error("Error fetching saved forms:", error);
        }
    };
    const handleSaveForm = () => {
        if (!formData.fullname || !formData.leaveTypeId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        const newForm = {
            ...formData,
            id: Date.now(),
        };

        const updatedForms = [...savedForms, newForm];
        setSavedForms(updatedForms);
        localStorage.setItem("savedForms", JSON.stringify(updatedForms));

        // รีเซ็ตฟอร์ม
        setFormData({
            userid: userId,
            leaveTypeId: "",
            createdate: "",
            fullname: "",
            rolesid: "",
            reason: "",
            startdate: "",
            enddate: "",
            totalleave: 0,
            leavedType: "",
            leaved_startdate: "",
            leaved_enddate: "",
            totalleaved: 0,
            friendeContact: "",
            contact: "",
            workingstart: "",
            approvedDate: "",
            hrApprovedDate: "",
            sentToHRDate: "",
            hrSignature: "",
            managerName: "",
            managerComment: "",
        });

        // แสดง Notification ว่าบันทึกสำเร็จ
        setNotificationMessage("บันทึกฟอร์มเรียบร้อยแล้ว");
        setNotificationModalOpen(true);
    };

    const handleViewForm = (form) => {
        setFormData(form);
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการโหลดหน้าใหม่

        try {
            if (!userId) {
                alert("ไม่สามารถระบุพนักงานได้ กรุณาลองเข้าสู่ระบบใหม่");
                return;
            }

            const response = await fetch("https://localhost:7039/api/Document/SubmitForm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ UserID: userId, ...formData })
            });

            if (response.ok) {
                setNotificationMessage("✅ ส่งฟอร์มไปยังผู้จัดการทั่วไปสำเร็จ!");
                setNotificationModalOpen(true);
                setFormData({ ...formData, status: "submitted" }); // อัปเดตสถานะฟอร์ม
            } else {
                alert("เกิดข้อผิดพลาดในการส่งฟอร์ม");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("เกิดข้อผิดพลาดในการส่งฟอร์ม");
        }
    };


    const handleSubmitToGM = async (form) => {
        if (!form || !form.ID) {
            alert("ไม่พบฟอร์มที่ต้องการส่ง กรุณาลองใหม่");
            return;
        }

        const approvalData = {
            DocumentID: form.ID,
            ManagerName: "GM ชื่อจริง",  // แก้เป็นชื่อจริงของ GM
            ManagerComment: "อนุมัติการลา",
        };

        try {
            const response = await fetch("https://localhost:7039/api/Document/ApproveByManager", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(approvalData),
            });

            if (response.ok) {
                alert("ส่งฟอร์มไปยัง GM สำเร็จ!");
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                alert("เกิดข้อผิดพลาด: " + errorText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("เกิดข้อผิดพลาดในการส่งฟอร์ม");
        }
    };

    const sendFrom = async () => {
        const confirmSend = window.confirm("📢 คุณต้องการส่งฟอร์มนี้ไปยังหัวหน้าจริงหรือไม่?");
        if (!confirmSend) return;

        try {
            console.log("กำลังส่งฟอร์ม:", formData);

            const response = await fetch("https://localhost:7039/api/Document/CreateDocument", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("📌 บันทึกฟอร์มลงฐานข้อมูลสำเร็จ:", result);

                setNotificationMessage("✅ ฟอร์มถูกส่งไปยังหัวหน้าสำเร็จ!");
                setNotificationModalOpen(true);
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                alert("❌ เกิดข้อผิดพลาด: " + errorText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ เกิดข้อผิดพลาดในการส่งฟอร์ม");
        }
    };

    const handleDeleteForm = (formId) => {
        const updatedForms = savedForms.filter((form) => form.id !== formId);
        setSavedForms(updatedForms);
        localStorage.setItem("savedForms", JSON.stringify(updatedForms));
    };

    const handleGeneratePDF = () => {
        // Helper function สำหรับแปลงวันที่เป็นรูปแบบ DD/MM/YYYY
        const formatDate = (date) => {
            if (!date) return "-"; // ถ้าไม่มีวันที่ให้แสดง "-"
            const options = { year: "numeric", month: "2-digit", day: "2-digit" };
            return new Intl.DateTimeFormat("th-TH", options).format(new Date(date));
        };

        const docDefinition = {
            content: [
                { text: "แบบฟอร์มใบลา", style: "header" },
                {
                    text: `วันที่ : ${formatDate(formData.createdate)}`,
                    margin: [0, 10, 0, 10],
                    alignment: 'right' // ทำให้ข้อความชิดขวา
                },
                { text: `เรื่อง : ขออนุญาติลา : ${leaveTypeName}`, margin: [0, 10, 0, 10] },
                { text: `เรียน หัวหน้าแผนก/ฝ่ายบุคคล`, margin: [0, 10, 0, 10] },
                {
                    table: {
                        widths: ["auto", "*"],
                        body: [
                            ["ข้าพเจ้า :", `${formData.fullname || "-"} แผนก ${roleName}`],
                            ["ขอลา :", `${leaveTypeName} เนื่องจาก ${formData.reason || "-"}`],
                            [
                                "ตั้งแต่วันที่ :",
                                `${formatDate(formData.startdate)} ถึงวันที่ : ${formatDate(formData.enddate)} รวม : ${formData.totalleave || "0"} วัน`
                            ],
                            [
                                "ข้าพเจ้าได้ลา :",
                                `${leavedTypeName} ครั้งสุดท้าย ตั้งแต่วันที่ : ${formatDate(formData.leaved_startdate)} ถึงวันที่ : ${formatDate(formData.leaved_enddate)} รวม ${formData.totalleaved || "0"} วัน`
                            ],
                        ],
                    },
                    layout: "noBorders",
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        widths: ["auto", "*"],
                        body: [
                            [
                                "ในระหว่างลา ติดต่อข้าพเจ้าได้ที่ :",
                                `${formData.friendeContact || "-"}, เบอร์ติดต่อ ${formData.contact || "-"}`
                            ],
                        ],
                    },
                    layout: "noBorders",
                    margin: [0, 0, 0, 20],
                },
                {
                    text: [
                        { text: "สถิติการลาในปีนี้ (วันเริ่มงาน)", style: "subheader" },
                        { text: ` วันที่: ${formatDate(formData.workingstart)}`, style: "subheader" }
                    ]
                },
                {
                    table: {
                        widths: ["auto", "*", "*", "*"],
                        body: [
                            [
                                { text: "ประเภทลา", alignment: 'center' },
                                { text: "ลามาแล้ว", alignment: 'center' },
                                { text: "ลาครั้งนี้", alignment: 'center' },
                                { text: "รวมเป็น", alignment: 'center' }
                            ],
                            [
                                { text: "ป่วย", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' }
                            ],
                            [
                                { text: "กิจส่วนตัว", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' }
                            ],
                            [
                                { text: "พักร้อน", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' }
                            ],
                            [
                                { text: "คลอดบุตร", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' }
                            ],
                            [
                                { text: "บวช", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' },
                                { text: formData.historyleave || "-", alignment: 'center' }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },
                {
                    text: `ขอแสดงความนับถือ`,
                    margin: [0, 10, 0, 0],
                    alignment: 'right' // ทำให้ข้อความชิดขวา
                },
                {
                    columns: [
                        {
                            width: '33%',  // กำหนดความกว้างให้เป็น 1/3 ของพื้นที่
                            text: `ลงชื่อ:  ...............................พนักงาน`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `ลงชื่อ:  ............................หัวหน้าแผนก`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `ลงชื่อ:  ...............................ผู้ตรวจสอบ`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        }
                    ]
                },
                {
                    columns: [
                        {
                            width: '33%',  // กำหนดความกว้างให้เป็น 1/3 ของพื้นที่
                            text: `(..............................)`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',  // กำหนดความกว้างให้เป็น 1/3 ของพื้นที่
                            text: `(..............................)`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',  // กำหนดความกว้างให้เป็น 1/3 ของพื้นที่
                            text: `(..............................)`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        }
                    ]
                },
                {
                    columns: [
                        {
                            width: '33%',
                            text: `วันที่ ......../......../.........`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `แผนก........................`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `แผนก........................`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        }
                    ]
                },
                {
                    columns: [
                        {
                            width: '33%',
                            text: ``,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `วันที่ ......../......../.........`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '33%',
                            text: `วันที่ ......../......../.........`,
                            alignment: 'center',
                            margin: [0, 10, 0, 0]
                        }
                    ]
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: "center"
                },
                subheader: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 10, 0, 5]
                }
            },
            defaultStyle: {
                font: "THSarabunNew",
                fontSize: 16, // ตั้งค่าขนาดฟ้อนต์เป็น 16
            },
        };

        pdfMake.createPdf(docDefinition).download("แบบฟอร์มใบลา.pdf");
    };

    return (

        <div className="">
            <div className="flex justify-start gap-4 mb-4">
                <Link
                    to="/EmpHome/Document"
                    className="btn btn-outline font-FontNoto"
                >
                    จัดการเอกสาร
                </Link>
                <Link
                    to="/EmpHome/LeaveForm"
                    className="btn btn-outline font-FontNoto"
                >
                    ฟอร์มใบลา
                </Link>
                <Link
                    to="/EmpHome/EmployeeView"
                    className="btn btn-outline font-FontNoto"
                >
                    เอกสารใบลาจาก HR
                </Link>
            </div>
            <div className="p-6 max-w-4xl mx-auto bg-white text-black rounded-xl shadow-md space-y-4">
                <h2 className="text-2xl  font-bold text-center font-FontNoto">แบบฟอร์มใบลา</h2>
                <form className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                        <label className="label">
                            <span className="label-text font-FontNoto">วันที่ :</span>
                        </label>
                        <input
                            type="date"
                            name="createdate"
                            value={formData.createdate || ""} // ใช้ "" เมื่อค่าเป็น undefined
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{
                                colorScheme: "light", // บังคับไอคอนให้ใช้โหมดสว่าง
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="label">
                                <span className="label-text font-FontNoto">เรื่อง : ขออนุญาติลา</span>
                            </label>

                            <select
                                name="leaveTypeId"
                                className="input input-bordered font-FontNoto"
                                value={formData.leaveTypeId}
                                onChange={handleChange}
                            >
                                <option value="" className="font-FontNoto">-- เลือกการลา --</option>
                                {leavetpyeState.map((item) => (
                                    <option key={item.leaveTypeid} value={item.leaveTypeid} className="font-FontNoto">
                                        {item.leaveTypeTh}
                                    </option>
                                ))}
                            </select>

                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="label">
                                <span className="label-text font-FontNoto">เรียน หัวหน้าแผนก/ฝ่ายบุคคล</span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label className="label" style={{ whiteSpace: 'nowrap' }}>
                                    <span className="label-text font-FontNoto">ข้าพเจ้า :</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    className="input input-bordered font-FontNoto"
                                    value={formData.fullname} // ควบคุมค่าโดย state
                                    onChange={handleChange} // ตรวจสอบภาษาไทย
                                    style={{ width: '300px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label className="label" style={{ whiteSpace: 'nowrap' }}>
                                    <span className="label-text font-FontNoto">แผนก :</span>
                                </label>
                                <select
                                    name="rolesid"
                                    className="input input-bordered font-FontNoto" // เพิ่ม class เพื่อกำหนดฟอนต์
                                    value={formData.rolesid}
                                    onChange={handleChange}
                                    style={{ width: '300px' }}
                                >
                                    <option value="" className="font-FontNoto">-- เลือกแผนก --</option>
                                    {rolesState.map((item) => (
                                        <option key={item.rolesid} value={item.rolesid} className="font-FontNoto">
                                            {item.rolesname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label className="label">
                            <span className="label-text font-FontNoto">ขอลา :</span>
                        </label>

                        {
                            leavetpyeState.map((item) => (
                                <label key={item.leaveTypeid} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="leaveTypeId"
                                        value={item.leaveTypeid}
                                        checked={formData.leaveTypeId == item.leaveTypeid} // ตรวจสอบสถานะ
                                        className="radio"
                                        onChange={handleChange}
                                    />
                                    <span className="font-FontNoto" style={{ color: 'black' }}>{item.leaveTypeTh}</span>
                                </label>
                            ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">เนื่องจาก :</span>
                        </label>
                        <input
                            type="text"
                            name="reason"
                            className="input input-bordered font-FontNoto"
                            value={formData.reason} // ควบคุมค่าโดย state
                            onChange={handleChange} // ตรวจสอบภาษาไทย
                            style={{ width: '800px' }} // เพิ่มความกว้าง
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ตั้งแต่วันที่ :</span>
                        </label>
                        <input type="date" name="startdate" value={formData.startdate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} style={{
                            colorScheme: "light",
                        }} />

                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                        </label>
                        <input type="date" name="enddate" value={formData.enddate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} style={{
                            colorScheme: "light",
                        }} />

                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">มีกำหนด :</span>
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                name="total_start_leave"
                                className="input input-bordered mr-2"
                                value={formData.totalleave || ''} // เพิ่มค่าเริ่มต้นเพื่อหลีกเลี่ยง undefined
                                onChange={(e) => {
                                    const value = Math.max(0, Number(e.target.value)); // ใช้ Number เพื่อแปลงค่า
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        totalleave: value, // อัปเดตค่าใน state
                                    }));
                                }}
                                min="0" // จำกัดค่าขั้นต่ำเป็น 0
                                style={{ width: '40%' }}
                            />

                            <span className="font-FontNoto">วัน</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label className="label">
                            <span className="label-text font-FontNoto">ข้าพเจ้าได้ลา :</span>
                        </label>
                        {
                            leavetpyeState.map((item) => (
                                <label key={item.leaveTypeid} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="leavedType"
                                        value={item.leaveTypeid}
                                        checked={formData.leavedType == item.leaveTypeid} // ตรวจสอบสถานะ
                                        className="radio"
                                        onChange={handleChange}
                                    />
                                    <span className="font-FontNoto" style={{ color: 'black' }}>{item.leaveTypeTh}</span>
                                </label>
                            ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ครั้งสุดท้าย ตั้งแต่วันที่ :</span>
                        </label>
                        <input type="date" name="leaved_startdate" value={formData.leaved_startdate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} style={{
                            colorScheme: "light",
                        }} />

                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                        </label>
                        <input type="date" name="leaved_enddate" value={formData.leaved_enddate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} style={{
                            colorScheme: "light",
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="label" style={{ whiteSpace: 'nowrap' }}>
                                <span className="label-text font-FontNoto">มีกำหนด :</span>
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    name="totalleaved"
                                    className="input input-bordered mr-2"
                                    value={formData.totalleaved || ''} // เพิ่มค่าเริ่มต้นเพื่อหลีกเลี่ยง undefined
                                    onChange={handleChange}
                                    min="0" // จำกัดค่าขั้นต่ำเป็น 0
                                    style={{ width: '50%' }}
                                />

                                <span className="font-FontNoto">วัน</span>
                            </div>

                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <label className="label">
                                <span className="label-text font-FontNoto">ในระหว่างลา ติดต่อข้าพเจ้าได้ที่ :</span>
                            </label>
                            <input
                                type="text"
                                name="friendeContact"
                                className="input input-bordered flex-1 font-FontNoto"
                                value={formData.friendeContact}
                                onChange={handleChange} // ตรวจสอบภาษาไทยและตัวเลข
                            />
                            <label className="label">
                                <span className="label-text font-FontNoto">เบอร์ติดต่อ :</span>
                            </label>
                            <input
                                type="text"
                                name="contact"
                                className="input input-bordered flex-1 font-FontNoto"
                                value={formData.contact} // ควบคุมค่าโดย state
                                onChange={handleChange} // ตรวจสอบตัวเลข 10 ตัว
                                maxLength="10" // จำกัดความยาวสูงสุด 10 ตัวอักษร
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold font-FontNoto">
                            สถิติการลาในปีนี้ (วันเริ่มงาน)
                        </h2>
                        <input
                            type="date"
                            name="workingstart"
                            value={formData.workingstart || ''}
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{
                                colorScheme: "light", // บังคับไอคอนให้ใช้โหมดสว่าง
                            }}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full text-center">
                            <thead className="text-center font-FontNoto">
                                <tr>
                                    <th className="font-FontNoto">ประเภทการลา</th>
                                    <th className="font-FontNoto">ลามาแล้ว (วัน)</th>
                                    <th className="font-FontNoto">ลาครั้งนี้ (วัน)</th>
                                    <th className="font-FontNoto">รวม (วัน)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-FontNoto">ป่วย</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="sickDaysUsed"
                                            value={formData.sickDaysUsed || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="sickDaysCurrent"
                                            value={formData.sickDaysCurrent || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="sickDaysTotal"
                                            value={formData.sickDaysTotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="font-FontNoto">กิจส่วนตัว</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="personalDaysUsed"
                                            value={formData.personalDaysUsed || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="personalDaysCurrent"
                                            value={formData.personalDaysCurrent || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="personalDaysTotal"
                                            value={formData.personalDaysTotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td className="font-FontNoto">พักร้อน</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="vacationDaysUsed"
                                            value={formData.vacationDaysUsed || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="vacationDaysCurrent"
                                            value={formData.vacationDaysCurrent || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="vacationDaysTotal"
                                            value={formData.vacationDaysTotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-FontNoto">คลอดบุตร</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="maternityDaysUsed"
                                            value={formData.maternityDaysUsed || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="maternityDaysCurrent"
                                            value={formData.maternityDaysCurrent || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="maternityDaysTotal"
                                            value={formData.maternityDaysTotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                </tr>


                                <tr>
                                    <td className="font-FontNoto">บวช</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="ordinationDaysUsed"
                                            value={formData.ordinationDaysUsed || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="ordinationDaysCurrent"
                                            value={formData.ordinationDaysCurrent || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            name="ordinationDaysTotal"
                                            value={formData.ordinationDaysTotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={handleChange}
                                            onInput={(e) => {
                                                if (e.target.value < 0) e.target.value = 0;  // ป้องกันไม่ให้กรอกตัวเลขติดลบ
                                                if (e.target.value.length > 2) e.target.value = e.target.value.slice(0, 2);
                                            }}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleSaveForm}
                            className="btn btn-outline btn-primary btn-sm font-FontNoto"
                        >
                            บันทึกฟอร์ม
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline btn-sm font-FontNoto"
                            onClick={() => setFormData({
                                leaveTypeId: "",
                                createdate: "",
                                fullname: "",
                                rolesid: "",
                                reason: "",
                                startdate: "",
                                enddate: "",
                                totalleave: 0,
                                leavedType: "",
                                leaved_startdate: "",
                                leaved_enddate: "",
                                totalleaved: 0,
                                friendeContact: "",
                                contact: "",
                                workingstart: "",
                                approvedDate: "",
                                hrApprovedDate: "",
                                sentToHRDate: "",
                                hrSignature: "",
                                managerName: "",
                                managerComment: "",
                            })}
                        >
                            ฟอร์มใหม่
                        </button>

                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="btn btn-active w-1/2 font-FontNoto"
                            onClick={handleGeneratePDF}
                        >
                            สร้าง PDF
                        </button>

                        <button className="btn btn-warning w-1/2 font-FontNoto"
                            type="button"
                            onClick={() => sendFrom()} // ✅ ใช้ฟังก์ชันที่แก้ไขแล้ว
                        >
                            กดส่งฟอร์มไปยังหัวหน้า
                        </button>


                    </div>
                </form>
                <div>
                    <h3 className="text-xl font-bold mb-4 font-FontNoto">แบบฟอร์มที่บันทึก:</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="text-center font-FontNoto">
                                <tr>
                                    <th>#</th>
                                    <th className="font-FontNoto">ชื่อแบบฟอร์ม</th>
                                    <th className="font-FontNoto">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="text-center font-FontNoto">
                                {savedForms.map((form, index) => (
                                    <tr key={form.id}>
                                        <td>{index + 1}</td>
                                        <td className="font-FontNoto">{form.fullname} - {form.leaveTypeId}</td>
                                        <td className="flex justify-center items-center gap-2">
                                            <button onClick={() => handleViewForm(form)} className="btn btn-sm btn-outline btn-success">
                                                ดู
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline btn-error"
                                                onClick={() => setSavedForms(savedForms.filter(f => f.id !== form.id))}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isNotificationModalOpen && (
                        <dialog open className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg font-FontNoto">คุณได้ส่งแบบฟอร์มแล้ว</h3>
                                <p className="py-4 font-FontNoto">ส่งฟอร์มไปยังผู้จัดการทั่วไปสำเร็จ!</p>
                                <div className="modal-action">
                                    <button
                                        className="btn btn-outline btn-success font-FontNoto"
                                        onClick={() => setNotificationModalOpen(false)}
                                    >
                                        ตกลง
                                    </button>
                                </div>
                            </div>
                        </dialog>
                    )}
                    {isNotificationModalOpen && (
                        <dialog open className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg font-FontNoto">{notificationMessage}</h3>
                                <div className="modal-action">
                                    <button
                                        className="btn btn-outline btn-success font-FontNoto"
                                        onClick={() => setNotificationModalOpen(false)}
                                    >
                                        ตกลง
                                    </button>
                                </div>
                            </div>
                        </dialog>
                    )}
                    {/* Modal for delete confirmation */}
                    <dialog id="delete_modal" className="modal">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg font-FontNoto">ยืนยันการลบ</h3>
                            <p className="py-4 font-FontNoto">คุณต้องการลบข้อมูลนี้หรือไม่?</p>
                            <div className="modal-action">
                                <button
                                    className="btn btn-outline btn-warning font-FontNoto"
                                    onClick={() => document.getElementById("delete_modal").close()}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="btn btn-outline btn-error font-FontNoto"
                                    onClick={() => {
                                        if (itemToDelete) {
                                            handleDeleteForm(itemToDelete);
                                            document.getElementById("delete_modal").close();
                                        }
                                    }}
                                >
                                    ลบ
                                </button>

                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </div>
    );
};

export default LeaveForm;