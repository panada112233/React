import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { pdfMake, font } from "../libs/pdfmake";

function MyEducation() {
  const [educations, setEducations] = useState([]);
  const [newEducation, setNewEducation] = useState({
    level: "",
    institute: "",
    fieldOfStudy: "",
    year: "",
    gpa: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const userID = sessionStorage.getItem("userId") || ""; // ดึง userID จาก sessionStorage
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // เก็บข้อความที่จะแสดงใน Modal
  const [modalConfirmAction, setModalConfirmAction] = useState(null); // ฟังก์ชันสำหรับยืนยันการกระทำ

  const levelLabels = {
    Primary: "ประถมศึกษา",
    Secondary: "มัธยมศึกษา",
    Voc: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
    Dip: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    Bachelor: "ปริญญาตรี",
    Master: "ปริญญาโท",
    Doctorate: "ปริญญาเอก",
  };
  const fetchEducations = async () => {
    if (!userID) {
      console.error("ไม่พบ userID");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:7039/api/Educations/GetById/${userID}`
      );
      if (response.status === 200) {
        setEducations(response.data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    }
  };

  // ดึงข้อมูลการศึกษา
  useEffect(() => {
    fetchEducations();
  }, [userID]);

  // เพิ่มหรือแก้ไขข้อมูลการศึกษา
  const handleAddOrEditEducation = async (e) => {
    e.preventDefault();


    // ตรวจสอบรูปแบบปีที่ศึกษา
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!newEducation.year || !yearRegex.test(newEducation.year)) {
      setModalMessage("กรุณากรอกปีในรูปแบบ 2567-2568");
      setIsModalOpen(true);
      return;
    }

    // ตรวจสอบเกรดเฉลี่ย
    if (newEducation.gpa < 0 || newEducation.gpa > 4) {
      setModalMessage("กรุณากรอกเกรดเฉลี่ยสะสมให้ถูกต้อง (0.00 - 4.00)");
      setIsModalOpen(true);
      return;
    }

    // ตรวจสอบข้อมูลก่อนบันทึก
    const regex = /^\d{4}-\d{4}$/; // รูปแบบปี "2567-2568"
    if (newEducation.year && !regex.test(newEducation.year)) {
      setModalMessage(
        <div className="font-FontNoto">กรุณากรอกปีในรูปแบบ 2567-2568</div>
      );
      setModalConfirmAction(null); // ไม่ต้องยืนยันการกระทำ
      setIsModalOpen(true);
      return;
    }

    if (newEducation.gpa < 0 || newEducation.gpa > 4) {
      setModalMessage(
        <div className="font-FontNoto">
          กรุณากรอกเกรดเฉลี่ยสะสมให้ถูกต้อง (0.00 - 4.00)
        </div>
      );
      setModalConfirmAction(null);
      setIsModalOpen(true);
      setEducations(newEducation)
      return;
    }


    try {
      if (isEditing) {
        const updatedEducation = { ...educations[editIndex], ...newEducation };
        const response = await axios.put(
          `http://localhost:7039/api/Educations/Update/${updatedEducation.educationID}`,
          updatedEducation
        );
        const updatedEducations = educations.map((edu, index) =>
          index === editIndex ? response.data : edu
        );
        setEducations(updatedEducations);
        setIsEditing(false);
        setEditIndex(null);
        fetchEducations();
      } else {
        const response = await axios.post(
          "http://localhost:7039/api/Educations/Insert",
          { ...newEducation, userID }
        );

        educations.push({
          ...newEducation
        });

      }

      setNewEducation({
        level: "",
        institute: "",
        fieldOfStudy: "",
        year: "",
        gpa: "",
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเพิ่ม/แก้ไขข้อมูล:", error);
    }
  };

  // จัดการการเปลี่ยนแปลงในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "year") {
      // อนุญาตเฉพาะตัวเลขและขีดกลาง "-"
      const filteredValue = value.replace(/[^0-9\-]/g, "");
      setNewEducation({ ...newEducation, [name]: filteredValue });
      return;
    }
    setNewEducation({ ...newEducation, [name]: value });
  };

  // เริ่มแก้ไขข้อมูล
  const handleEditEducation = (index) => {
    setNewEducation(educations[index]);
    setIsEditing(true);
    setEditIndex(index);
  };


  // ลบข้อมูล
  const handleDeleteEducation = (index) => {
    const educationToDelete = educations[index];

    // สร้างข้อความด้วยการแยกแท็กที่เหมาะสม
    setModalMessage(
      <>
        <p className="font-FontNoto">
          คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?
        </p>
        <p className="font-FontNoto">
          <strong>สถาบัน:</strong> {educationToDelete.institute}
        </p>
        <p className="font-FontNoto">
          <strong>ระดับ:</strong> {levelLabels[educationToDelete.level]}
        </p>
      </>
    );

    setModalConfirmAction(() => async () => {
      try {
        // เรียก API เพื่อลบข้อมูล
        await axios.delete(
          `http://localhost:7039/api/Educations/Delete/${educationToDelete.educationID}`
        );

        // อัปเดตรายการการศึกษาหลังจากลบสำเร็จ
        const updatedEducations = educations.filter((_, i) => i !== index);
        setEducations(updatedEducations);

        // ปิดโมดอล
        setIsModalOpen(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
      }
    });

    // เปิดโมดอล
    setIsModalOpen(true);
  };


  // ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  // Export PDF
  const handleExportPDF = () => {
    const docDefinition = {
      pageSize: 'A4',
      content: [
        {
          text: "การศึกษา",
          style: "header"
        },
        {
          table: {
            widths: ['*'], // ความกว้างตารางปรับตามเนื้อหา
            body: [
              ...educations.map((edu, index) => [
                [
                  {
                    stack: [
                      {
                        text: `${index + 1}. ระดับ: ${levelLabels[edu.level]}`,
                        style: "subHeader"
                      },
                      {
                        text: `สถาบัน: ${edu.institute}`,
                        style: "detail"
                      },
                      {
                        text: `สาขา: ${edu.fieldOfStudy}`,
                        style: "detail"
                      },
                      {
                        text: `ปีที่สำเร็จการศึกษา: ${edu.year}`,
                        style: "detail"
                      },
                      {
                        text: `GPA: ${edu.gpa}`,
                        style: "detail"
                      },
                    ],
                    margin: [5, 5, 5, 5], // ระยะห่างในเซลล์
                  },
                ],
              ]),
            ],
          },
          layout: {
            hLineWidth: (i, node) => 0.5, // ความหนาเส้นขอบแนวนอน
            vLineWidth: (i, node) => 0.5, // ความหนาเส้นขอบแนวตั้ง
            hLineColor: (i, node) => "#bfbfbf", // สีเส้นขอบแนวนอน
            vLineColor: (i, node) => "#bfbfbf", // สีเส้นขอบแนวตั้ง
            paddingLeft: (i, node) => 5, // ระยะชิดด้านซ้าย
            paddingRight: (i, node) => 5, // ระยะชิดด้านขวา
            paddingTop: (i, node) => 5, // ระยะชิดด้านบน
            paddingBottom: (i, node) => 5, // ระยะชิดด้านล่าง
          },
        },
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        subHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 5, 0, 2],
        },
        detail: {
          fontSize: 14,
          margin: [0, 2, 0, 0],
        },
      },
      defaultStyle: {
        font: "THSarabunNew", // ใช้ฟอนต์ THSarabunNew
      },
    };

    pdfMake.createPdf(docDefinition).download('การศึกษา.pdf');
  };


  return (
    <div className="">
      <div className="flex justify-start gap-4 mb-4">
        <Link
          to="/EmpHome/Profile"
          className="btn btn-outline btn-primary font-FontNoto"
        >
          ข้อมูลส่วนตัว
        </Link>
        <Link
          to="/EmpHome/My_education"
          className="btn btn-outline btn-success font-FontNoto"
        >
          การศึกษา
        </Link>
        <Link
          to="/EmpHome/My_experience"
          className="btn btn-outline btn-info font-FontNoto"
        >
          ประสบการณ์ทำงาน
        </Link>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <p className="text-center">{modalMessage}</p>
            <div className="flex justify-center mt-4">
              {modalConfirmAction && (
                <button
                  className="btn btn-outline btn-primary mx-2 font-FontNoto"
                  onClick={modalConfirmAction}
                >
                  ยืนยัน
                </button>
              )}
              <button className="btn btn-outline btn-error mx-2 font-FontNoto" onClick={handleCloseModal}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold text-black font-FontNoto">การศึกษา</h2>
      <div className="max-w-4xl mx-auto  shadow-lg rounded-lg p-6 relative">
        <form onSubmit={handleAddOrEditEducation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">ระดับการศึกษา</span>
              </label>
              <select
                name="level"
                className="select select-bordered font-FontNoto"
                value={newEducation.level}
                onChange={handleChange}
                required
              >
                <option className="font-FontNoto" value="">กรุณาเลือกระดับการศึกษา</option>
                {Object.entries(levelLabels).map(([key, label]) => (
                  <option className="font-FontNoto" key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">ชื่อสถาบัน</span>
              </label>
              <input
                type="text"
                name="institute"
                className="input font-FontNoto input-bordered"
                placeholder="กรอกชื่อสถาบัน"
                value={newEducation.institute}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">สาขาวิชา</span>
              </label>
              <input
                type="text"
                name="fieldOfStudy"
                className="input font-FontNoto input-bordered"
                placeholder="กรอกสาขาวิชา"
                value={newEducation.fieldOfStudy}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">ปีที่ศึกษา</span>
              </label>
              <input
                type="text"
                name="year"
                className="input input-bordered font-FontNoto"
                placeholder="กรอกปีที่ศึกษา (ตัวอย่าง: 2567-2568)"
                value={newEducation.year}
                onChange={handleChange}
                required
                pattern="\d{4}-\d{4}" // บังคับรูปแบบ 4 ตัวเลข-4 ตัวเลข
                title="กรอกปีในรูปแบบ 2567-2568"
                inputMode="numeric" // บังคับเฉพาะตัวเลข
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">เกรดเฉลี่ยสะสม</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="gpa"
                className="input input-bordered font-FontNoto"
                placeholder="กรอกเกรดเฉลี่ยสะสม (สูงสุด 4.00)"
                value={newEducation.gpa}
                onChange={handleChange}
                required
                max="4.00"  // Restrict input to a maximum value of 4.00
              />
            </div>

          </div>
          <button type="submit" className="btn btn-warning w-full font-FontNoto">
            {isEditing ? "บันทึกการแก้ไข" : "เพิ่มการศึกษา"}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold font-FontNoto">ประวัติการศึกษา</h3>
            <button
              className="btn btn-outline btn-error font-FontNoto"
              onClick={handleExportPDF}
            >
              Export PDF
            </button>
          </div>
          {educations.length === 0 ? (
            <p className="text-gray-500 font-FontNoto">ไม่มีข้อมูลการศึกษา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="text-black text-center bg-blue-100 font-FontNoto">
                    {/* <th className="table-header font-FontNoto w-10">#</th> */}
                    <th className="table-header font-FontNoto w-80">สถาบัน</th>
                    <th className="table-header font-FontNoto w-40">ระดับ</th>
                    <th className="table-header font-FontNoto w-40">สาขา</th>
                    <th className="table-header font-FontNoto w-40">ปีที่ศึกษา</th>
                    <th className="table-header font-FontNoto w-10">GPA</th>
                    <th className="table-header font-FontNoto w-40">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {educations.map((edu, index) => (
                    <tr key={index}>
                      {/* <td className="table-header font-FontNoto">{index + 1}</td> */}
                      <td className="table-header font-FontNoto">{edu.institute}</td>
                      <td className="table-header font-FontNoto">{levelLabels[edu.level]}</td>
                      <td className="table-header font-FontNoto">{edu.fieldOfStudy}</td>
                      <td className="table-header font-FontNoto text-center">{edu.year}</td>
                      <td className="table-header font-FontNoto text-center">{edu.gpa}</td>
                      <td className="font-FontNoto text-center">
                        <button
                          className="btn btn-xs btn-warning mr-2 font-FontNoto"
                          onClick={() => handleEditEducation(index)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-xs btn-error font-FontNoto"
                          onClick={() => handleDeleteEducation(index)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MyEducation;
