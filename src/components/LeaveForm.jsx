import React, { useState, useEffect } from "react";
import { pdfMake, font } from "../libs/pdfmake";

const LeaveForm = () => {
    const [formData, setFormData] = useState({
        date: "",
        month: "",
        year: "",
        aa: "",
        department: "",
        position: "",
        leaveType: "",
        leT: "",
        fromDate: "",
        toDate: "",
        fromd: "",
        tod: "",
        tt: "",
        totalDays: "",
        totald: "",
        reason: "",
        contact: "",
        phone: "",
        sickDaysUsed: "",
        sickDaysCurrent: "",
        sickDaysTotal: "",
        personalDaysUsed: "",
        personalDaysCurrent: "",
        personalDaysTotal: "",
        vacationDaysUsed: "",
        vacationDaysCurrent: "",
        vacationDaysTotal: "",
        maternityDaysUsed: "",
        maternityDaysCurrent: "",
        maternityDaysTotal: "",
        ordinationDaysUsed: "",
        ordinationDaysCurrent: "",
        ordinationDaysTotal: "",
    });
    const [savedForms, setSavedForms] = useState([]);
    const userId = sessionStorage.getItem("userId");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);

    // ฟังก์ชันเพิ่ม id ให้ฟอร์ม
    const addIdToForm = (form) => ({
        ...form,
        id: form.id || Date.now(), // เพิ่ม id ถ้ายังไม่มี
    });


    useEffect(() => {
        if (!userId) {
            console.error("User ID ไม่ถูกตั้งค่าใน sessionStorage");
            return;
        }
        // โหลดฟอร์มของผู้ใช้จาก localStorage
        const storedForms = localStorage.getItem(`savedForms_${userId}`);
        if (storedForms) {
            setSavedForms(JSON.parse(storedForms));
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (type === "number") {
            // ตรวจสอบให้ค่าตัวเลขไม่ติดลบ
            const numericValue = parseInt(value);
            if (value !== "" && numericValue < 0) {
                return; // ไม่อัปเดตค่าใน state หากเป็นค่าติดลบ
            }
            setFormData((prevData) => ({
                ...prevData,
                [name]: numericValue || "", // อัปเดตค่าใน state
            }));
            return;
        }

        if (type === "date") {
            // อัปเดตวันที่โดยตรง
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
            return;
        }

        if (name === "contact") {
            // ตรวจสอบให้กรอกเฉพาะตัวอักษรภาษาไทยและตัวเลข
            const thaiAndNumberRegex = /^[ก-๙0-9\s]*$/;
            if (thaiAndNumberRegex.test(value)) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: value,
                }));
            }
            return;
        }

        if (name === "phone") {
            // ตรวจสอบให้กรอกเฉพาะตัวเลขและจำกัดความยาวไม่เกิน 10 ตัว
            const numberRegex = /^[0-9]*$/;
            if (numberRegex.test(value) && value.length <= 10) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: value,
                }));
            }
            return; 
        }

        // ตรวจสอบให้กรอกเฉพาะตัวอักษรภาษาไทยและช่องว่างสำหรับฟิลด์อื่นๆ
        const thaiRegex = /^[ก-๙\s]*$/;
        if (thaiRegex.test(value)) {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    const handleDeleteForm = (index) => {
        const updatedForms = savedForms.filter((_, i) => i !== index);
        setSavedForms(updatedForms);
        localStorage.setItem(`savedForms_${userId}`, JSON.stringify(updatedForms));
    };

    const handleSaveForm = () => {
        console.log("Saving form data:", formData); // Debug ข้อมูล
        setSavedForms((prev) => {
            const updatedForms = [...prev, formData];
            localStorage.setItem(`savedForms_${userId}`, JSON.stringify(updatedForms));
            return updatedForms;
        });

        // รีเซ็ตฟอร์ม
        setFormData({
            date: "",
            month: "",
            year: "",
            aa: "",
            department: "",
            position: "",
            leaveType: "",
            leT: "",
            fromDate: "",
            toDate: "",
            fromd: "",
            tod: "",
            tt: "",
            totalDays: "",
            totald: "",
            reason: "",
            contact: "",
            phone: "",
            sickDaysUsed: "",
            sickDaysCurrent: "",
            sickDaysTotal: "",
            personalDaysUsed: "",
            personalDaysCurrent: "",
            personalDaysTotal: "",
            vacationDaysUsed: "",
            vacationDaysCurrent: "",
            vacationDaysTotal: "",
            maternityDaysUsed: "",
            maternityDaysCurrent: "",
            maternityDaysTotal: "",
            ordinationDaysUsed: "",
            ordinationDaysCurrent: "",
            ordinationDaysTotal: "",
        });
    };

    const handleViewForm = (index) => {
        console.log("Viewing form data:", savedForms[index]); // Debug ข้อมูล
        const selectedForm = savedForms[index];
        setFormData(selectedForm);
    };

const handleSendToManager = () => {
    if (!formData.date || !formData.department || !formData.position) {
        return alert("กรุณากรอกข้อมูลในฟอร์มให้ครบถ้วน");
    }

    const userId = sessionStorage.getItem("userId"); // ดึง userId จาก sessionStorage
    if (!userId) {
        return alert("ไม่สามารถระบุพนักงานได้ กรุณาลองเข้าสู่ระบบใหม่");
    }

    // เพิ่ม id และ userId ให้ฟอร์ม
    const updatedForm = {
        ...formData,
        userId, // เก็บ userId ในฟอร์ม
        id: Date.now(), // สร้าง ID แบบไม่ซ้ำ
    };

    // ดึงข้อมูลฟอร์มจาก localStorage
    const managerForms = JSON.parse(localStorage.getItem("managerForms")) || [];

    // อัปเดตรายการฟอร์ม
    const updatedForms = [...managerForms, updatedForm];

    // บันทึกลง localStorage
    localStorage.setItem("managerForms", JSON.stringify(updatedForms));

    // เปิด Modal แจ้งเตือน
    setNotificationModalOpen(true);
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
                    text: `วันที่ : ${formatDate(formData.date)}`,
                    margin: [0, 10, 0, 10],
                    alignment: 'right' // ทำให้ข้อความชิดขวา
                },
                { text: `เรื่อง : ขออนุญาติลา : ${formData.aa || "-"}`, margin: [0, 10, 0, 10] },
                { text: `เรียน หัวหน้าแผนก/ฝ่ายบุคคล`, margin: [0, 10, 0, 10] },
                {
                    table: {
                        widths: ["auto", "*"],
                        body: [
                            ["ข้าพเจ้า :", `${formData.department || "-"} ตำแหน่ง ${formData.position || "-"}`],
                            ["ขอลา :", `${formData.leaveType || "-"} เนื่องจาก ${formData.reason || "-"}`],
                            [
                                "ตั้งแต่วันที่ :",
                                `${formatDate(formData.fromDate)} ถึงวันที่ : ${formatDate(formData.toDate)} รวม : ${formData.totalDays || "0"} วัน`
                            ],
                            [
                                "ข้าพเจ้าได้ลา :",
                                `${formData.leT || "-"} ครั้งสุดท้าย ตั้งแต่วันที่ : ${formatDate(formData.fromd)} ถึงวันที่ : ${formatDate(formData.tod)} รวม ${formData.totald || "0"} วัน`
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
                                `${formData.contact || "-"}, เบอร์ติดต่อ ${formData.phone || "-"}`
                            ],
                        ],
                    },
                    layout: "noBorders",
                    margin: [0, 0, 0, 20],
                },
                {
                    text: [
                        { text: "สถิติการลาในปีนี้ (วันเริ่มงาน)", style: "subheader" },
                        { text: ` วันที่: ${formatDate(formData.tt)}`, style: "subheader" }
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
                                { text: formData.sickDaysUsed || "-", alignment: 'center' },
                                { text: formData.sickDaysCurrent || "-", alignment: 'center' },
                                { text: formData.sickDaysTotal || "-", alignment: 'center' }
                            ],
                            [
                                { text: "กิจส่วนตัว", alignment: 'center' },
                                { text: formData.personalDaysUsed || "-", alignment: 'center' },
                                { text: formData.personalDaysCurrent || "-", alignment: 'center' },
                                { text: formData.personalDaysTotal || "-", alignment: 'center' }
                            ],
                            [
                                { text: "พักร้อน", alignment: 'center' },
                                { text: formData.vacationDaysUsed || "-", alignment: 'center' },
                                { text: formData.vacationDaysCurrent || "-", alignment: 'center' },
                                { text: formData.vacationDaysTotal || "-", alignment: 'center' }
                            ],
                            [
                                { text: "คลอดบุตร", alignment: 'center' },
                                { text: formData.maternityDaysUsed || "-", alignment: 'center' },
                                { text: formData.maternityDaysCurrent || "-", alignment: 'center' },
                                { text: formData.maternityDaysTotal || "-", alignment: 'center' }
                            ],
                            [
                                { text: "บวช", alignment: 'center' },
                                { text: formData.ordinationDaysUsed || "-", alignment: 'center' },
                                { text: formData.ordinationDaysCurrent || "-", alignment: 'center' },
                                { text: formData.ordinationDaysTotal || "-", alignment: 'center' }
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
        <div className="p-6 max-w-4xl mx-auto bg-white text-black rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl  font-bold text-center font-FontNoto">แบบฟอร์มใบลา</h2>
            <form className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                    <label className="label">
                        <span className="label-text font-FontNoto">วันที่ :</span>
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date || ""} // ใช้ "" เมื่อค่าเป็น undefined
                        className="input input-bordered font-FontNoto"
                        onChange={handleChange}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label">
                            <span className="label-text font-FontNoto">เรื่อง : ขออนุญาติลา</span>
                        </label>
                        <select
                            name="aa"
                            className="input input-bordered font-FontNoto"
                            value={formData.aa} // ผูกค่า value กับ state
                            onChange={handleChange} // อัปเดตค่าใน state
                            style={{
                                width: '150px', // ปรับความกว้าง
                            }}
                        >
                            <option value="" className="font-FontNoto">-- เลือกการลา --</option>
                            <option value="ป่วย" className="font-FontNoto">ป่วย</option>
                            <option value="กิจ" className="font-FontNoto">กิจ</option>
                            <option value="พักร้อน" className="font-FontNoto">พักร้อน</option>
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
                                name="department"
                                className="input input-bordered font-FontNoto"
                                value={formData.department} // ควบคุมค่าโดย state
                                onChange={handleChange} // ตรวจสอบภาษาไทย
                                style={{ width: '300px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="label" style={{ whiteSpace: 'nowrap' }}>
                                <span className="label-text font-FontNoto">แผนก :</span>
                            </label>
                            <select
                                name="position"
                                className="input input-bordered font-FontNoto" // เพิ่ม class เพื่อกำหนดฟอนต์
                                value={formData.position}
                                onChange={handleChange}
                                style={{ width: '300px' }}
                            >
                                <option value="" className="font-FontNoto">-- เลือกแผนก --</option>
                                <option value="นักพัฒนาระบบ" className="font-FontNoto">นักพัฒนาระบบ</option>
                                <option value="นักวิเคราะห์ธุรกิจ" className="font-FontNoto">นักวิเคราะห์ธุรกิจ</option>
                                <option value="ทรัพยากรบุคคล" className="font-FontNoto">ทรัพยากรบุคคล</option>
                                <option value="ผู้จัดการทั่วไป" className="font-FontNoto">ผู้จัดการทั่วไป</option>
                                <option value="พนักงาน" className="font-FontNoto">พนักงาน</option>
                            </select>
                        </div>

                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label className="label">
                        <span className="label-text font-FontNoto">ขอลา :</span>
                    </label>
                    {["ป่วย", "กิจส่วนตัว", "พักร้อน", "คลอดบุตร", "บวช"].map((type) => (
                        <label key={type} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="leaveType"
                                value={type}
                                checked={formData.leaveType === type} // ตรวจสอบสถานะ
                                className="radio"
                                onChange={handleChange}
                            />
                            <span className="font-FontNoto" style={{ color: 'black' }}>{type}</span>
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
                    <input type="date" name="fromDate" value={formData.fromDate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} />

                    <label className="label" style={{ whiteSpace: 'nowrap' }}>
                        <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                    </label>
                    <input type="date" name="toDate" value={formData.toDate || ''} className="input input-bordered font-FontNoto" onChange={handleChange} />

                    <label className="label" style={{ whiteSpace: 'nowrap' }}>
                        <span className="label-text font-FontNoto">มีกำหนด :</span>
                    </label>
                    <div className="flex items-center">
                        <input
                            type="number"
                            name="totalDays"
                            className="input input-bordered mr-2"
                            value={formData.totalDays || ''} // เพิ่มค่าเริ่มต้นเพื่อหลีกเลี่ยง undefined
                            onChange={(e) => {
                                const value = Math.max(0, Number(e.target.value)); // ใช้ Number เพื่อแปลงค่า
                                setFormData((prevData) => ({
                                    ...prevData,
                                    totalDays: value, // อัปเดตค่าใน state
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
                    {["ป่วย", "กิจส่วนตัว", "พักร้อน", "คลอดบุตร", "บวช"].map((type) => (
                        <label key={type} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="leT"
                                value={type}
                                checked={formData.leT === type} // ตรวจสอบสถานะที่เลือก
                                className="radio"
                                onChange={handleChange}
                            />
                            <span className="font-FontNoto" style={{ color: 'black' }}>{type}</span>
                        </label>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label className="label" style={{ whiteSpace: 'nowrap' }}>
                        <span className="label-text font-FontNoto">ครั้งสุดท้าย ตั้งแต่วันที่ :</span>
                    </label>
                    <input type="date" name="fromd" value={formData.fromd || ''} className="input input-bordered font-FontNoto" onChange={handleChange} />

                    <label className="label" style={{ whiteSpace: 'nowrap' }}>
                        <span className="label-text font-FontNoto">ถึงวันที่ :</span>
                    </label>
                    <input type="date" name="tod" value={formData.tod || ''} className="input input-bordered font-FontNoto" onChange={handleChange} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label" style={{ whiteSpace: 'nowrap' }}>
                            <span className="label-text font-FontNoto">มีกำหนด :</span>
                        </label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                name="totald"
                                className="input input-bordered mr-2"
                                value={formData.totald || ''} // เพิ่มค่าเริ่มต้นเพื่อหลีกเลี่ยง undefined
                                onChange={(e) => {
                                    const value = Math.max(0, Number(e.target.value)); // ใช้ Number เพื่อแปลงค่าจาก string เป็น number
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        totald: value, // อัปเดตค่าใน state
                                    }));
                                }}
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
                            name="contact"
                            className="input input-bordered flex-1"
                            value={formData.contact} // ควบคุมค่าโดย state
                            onChange={handleChange} // ตรวจสอบภาษาไทยและตัวเลข
                        />
                        <label className="label">
                            <span className="label-text font-FontNoto">เบอร์ติดต่อ :</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            className="input input-bordered flex-1"
                            value={formData.phone} // ควบคุมค่าโดย state
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
                        name="tt"
                        value={formData.tt || ''}
                        className="input input-bordered font-FontNoto"
                        onChange={handleChange}
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
                            date: "",
                            month: "",
                            year: "",
                            aa: "",
                            department: "",
                            position: "",
                            leaveType: "",
                            leT: "",
                            fromDate: "",
                            toDate: "",
                            fromd: "",
                            tod: "",
                            tt: "",
                            totalDays: "",
                            totald: "",
                            reason: "",
                            contact: "",
                            phone: "",
                            sickDaysUsed: "",
                            sickDaysCurrent: "",
                            sickDaysTotal: "",
                            personalDaysUsed: "",
                            personalDaysCurrent: "",
                            personalDaysTotal: "",
                            vacationDaysUsed: "",
                            vacationDaysCurrent: "",
                            vacationDaysTotal: "",
                            maternityDaysUsed: "",
                            maternityDaysCurrent: "",
                            maternityDaysTotal: "",
                            ordinationDaysUsed: "",
                            ordinationDaysCurrent: "",
                            ordinationDaysTotal: "",
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

                    <button
                        type="button"
                        className="btn btn-warning w-1/2 font-FontNoto"
                        onClick={handleSendToManager}
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
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="font-FontNoto">แบบฟอร์มใบลา -{index + 1}</td>
                                    <td className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handleViewForm(index)}
                                            className="btn btn-sm btn-outline btn-success text-center font-FontNoto"
                                        >
                                            ดู
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline btn-error font-FontNoto"
                                            onClick={() => {
                                                setItemToDelete(index); // กำหนด index ฟอร์มที่ต้องการลบ
                                                document.getElementById("delete_modal").showModal(); // แสดง Modal
                                            }}
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
                                    handleDeleteForm(itemToDelete); // ลบฟอร์มตาม index
                                    document.getElementById("delete_modal").close(); // ปิด Modal
                                }}
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default LeaveForm;