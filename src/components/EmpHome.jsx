import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";
import DIcon from '../assets/12.png';
// ลงทะเบียน Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const roleMapping = {
  Hr: "ทรัพยากรบุคคล",
  GM: "ผู้จัดการทั่วไป",
  Dev: "นักพัฒนาระบบ",
  BA: "นักวิเคราะห์ธุรกิจ",
  Employee: "พนักงาน",
};

const EmpHome = () => {
  const [userName, setUserName] = useState("กำลังโหลด...");
  const [roleText, setRoleText] = useState("กำลังโหลด...");
  const [statistics, setStatistics] = useState({
    totalDocuments: 0,
    totalExperience: 0,
    totalEducations: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const categoryMapping = {
    Identification: 'ลาพักร้อน',
    WorkContract: 'ใบลากิจ',
    Certificate: 'ใบลาป่วย',
    Others: 'อื่นๆ',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = sessionStorage.getItem("userId"); // ดึง userId จาก sessionStorage
        if (!id) {
          console.error("User ID ไม่ถูกตั้งค่าใน sessionStorage");
          setIsLoading(false);
          return;
        }

        // เรียก API สำหรับผู้ใช้คนเดียว
        const userRequest = axios.get(`https://localhost:7039/api/Users/Getbyid/${id}`);
        const documentsRequest = axios.get('https://localhost:7039/api/Files/Document', {
          params: { userID: id }
        });
        const educationsRequest = axios.get(`https://localhost:7039/api/Educations/Getbyid/${id}`);
        const experiencesRequest = axios.get(`https://localhost:7039/api/WorkExperiences/Getbyid/${id}`);

        const [userResponse, documentsResponse, educationsResponse, experiencesResponse] = await Promise.all([
          userRequest,
          documentsRequest,
          educationsRequest,
          experiencesRequest,
        ]);
        // ตั้งชื่อผู้ใช้จาก API
        if (userResponse.status === 200) {
          const userData = userResponse.data;
          setUserName(`${userData.firstName} ${userData.lastName}`); // รวมชื่อและนามสกุล
          const roleText = roleMapping[userData.role] || ""; // แปลง role เป็นภาษาไทย
          setRoleText(roleText); // ตั้งค่า roleText ใน state ใหม่
        }

        // ตั้งค่าข้อมูลสถิติ
        if (
          documentsResponse.status === 200 &&
          educationsResponse.status === 200 &&
          experiencesResponse.status === 200
        ) {
          setStatistics({
            totalDocuments: documentsResponse.data.length,
            totalEducations: educationsResponse.data.length,
            totalExperience: experiencesResponse.data.length,
          });

          // นับจำนวนเอกสารแต่ละประเภท
          const counts = documentsResponse.data.reduce((acc, doc) => {
            const category = categoryMapping[doc.category] || 'อื่นๆ'; // แปลงประเภทเอกสารเป็นชื่อ
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {});

          setCategoryCounts(counts);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดระหว่างดึงข้อมูล:", error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, []);

  // กำหนดลำดับของประเภทเอกสารที่คุณต้องการ
  const customOrder = [
    'ลาพักร้อน', // เอกสารที่ต้องการให้แสดงแรก
    'ใบลากิจ',
    'ใบลาป่วย',
    'อื่นๆ',
  ];
  // สร้าง array ของสีที่จะใช้ในกราฟ
  const colors = [
    "#FE6A35", // สี
    "#2CAFFE", // สี
    "#00E272", // สี
    "#544FC5", // สี
  ];

  // จัดลำดับข้อมูลตามลำดับที่กำหนดใน customOrder
  const sortedCategoryCounts = customOrder.map(category => ({
    category,
    count: categoryCounts[category] || 0, // ตรวจสอบถ้ามีประเภทเอกสารใน categoryCounts หรือไม่
  }));

  // เตรียมข้อมูลสำหรับกราฟ
  const chartData = {
    labels: sortedCategoryCounts.map(item => item.category), // ประเภทเอกสาร
    datasets: [
      {
        label: 'จำนวนเอกสาร',
        data: sortedCategoryCounts.map(item => item.count), // จำนวนเอกสารในแต่ละประเภท
        backgroundColor: sortedCategoryCounts.map((_, index) => colors[index % colors.length]), // ใช้สีแบบวนลูป
        borderColor: "rgba(0,0,0,0.6)", // เพิ่มเงาให้ขอบ
        barThickness: 30, // ควบคุมขนาดแท่ง
        hoverBackgroundColor: sortedCategoryCounts.map((_, index) => colors[index % colors.length]), // สี hover
        hoverBorderColor: "rgba(0,0,0,0.7)", // ขอบ hover
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          generateLabels: function (chart) {
            return customOrder.map((category, index) => ({
              text: category, // ชื่อของประเภทเอกสาร
              fillStyle: colors[index % colors.length], // สีพื้นหลัง
              strokeStyle: colors[index % colors.length], // สีขอบ
              lineWidth: 1,
              hidden: false, // ไม่ซ่อน Legend
              font: {
                family: 'Noto Sans Thai, sans-serif', // ใช้ฟอนต์ Noto Sans Thai
              },
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const category = tooltipItem.label; // ประเภทเอกสาร
            const count = tooltipItem.raw; // จำนวนเอกสาร
            return `${category}: ${count} เอกสาร`; // แสดงข้อความใน Tooltip
          },
        },
        // กำหนดฟอนต์ใน tooltip
        titleFont: {
          family: 'Noto Sans Thai, sans-serif', // ฟอนต์ใน Title ของ Tooltip
        },
        bodyFont: {
          family: 'Noto Sans Thai, sans-serif', // ฟอนต์ในเนื้อหาของ Tooltip
        },
        footerFont: {
          family: 'Noto Sans Thai, sans-serif', // ฟอนต์ใน Footer ของ Tooltip (ถ้ามี)
        },
      },
      title: {
        display: true,
        text: "จำนวนเอกสารในแต่ละประเภท",
        font: {
          size: 16, // ขนาดฟอนต์ใน Title
          family: 'Noto Sans Thai, sans-serif', // ฟอนต์ใน Title
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (value, index, values) {
            return this.getLabelForValue(value).split(' ').join('\n'); // ทำให้ตัวหนังสือหมุน
          },
          font: {
            size: 12, // ขนาดฟอนต์ในแกน X
            family: 'Noto Sans Thai, sans-serif', // ฟอนต์ในแกน X
          },
          maxRotation: 45,
          minRotation: 45, // ให้ตัวหนังสือเอียง
        },
      },
      y: {
        ticks: {
          font: {
            size: 12, // ขนาดฟอนต์ในแกน Y
            family: 'Noto Sans Thai, sans-serif', // ฟอนต์ในแกน Y
          },
        },
      },
    },
  };

  return (
    <div className="">
      <div className="text-left ">
        <h2 className="text-2xl font-bold text-black font-FontNoto">แดชบอร์ด{" "}<span className="font-normal font-FontNoto text-lg">{roleText ? `(${roleText})` : ""}</span>
        </h2>
      </div>
      <h4 className="text-xl text-black font-FontNoto">คุณ {userName}</h4>
      {/* ข้อมูลสถิติ */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {/* แสดงข้อมูลประเภทเอกสาร */}
          {customOrder.map((category, index) => (
            <div key={category} className="bg-white border border-black p-4 rounded-lg shadow-md w-48 flex">
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold font-FontNoto mb-2">{category}</h3>
                <div className="flex items-center">
                  <img
                    src={DIcon} // หรือเปลี่ยนเป็นไอคอนที่เกี่ยวข้องกับประเภทเอกสาร
                    className="w-8 h-8 mr-2"
                  />
                  <p className="text-3xl font-FontNoto">{categoryCounts[category] || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* กราฟแสดงข้อมูล */}
      <div className="mt-10 w-10/12 mx-auto bg-white p-6 rounded-lg shadow-md">
        {isLoading ? (
          <p className="text-center">กำลังโหลดข้อมูลกราฟ...</p>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <span className="label-text font-FontNoto font-bold">

          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            หมายเหตุ: การลาทุกประเภทต้องได้รับการอนุมัติจากหัวหน้างานก่อนจึงสามารถลาได้
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            ลาป่วย: แจ้งล่วงหน้าก่อนเวลาเริ่มงาน 08:30 (30 วัน/ปี)
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            (หากกรณีลาป่วยเกิน 3 วัน แนบใบรับรองแพทย์)
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            ลากิจส่วนตัว: แจ้งล่วงหน้า 1 วัน (7 วัน/ปี อายุงาน 1 ปี หากไม่ถึงพิจารณาเป็นกรณี)
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            ลาพักร้อน: แจ้งล่วงหน้า 7 วัน (7 วัน/ปี อายุงานมากกว่า 1 ปี)
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            ลาคลอดบุตร: แจ้งล่วงหน้า 30 วัน (90 วัน/ปี)
          </span>
        </div>
        <div>
          <span className="label-text font-FontNoto font-bold">
            ลาบวช: แจ้งล่วงหน้า 15 วัน (15 วัน/ปี อายุงานมากกว่า 1 ปี)
          </span>
        </div>
      </div>

    </div>

  );
};

export default EmpHome;
