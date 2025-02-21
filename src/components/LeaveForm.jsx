import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { pdfMake, font } from "../libs/pdfmake";
import axios from "axios";
import { string } from "three/tsl";
import { AlwaysCompare } from "three";

const LeaveForm = () => {

    const userId = String(sessionStorage.getItem("userId") || "");

    const [formData, setFormData] = useState({
        documentId: "",
        userid: userId,
        leaveTypeId: "",
        createdate: "",
        fullname: "",
        rolesid: "",
        reason: "",
        startdate: "",
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
        historyRequset: {
            last_total_stickDay: 0,
            last_total_personDay: 0,
            last_total_maternityDaystotal: 0,
            last_total_ordinationDays: 0,
            last_total_vacationDays: 0,
            total_stickDay: 0,
            total_personDay: 0,
            total_maternityDaystotal: 0,
            total_ordinationDays: 0,
            total_vacationDays: 0,
            sum_stickDay: 0,
            sum_personDay: 0,
            sum_maternityDaystotal: 0,
            sum_ordinationDays: 0,
            sum_vacationDays: 0,
        }
    });

    const [savedForms, setSavedForms] = useState([]);

    const [itemToDelete, setItemToDelete] = useState(null);
    const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
    const [isopendeletediglog, setisopendeletediglog] = useState(false)

    const [messageModalState, setmessageModalState] = useState({
        title: "",
        textdetail: ""
    });
    const [leavetpyeState, setleavetpyeState] = useState([]);
    const [rolesState, setrolesState] = useState([]);

    const leaveTypeName = leavetpyeState.find(item => item.leaveTypeid === formData.leaveTypeId)?.leaveTypeTh || "ไม่ระบุ";
    const roleName = rolesState.find(item => item.rolesid === formData.rolesid)?.rolesname || "ไม่ระบุ";
    const leavedTypeName = leavetpyeState.find(item => item.leaveTypeid === formData.leavedType)?.leaveTypeTh || "ไม่ระบุ";

    useEffect(() => {
        if (userId) {
            fetchLeaveType().then(() => {
                fetchSavedForms(); // ✅ โหลดข้อมูลใหม่ทุกครั้งที่เปลี่ยนหน้า
            });
            fetchRoles();
        }
    }, [userId]);
    


    const fetchLeaveType = async () => {

        try {
            const response = await fetch(`http://localhost:7039/api/Document/GetLeaveTypes`);
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
            const response = await fetch(`http://localhost:7039/api/Document/GetRoles`);
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

        // ✅ ตรวจสอบเฉพาะช่องเบอร์ติดต่อ
        if (name === "contact") {
            const onlyNumbers = value.replace(/\D/g, ""); // ลบอักขระที่ไม่ใช่ตัวเลขทั้งหมด
            if (onlyNumbers.length > 10) return; // จำกัดให้พิมพ์ได้แค่ 10 ตัว

            setFormData((prevData) => ({
                ...prevData,
                [name]: onlyNumbers, // อัปเดตค่าให้มีเฉพาะตัวเลข
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const setFormViewData = async (form) => {
        try {
            const response = await fetch(`http://localhost:7039/api/Document/GetDocumentById/${form.documentId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("📌 Data from API:", data); // ✅ เช็คค่าที่ได้จาก API

                // แปลงวันที่ให้รองรับ input[type="date"]
                const formatDate = (date) => date ? date.split("T")[0] : "";

                setFormData({
                    documentId: data.documentId ?? "",
                    userid: String(data.userId) ?? "",
                    fullname: data.fullname ?? "",
                    leaveTypeId: data.leaveTypeId ?? "",
                    rolesid: data.rolesid ?? "",
                    reason: data.reason ?? "",
                    startdate: formatDate(data.startdate),
                    enddate: formatDate(data.enddate),
                    totalleave: data.totalleave ?? 0,
                    contact: data.contact ?? "",
                    createdate: formatDate(data.createdate),
                    leavedType: data.leavedType ?? "",
                    leaved_startdate: formatDate(data.leavedStartdate),
                    leaved_enddate: formatDate(data.leavedEnddate),
                    totalleaved: data.totalleaved ?? 0,
                    friendeContact: data.friendeContact ?? "",
                    workingstart: formatDate(data.workingstart),
                    approvedDate: formatDate(data.approvedDate),
                    hrApprovedDate: formatDate(data.hrApprovedDate),
                    sentToHRDate: formatDate(data.sentToHrdate),
                    hrSignature: data.hrSignature ?? "",
                    managerName: data.managerName ?? "",
                    managerComment: data.managerComment ?? "",
                    historyRequset: {
                        last_total_stickDay: data.historyRequset?.lastTotalStickDay ?? 0,
                        last_total_personDay: data.historyRequset?.lastTotalPersonDay ?? 0,
                        last_total_maternityDaystotal: data.historyRequset?.lastTotalMaternityDaystotal ?? 0,
                        last_total_ordinationDays: data.historyRequset?.lastTotalOrdinationDays ?? 0,
                        last_total_vacationDays: data.historyRequset?.lastTotalVacationDays ?? 0,
                        total_stickDay: data.historyRequset?.totalStickDay ?? 0,
                        total_personDay: data.historyRequset?.totalPersonDay ?? 0,
                        total_maternityDaystotal: data.historyRequset?.totalMaternityDaystotal ?? 0,
                        total_ordinationDays: data.historyRequset?.totalOrdinationDays ?? 0,
                        total_vacationDays: data.historyRequset?.totalVacationDays ?? 0,
                        sum_stickDay: data.historyRequset?.sumStickDay ?? 0,
                        sum_personDay: data.historyRequset?.sumPersonDay ?? 0,
                        sum_maternityDaystotal: data.historyRequset?.sumMaternityDaystotal ?? 0,
                        sum_ordinationDays: data.historyRequset?.sumOrdinationDays ?? 0,
                        sum_vacationDays: data.historyRequset?.sumVacationDays ?? 0,
                    }
                });
            } else {
                console.error("❌ ไม่พบเอกสาร");
            }
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาด:", error);
        }
    };

    const fetchSavedForms = async () => {
        try {
            const response = await fetch(`http://localhost:7039/api/Document/GetDocumentsByUser/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("📌 ข้อมูลฟอร์มที่โหลดจาก API:", data);

                // ✅ กรองเฉพาะฟอร์มที่ยังไม่ถูกส่ง (เช็คให้แน่ใจว่าไม่มี "pending_manager" หรือ "Commited")
                const filteredForms = data.filter(form => form.status === "draft" || form.status === "created");

                setSavedForms(filteredForms);
            } else {
                console.warn("❌ ไม่พบฟอร์มที่บันทึก");
                setSavedForms([]);
            }
        } catch (error) {
            console.error("Error fetching saved forms:", error);
        }
    };


    const resetFormData = () => {
        setFormData({
            documentId: "",  // ✅ รีเซ็ต documentId ด้วย
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
            historyRequset: {
                last_total_stickDay: 0,
                last_total_personDay: 0,
                last_total_maternityDaystotal: 0,
                last_total_ordinationDays: 0,
                last_total_vacationDays: 0,
                total_stickDay: 0,
                total_personDay: 0,
                total_maternityDaystotal: 0,
                total_ordinationDays: 0,
                total_vacationDays: 0,
                sum_stickDay: 0,
                sum_personDay: 0,
                sum_maternityDaystotal: 0,
                sum_ordinationDays: 0,
                sum_vacationDays: 0,
            }
        });
    };

    const updateFrom = async () => {
        // ✅ ตรวจสอบค่าของ formData
        const updatedFormData = {
            ...formData,
            historyRequset: {
                last_total_stickDay: Number(formData.historyRequset?.last_total_stickDay) || 0,
                last_total_personDay: Number(formData.historyRequset?.last_total_personDay) || 0,
                last_total_maternityDaystotal: Number(formData.historyRequset?.last_total_maternityDaystotal) || 0,
                last_total_ordinationDays: Number(formData.historyRequset?.last_total_ordinationDays) || 0,
                last_total_vacationDays: Number(formData.historyRequset?.last_total_vacationDays) || 0,
                total_stickDay: Number(formData.historyRequset?.total_stickDay) || 0,
                total_personDay: Number(formData.historyRequset?.total_personDay) || 0,
                total_maternityDaystotal: Number(formData.historyRequset?.total_maternityDaystotal) || 0,
                total_ordinationDays: Number(formData.historyRequset?.total_ordinationDays) || 0,
                total_vacationDays: Number(formData.historyRequset?.total_vacationDays) || 0,
                sum_stickDay: Number(formData.historyRequset?.sum_stickDay) || 0,
                sum_personDay: Number(formData.historyRequset?.sum_personDay) || 0,
                sum_maternityDaystotal: Number(formData.historyRequset?.sum_maternityDaystotal) || 0,
                sum_ordinationDays: Number(formData.historyRequset?.sum_ordinationDays) || 0,
                sum_vacationDays: Number(formData.historyRequset?.sum_vacationDays) || 0,
            }
        };
    
        const url = `http://localhost:7039/api/Document/UpdateDocument/${updatedFormData.documentId}`;
    
        axios.put(url, updatedFormData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log("✅ การบันทึก/อัปเดตสำเร็จ:", response.data);
            setmessageModalState({
                title: "📌 บันทึกข้อมูลสำเร็จ",
                textdetail: "✅ ฟอร์มถูกบันทึก/อัปเดตเรียบร้อยแล้ว!",
            });
    
            setNotificationModalOpen(true);
            fetchSavedForms();
        })
        .catch(error => {
            console.error("❌ เกิดข้อผิดพลาด:", error);
        });
    };
    
    
    const handleSaveForm = async () => {
        if (!formData.fullname || !formData.leaveTypeId) {
            alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
    
        try {
            let response;
            let url;
            let method;
            console.log(formData.documentId)
            if (formData.documentId) {
                // ✅ ถ้ามี documentId → อัปเดต
                await updateFrom();
            } else {
                // ✅ ถ้าไม่มี documentId → บันทึกใหม่
                url = "http://localhost:7039/api/Document/CreateDocument";
                method = "POST";
    
                response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
    
                console.log(`📌 กำลังส่งคำขอไปที่: ${url}`, formData);
    
                if (response.ok) {
                    const result = await response.json();
                    console.log("✅ การบันทึก/อัปเดตสำเร็จ:", result);
    
                    fetchSavedForms(); // โหลดข้อมูลใหม่จากฐานข้อมูล
    
                    setmessageModalState({
                        title: "📌 บันทึกข้อมูลสำเร็จ",
                        textdetail: "✅ ฟอร์มถูกบันทึก/อัปเดตเรียบร้อยแล้ว!",
                    });
    
                    setNotificationModalOpen(true);
    
                    // ✅ รีเซ็ตค่า historyRequset เป็น 0 หลังจากบันทึกสำเร็จ
                    setFormData(prevData => ({
                        ...prevData,
                        historyRequset: {
                            last_total_stickDay: prevData.historyRequset.last_total_stickDay ?? 0,
                            last_total_personDay: prevData.historyRequset.last_total_personDay ?? 0,
                            last_total_maternityDaystotal: prevData.historyRequset.last_total_maternityDaystotal ?? 0,
                            last_total_ordinationDays: prevData.historyRequset.last_total_ordinationDays ?? 0,
                            last_total_vacationDays: prevData.historyRequset.last_total_vacationDays ?? 0,
                            total_stickDay: prevData.historyRequset.total_stickDay ?? 0,
                            total_personDay: prevData.historyRequset.total_personDay ?? 0,
                            total_maternityDaystotal: prevData.historyRequset.total_maternityDaystotal ?? 0,
                            total_ordinationDays: prevData.historyRequset.total_ordinationDays ?? 0,
                            total_vacationDays: prevData.historyRequset.total_vacationDays ?? 0,
                            sum_stickDay: prevData.historyRequset.sum_stickDay ?? 0,
                            sum_personDay: prevData.historyRequset.sum_personDay ?? 0,
                            sum_maternityDaystotal: prevData.historyRequset.sum_maternityDaystotal ?? 0,
                            sum_ordinationDays: prevData.historyRequset.sum_ordinationDays ?? 0,
                            sum_vacationDays: prevData.historyRequset.sum_vacationDays ?? 0,
                        }
                    }));
                    
                    // ✅ รีเซ็ตฟอร์มหลังจากบันทึกเสร็จ (เฉพาะกรณีสร้างใหม่)
                    if (!formData.documentId) {
                        resetFormData();
                    }
                } else {
                    const errorText = await response.text();
                    console.error("❌ Server error:", errorText);
                    alert("❌ เกิดข้อผิดพลาด: " + errorText);
                }
            }
        } catch (error) {
            console.error("❌ Error:", error);
            alert("❌ เกิดข้อผิดพลาดในการส่งฟอร์ม");
        }
    };
    

    const handleViewForm = (form) => {
        setFormData(form);
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
            const response = await fetch("http://localhost:7039/api/Document/ApproveByManager", {
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


    const sendFrom = async (form) => {
        try {
            console.log("📌 กำลังส่งฟอร์ม:", form.documentId);
            const url = `http://localhost:7039/api/Document/SendToManager/${form.documentId}`;

            const response = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                setmessageModalState({
                    title: "📌 ส่งฟอร์มสำเร็จ",
                    textdetail: "✅ ฟอร์มถูกส่งไปยังหัวหน้าเรียบร้อยแล้ว!",
                });

                setTimeout(() => {
                    resetFormData();  // ✅ รีเซ็ตฟอร์ม
                    setSavedForms(prevForms => prevForms.filter(f => f.documentId !== form.documentId)); // ✅ ลบออกจากตาราง
                }, 500);
            } else {
                const errorText = await response.text();
                console.error("❌ Server error:", errorText);
                setmessageModalState({
                    title: "⚠️ กรุณากดดูฟอร์มก่อนส่ง",
                });
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setmessageModalState({
                title: "⚠️ กรุณากดดูฟอร์มก่อนส่ง",
                textdetail: "❌ ไม่สามารถส่งฟอร์มได้ กรุณาลองใหม่",
            });
        }

        setNotificationModalOpen(true);
    };


    const handleDeleteForm = async () => {

        if (!itemToDelete) {
            alert("❌ ไม่พบ DocumentID");
            return;
        }

        try {
            const response = await fetch(`http://localhost:7039/api/Document/DeleteDocument/${itemToDelete}`, {
                method: "DELETE",
            });

            console.log("📌 การตอบสนองจาก API:", response); // ดีบั๊กการตอบสนองจาก API

            if (response.ok) {


                setSavedForms((prevForms) => prevForms.filter((form) => form.documentId !== itemToDelete));
                setisopendeletediglog(false)
            } else {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                alert("❌ เกิดข้อผิดพลาด: " + errorText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ เกิดข้อผิดพลาดในการลบฟอร์ม");
        }
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
                                { text: formData.historyRequset?.last_total_stickDay ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.total_stickDay ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.sum_stickDay ?? "-", alignment: 'center' }
                            ],
                            [
                                { text: "กิจส่วนตัว", alignment: 'center' },
                                { text: formData.historyRequset?.last_total_personDay ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.total_personDay ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.sum_personDay ?? "-", alignment: 'center' }
                            ],
                            [
                                { text: "พักร้อน", alignment: 'center' },
                                { text: formData.historyRequset?.last_total_vacationDays ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.total_vacationDays ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.sum_vacationDays ?? "-", alignment: 'center' }
                            ],
                            [
                                { text: "คลอดบุตร", alignment: 'center' },
                                { text: formData.historyRequset?.last_total_maternityDaystotal ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.total_maternityDaystotal ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.sum_maternityDaystotal ?? "-", alignment: 'center' }
                            ],
                            [
                                { text: "บวช", alignment: 'center' },
                                { text: formData.historyRequset?.last_total_ordinationDays ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.total_ordinationDays ?? "-", alignment: 'center' },
                                { text: formData.historyRequset?.sum_ordinationDays ?? "-", alignment: 'center' }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },
                {
                    text: `ขอแสดงความนับถือ          .`,
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
                        {leavetpyeState.map((item) => (
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
                        <input
                            type="date"
                            name="startdate"
                            value={formData.startdate || ""}
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{ colorScheme: "light" }}
                        />
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                        </label>
                        <input
                            type="date"
                            name="enddate"
                            value={formData.enddate || ""}
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{ colorScheme: "light" }}
                        />
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
                        {leavetpyeState.map((item) => (
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
                        <input
                            type="date"
                            name="leaved_startdate"
                            value={formData.leaved_startdate || ""}
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{ colorScheme: "light" }}
                        />
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                        </label>
                        <input
                            type="date"
                            name="leaved_enddate"
                            value={formData.leaved_enddate || ""}
                            className="input input-bordered font-FontNoto"
                            onChange={handleChange}
                            style={{ colorScheme: "light" }}
                        />
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
                                value={formData.contact}
                                onChange={handleChange}
                                maxLength="10"
                                onInput={(e) => e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10)} // ✅ บังคับให้มีแต่ตัวเลข
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
                                            // name="sickDaysUsed"
                                            name="last_total_stickDay"

                                            value={formData.historyRequset.last_total_stickDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        last_total_stickDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.total_stickDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        total_stickDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.sum_stickDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        sum_stickDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.last_total_personDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        last_total_personDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.total_personDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        total_personDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.sum_personDay || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        sum_personDay: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.last_total_vacationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        last_total_vacationDays: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.total_vacationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        total_vacationDays: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.sum_vacationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        sum_vacationDays: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.last_total_maternityDaystotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        last_total_maternityDaystotal: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.total_maternityDaystotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        total_maternityDaystotal: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.sum_maternityDaystotal || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        sum_maternityDaystotal: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.last_total_ordinationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        last_total_ordinationDays: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.total_ordinationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        total_ordinationDays: value
                                                    }
                                                }));
                                            }}
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
                                            value={formData.historyRequset.sum_ordinationDays || ''}
                                            className="input input-bordered w-full text-center font-FontNoto"
                                            maxLength="2"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    historyRequset: {
                                                        ...prevData.historyRequset,
                                                        sum_ordinationDays: value
                                                    }
                                                }));
                                            }}
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
                            className="btn btn-outline btn-sm font-FontNoto"
                            onClick={() => resetFormData()}
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
                            onClick={handleSaveForm}
                        >
                            บันทึกฟอร์ม
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
                            <tbody className=" text-center font-FontNoto">
                                {savedForms.map((form, index) => {

                                    return (
                                        <tr key={form.id}>
                                            <td>{index + 1}</td>
                                            <td className="font-FontNoto">
                                                {leavetpyeState.find(item => item.leaveTypeid === form.leaveTypeId)?.leaveTypeTh || "ไม่ระบุ"} {form.reason} ตั้งแต่วันที่ {new Date(form.startdate).toLocaleDateString("th-TH")} ถึงวันที่ {new Date(form.enddate).toLocaleDateString("th-TH")}
                                            </td>
                                            <td className="flex justify-center items-center gap-2 font-FontNoto">
                                                <button onClick={() => setFormViewData(form)} className="btn btn-sm btn-outline btn-success">
                                                    ดู
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline btn-error font-FontNoto"
                                                    onClick={() => {
                                                        setItemToDelete(form.documentId);
                                                        setisopendeletediglog(true)
                                                    }} >
                                                    ลบ
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline btn-primary font-FontNoto"
                                                    type="button"
                                                    onClick={() => sendFrom(formData)} // ✅ เรียก sendFrom() พร้อมส่งข้อมูลฟอร์ม
                                                >
                                                    กดส่งฟอร์มไปยังหัวหน้า
                                                </button>

                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {isNotificationModalOpen && (
                        <dialog open className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg font-FontNoto">{messageModalState.title}</h3>
                                <p className="py-4 font-FontNoto">{messageModalState.textdetail}</p>
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
                    {isopendeletediglog && (
                        <dialog open id="delete_modal" className="modal">
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
                                        className=" btn btn-outline btn-error"
                                        onClick={() => {

                                            handleDeleteForm();
                                        }}
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        </dialog>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaveForm;