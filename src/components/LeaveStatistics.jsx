import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Link, NavLink } from "react-router-dom";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LeaveStatistics = () => {
  const [employeeNames, setEmployeeNames] = useState([]);
  const [fileCounts, setFileCounts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [categoryCounts, setCategoryCounts] = useState({});

  const categoryMapping = {
    Certificate: 'ลาป่วย',
    WorkContract: 'ลากิจส่วนตัว',
    Identification: 'ลาพักร้อน',
    Maternity: 'ลาคลอด',
    Ordination: 'ลาบวช',
};

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const filesResponse = await axios.get("https://localhost:7039/api/Files");
        const usersResponse = await axios.get("https://localhost:7039/api/Users");

        const userMapping = usersResponse.data.reduce((acc, user) => {
          acc[user.userID] = `${user.firstName} ${user.lastName}`;
          return acc;
        }, {});

        const fileCountMapping = usersResponse.data.reduce((acc, user) => {
          acc[`${user.firstName} ${user.lastName}`] = 0;
          return acc;
        }, {});

        const categoryCountMapping = Object.keys(categoryMapping).reduce((acc, key) => {
          acc[categoryMapping[key]] = 0; // ตั้งค่าทุกประเภทเอกสารเริ่มต้นเป็น 0
          return acc;
        }, {});

        filesResponse.data
          .filter((file) => file.category !== "Others")
          .forEach((file) => {
            const fileDate = new Date(file.uploadDate);
            if (
              fileDate.getMonth() === selectedMonth &&
              fileDate.getFullYear() === selectedYear
            ) {
              const userName = userMapping[file.userID] || "Unknown";
              fileCountMapping[userName] = (fileCountMapping[userName] || 0) + 1;

              const thaiCategory = categoryMapping[file.category];
              if (thaiCategory) {
                categoryCountMapping[thaiCategory] =
                  (categoryCountMapping[thaiCategory] || 0) + 1;
              }
            }
          });

        setEmployeeNames(Object.keys(fileCountMapping));
        setFileCounts(Object.values(fileCountMapping));
        setCategoryCounts(categoryCountMapping);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchFileData();
  }, [selectedMonth, selectedYear]);

  const createChartData = () => {
    return {
      labels: employeeNames,
      datasets: [
        {
          label: `จำนวนการลาพนักงานในเดือน ${selectedMonth + 1} ปี ${selectedYear}`,
          data: fileCounts,
          backgroundColor: "#3B82F6",
        },
      ],
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
            return `จำนวนการลา: ${tooltipItem.raw}`;
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
    barThickness: 25, // ลดความหนาของแท่งกราฟ
  };


  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2024 + i); // ปี 2024 ถึง 2034

  return (
    <div className="flex flex-col min-h-screen">

      {/* Main Content */}
      <div className="flex min-h-screen bg-base-200">
        {/* Content */}
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
                <option key={index} value={index}>{month}</option>
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
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {/* ข้อมูลประเภทเอกสาร */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {Object.keys(categoryCounts).map((category) => (
              <div key={category} className="bg-white border border-black p-4 rounded-lg shadow-md w-48 flex">
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
              style={{ border: '5px solid white', maxWidth: '60%' }}
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
