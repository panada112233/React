import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import axios from "axios";
import DIcon from '../assets/12.png';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LeaveStatistics = () => {
  const [employeeNames, setEmployeeNames] = useState([]);
  const [fileData, setFileData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [categoryCounts, setCategoryCounts] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  const categoryMapping = {
    Certificate: 'ลาป่วย',
    WorkContract: 'ลากิจ',
    Identification: 'ลาพักร้อน',
    Maternity: 'ลาคลอด',
    Ordination: 'ลาบวช',
  };
  const categoryMappingg = {
    "A461E72F-B9A3-4F9D-BF69-1BBE6EA514EC": "ลาป่วย",
    "6CF7C54A-F9BA-4151-A554-6487FDD7ED8D": "ลาพักร้อน",
    "1799ABEB-158C-479E-A9DC-7D45E224E8ED": "ลากิจ",
    "DAA14555-28E7-497E-B1D8-E0DA1F1BE283": "ลาคลอด",
    "AE3C3A05-1FCB-4B8A-9044-67A83E781ED6": "ลาบวช",
  };

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const filesResponse = await axios.get("https://localhost:7039/api/Files");
        const usersResponse = await axios.get("https://localhost:7039/api/Users");
        const leaveResponse = await axios.get("https://localhost:7039/api/Document/GetAllCommitedDocuments");

        console.log("📌 จำนวนพนักงานที่ดึงมา:", usersResponse.data.length);

        const userMapping = usersResponse.data.reduce((acc, user) => {
          acc[user.userID] = `${user.firstName} ${user.lastName}`;
          return acc;
        }, {});

        const docTypes = Object.values(categoryMapping); // ใช้ชื่อไทยจาก categoryMapping
        setDocumentTypes(docTypes);

        const groupedData = {};
        const categoryCountData = {}; // ตัวแปรสำหรับนับ category

        usersResponse.data.forEach((user) => {
          const userName = `${user.firstName} ${user.lastName}`;
          groupedData[userName] = docTypes.reduce((typeCount, type) => {
            typeCount[type] = 0;
            return typeCount;
          }, {});
        });

        leaveResponse.data.forEach((doc) => {
          if (!doc || !doc.userId) {
            console.warn("⚠️ พบข้อมูลเอกสารที่ไม่มี userId:", doc);
            return;
          }
  
          const docDate = new Date(doc.sentToHrdate);
          if (docDate.getMonth() === selectedMonth && docDate.getFullYear() === selectedYear) {
            const leaveTypeKey = doc.leaveTypeId?.trim().toUpperCase();
            console.log("🔍 ตรวจสอบ leaveTypeKey:", leaveTypeKey);
            console.log("🛠️ categoryMappingg:", categoryMappingg);
  
            if (!categoryMappingg.hasOwnProperty(leaveTypeKey)) {
              console.warn("⚠️ ไม่มีค่าใน categoryMappingg สำหรับ leaveTypeKey:", leaveTypeKey);
              return;
            }
  
            const leaveName = categoryMappingg[leaveTypeKey];
            console.log("📌 leaveName ที่ได้:", leaveName);
  
            if (!leaveName) {
              console.warn("⚠️ ไม่พบประเภทใบลา:", leaveTypeKey);
              return;
            }
  
            const userName = userMapping[doc.userId];
  
            if (!userName || userName === "Unknown") {
              console.warn("⚠️ ข้ามข้อมูลของพนักงานที่ไม่รู้จัก:", doc);
              return;
            }
  
            console.log("👤 userName:", userName);
  
            if (!groupedData[userName]) {
              groupedData[userName] = {};
            }
  
            if (!groupedData[userName].hasOwnProperty(leaveName)) {
              console.warn(`⚠️ ไม่พบประเภทใบลา '${leaveName}' ใน groupedData[${userName}]. กำหนดค่าเริ่มต้นเป็น 0`);
              groupedData[userName][leaveName] = 0;
            }
  
            groupedData[userName][leaveName] += 1;
            categoryCountData[leaveName] = (categoryCountData[leaveName] || 0) + 1;
          }
        });
  
        filesResponse.data
          .filter((file) => file.category !== "Others" && file.category !== "Doc")
          .forEach((file) => {
            if (!file || !file.userID) {
              console.warn("⚠️ พบไฟล์ที่ไม่มี userID:", file);
              return;
            }
  
            const fileDate = new Date(file.uploadDate);
            if (fileDate.getMonth() === selectedMonth && fileDate.getFullYear() === selectedYear) {
              const userName = userMapping[file.userID];
  
              if (!userName || userName === "Unknown") {
                console.warn("⚠️ ข้ามเอกสารของพนักงานที่ไม่รู้จัก:", file);
                return;
              }
  
              const thaiCategory = categoryMapping[file.category];
  
              if (thaiCategory) {
                if (!groupedData[userName]) {
                  groupedData[userName] = {};
                }
  
                groupedData[userName][thaiCategory] = (groupedData[userName][thaiCategory] || 0) + 1;
                categoryCountData[thaiCategory] = (categoryCountData[thaiCategory] || 0) + 1;
              }
            }
          });
  
        setEmployeeNames(Object.keys(groupedData).filter(name => name !== "Unknown"));
        setFileData(groupedData);
        setCategoryCounts(categoryCountData);
  
        console.log("📌 รายชื่อพนักงานที่ได้หลังอัปเดต:", Object.keys(groupedData));
  
      } catch (error) {
        console.error("❌ Error fetching file data:", error);
      }
    };
  
    fetchFileData();
  }, [selectedMonth, selectedYear]);


  const createChartData = () => {
    const totalDocuments = employeeNames.map((name) =>
      documentTypes.reduce((sum, type) => sum + (fileData[name][type] || 0), 0)
    );

    const colors = [
      "#4CAF50", // เขียวสดใส (ใบลาป่วย)
      "#2196F3", // ฟ้าเข้ม (ใบลากิจ)
      "#FF5722", // ส้มเข้ม (ใบลาพักร้อน)
      "#E91E63", // ชมพูสด (ใบลาคลอด)
      "#FFC107", // เหลืองสด (ใบลาบวช)
    ];

    const datasets = [
      ...documentTypes.map((type, index) => ({
        label: type,
        data: employeeNames.map((name) => fileData[name][type] || 0),
        backgroundColor: colors[index % colors.length], // ใช้สีวนซ้ำหากจำนวนประเภทเอกสารเกินสีที่กำหนด
      })),
      {
        label: "รวมใบลา",
        data: totalDocuments,
        backgroundColor: "#607D8B", // สีสำหรับข้อมูลรวม
      },
    ];

    return {
      labels: employeeNames,
      datasets: datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label; // ชื่อประเภทเอกสาร
            const value = tooltipItem.raw; // ค่าของข้อมูลในจุดนี้
            return `${datasetLabel}: ${value}`; // แสดงชื่อเอกสารและจำนวน
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Math.floor(value);
          },
        },
        title: {
          display: true,
          text: "จำนวนการลา",
          font: {
            size: 14,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    barThickness: 15, // ลดความหนาของแท่งกราฟ
  };

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2024 + i); // ปี 2024 ถึง 2034

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex min-h-screen bg-base-200">
        <div className="flex-1 p-6 bg-white shadow-lg rounded-lg ml-1">
          <Link to="/EmpHome/TrendStatistics" className="btn btn-outline btn-success font-FontNoto mt-2" style={{ marginRight: '10px' }}>
            สถิติแนวโน้ม
          </Link>
          <Link to="/EmpHome/LeaveStatistics" className="btn btn-outline btn-error font-FontNoto mt-2">
            สถิติการลา
          </Link>
          <div className="mb-6"></div>
          <h2 className="text-2xl font-bold text-black font-FontNoto">สถิติการลาพนักงาน</h2>
          <div className="flex items-center justify-end space-x-4 mb-4">
            <label htmlFor="monthSelect" className="font-FontNoto text-black">เลือกเดือน:</label>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="select select-bordered w-40 text-black font-FontNoto"
            >
              {months.map((month, index) => (
                <option className="font-FontNoto" key={index} value={index}>{month}</option>
              ))}
            </select>

            <label htmlFor="yearSelect" className="font-FontNoto text-black">เลือกปี:</label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="select select-bordered w-40 text-black font-FontNoto"
            >
              {years.map((year) => (
                <option className="font-FontNoto" key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* ข้อมูลประเภทเอกสาร */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {Object.keys(categoryCounts).map((category) => (
              <div key={category} className="bg-white border border-black p-4 rounded-lg shadow-md w-40 flex">
                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-lg font-bold font-FontNoto mb-2">{category}</h3>
                  <div className="flex items-center">
                    <img
                      src={DIcon}
                      className="w-8 h-8 mr-2"
                      alt="icon"
                    />
                    <p className="text-3xl font-FontNoto">{categoryCounts[category]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center mt-6">
            <div
              className="card bg-base-100 shadow-lg p-4 flex-grow"
              style={{ border: '5px solid white', maxWidth: '70%' }}
            >
              <h3 className="text-lg font-bold text-black mb-4 font-FontNoto">
                สถิติการลาของพนักงาน
              </h3>
              <div className="w-full max-w-screen-md">
                <Bar data={createChartData()} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStatistics;
