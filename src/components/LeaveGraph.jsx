import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import DIcon from '../assets/12.png';
import { GetUser } from '../function/apiservice'
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

const LeaveGraph = () => {
  const [fileData, setFileData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [fileCounts, setFileCounts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [isEditingName, setIsEditingName] = useState(false); // เพิ่มตัวแปร isEditingName
  const [uploadMessage, setUploadMessage] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [documentTypes, setDocumentTypes] = useState([]);

  const categoryMapping = {
    Certificate: 'ลาป่วย',
    WorkContract: 'ลากิจส่วนตัว',
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

        filesResponse.data
          .filter((file) => file.category !== "Others" && file.category !== "Doc") // กรอง Others และ Doc
          .forEach((file) => {
            const fileDate = new Date(file.uploadDate);
            if (
              fileDate.getMonth() === selectedMonth &&
              fileDate.getFullYear() === selectedYear
            ) {
              const userName = userMapping[file.userID] || "Unknown";
              const thaiCategory = categoryMapping[file.category];
              if (thaiCategory) {
                groupedData[userName][thaiCategory] =
                  (groupedData[userName][thaiCategory] || 0) + 1;
                categoryCountData[thaiCategory] =
                  (categoryCountData[thaiCategory] || 0) + 1;
              }
            }
          });

        setEmployeeNames(Object.keys(groupedData));
        setFileData(groupedData);
        setCategoryCounts(categoryCountData); // อัปเดตข้อมูลประเภทเอกสาร
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchFileData();
  }, [selectedMonth, selectedYear]);

  const createChartData = () => {
    const totalDocuments = employeeNames.map((name) =>
      documentTypes.reduce((sum, type) => sum + (fileData[name][type] || 0), 0)
    );

    const colors = [
      "#66FF99",
      "#66CCFF",
      "#FF3366",
      "#FF99CC",
      "#FFC300",
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
        backgroundColor: "#778899", // สีสำหรับข้อมูลรวม
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

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await GetUser(); // ใช้ฟังก์ชันจาก apiservice
        setAdminName(response.name || "ไม่มีชื่อแอดมิน");
        setProfilePic(
          response.profilePictureUrl
            ? `http://localhost${response.profilePictureUrl}`
            : "/uploads/admin/default-profile.jpg"
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      }
    };

    fetchAdminInfo();
  }, []);


  const handleProfilePicChange = (event) => {
    const file = event.target.files[0]; // เลือกไฟล์แรกจากไฟล์ที่เลือก
    if (file) {
      setSelectedFile(file); // เก็บไฟล์ที่เลือกลงใน state
      // อัปเดตข้อความแสดงชื่อไฟล์
      document.getElementById("fileName").textContent = file.name;
    } else {
      // ถ้าไม่ได้เลือกไฟล์ ให้แสดงข้อความเริ่มต้น
      document.getElementById("fileName").textContent = "ไม่ได้เลือกไฟล์";
    }
  };

  const handleNameUpdate = async () => {
    if (!adminName) {
      console.error("Admin name is empty, cannot update.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">กรุณากรอกชื่อแอดมิน</p>);
      return;
    }

    // ดึงข้อมูล User ID จาก localStorage
    const userInfo = JSON.parse(localStorage.getItem("userinfo"));
    if (!userInfo || !userInfo.userid) {
      console.error("User ID is missing in localStorage.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">ไม่พบข้อมูลผู้ใช้</p>);
      return;
    }

    const formData = new FormData();
    formData.append("name", adminName);
    formData.append("id", userInfo.userid);

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setIsEditingName(false);
      setUploadMessage(<p className="text-green-500 font-FontNoto">บันทึกชื่อสำเร็จ!</p>);
    } catch (error) {
      console.error("Error updating admin name:", error.response?.data || error);
      setUploadMessage(<p className="text-red-500 font-FontNoto">เกิดข้อผิดพลาดในการบันทึกชื่อ</p>);
    }
  };


  // อัปโหลดรูปโปรไฟล์ใหม่
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage(
        <p className="font-FontNoto text-red-500">กรุณาเลือกไฟล์ก่อนอัปโหลด</p>
      );
      return;
    }

    var userinfolocalStorage = localStorage.getItem('userinfo')
    const objUser = JSON.parse(userinfolocalStorage)
    console.log(objUser.userid)


    const formData = new FormData();
    formData.append("profilePictures", selectedFile); // ส่งเฉพาะรูปภาพ
    formData.append("id", objUser.userid);
    console.log(formData)
    try {
      const response = await axios.post("https://localhost:7039/api/Admin/UpdateAdminInfo", formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.profilePictureUrl) {
        const profilePictureUrl = `http://localhost/${response.data.profilePictureUrl}`;
        setProfilePic(profilePictureUrl);
        setUploadMessage(
          <p className="font-FontNoto text-green-500">อัปโหลดสำเร็จ!</p>
        );
      } else {
        setUploadMessage(
          <p className="font-FontNoto text-red-500">
            อัปโหลดสำเร็จ แต่ไม่ได้รับ URL ของรูปโปรไฟล์
          </p>
        );
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);

      const errorMessage =
        error.response?.data?.Message || "เกิดข้อผิดพลาดในการอัปโหลด";
      setUploadMessage(
        <p className="font-FontNoto text-red-500">{errorMessage}</p>
      );
    }
  };

  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2024 + i); // ปี 2024 ถึง 2034

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="navbar bg-amber-400 shadow-lg">
        <div className="flex-1">
          <div className="text-xl font-bold text-black bg-amber-400 p-4 rounded-md font-FontNoto">
            ระบบจัดเก็บเอกสารพนักงาน
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen bg-base-200">
        {/* Sidebar */}
        <div className="w-1/6 bg-white shadow-lg p-6 rounded-lg">
          <div className="">
            <div className="font-FontNoto">
              {uploadMessage && <div>{uploadMessage}</div>}
            </div>

            <div className="flex flex-col items-center justify-center">
              {profilePic && (
                <img
                  src={profilePic}
                  alt="Admin Profile"
                  className="rounded-full border-4 border-yellow-500 object-cover w-32 h-32"
                />
              )}
              <p className="text-lg text-black font-FontNoto mt-4">
                {adminName || "กำลังโหลด..."}
              </p>
            </div>
            <div className="mt-4">
              {!isEditingName ? (
                <div className="flex items-center">

                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-2 text-sm text-blue-500 hover:underline font-FontNoto"
                  >
                    คลิกเพื่อเปลี่ยนชื่อแอดมิน
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="border border-gray-300 rounded-md p-1 bg-white text-black font-FontNoto"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="ml-2 text-sm text-green-500 hover:underline font-FontNoto"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="ml-2 text-sm text-red-500 hover:underline font-FontNoto"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center space-x-2">
              <div className="flex items-center space-x-1 p-0.25 border border-gray-200 rounded-md w-48">
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-xs py-1 px-2 bg-gray-200 text-black rounded-md font-FontNoto"
                >
                  เลือกไฟล์
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
                <span id="fileName" className="text-xs text-black font-FontNoto py-1 px-2 ">
                  ไม่ได้เลือกไฟล์
                </span>
              </div>

              <button
                onClick={handleUpload}
                className="cursor-pointer text-xs py-1 px-2 bg-gray-200 rounded-md font-FontNoto"
              >
                อัปโหลด
              </button>
            </div>
          </div>

          <ul className="menu bg-base-100 text-black rounded-box w-full text-lg">
            <li><Link to="/AdminDashboard" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">Dashboard</Link></li>
            <li><NavLink to="/LeaveGraph" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>สถิติการลาพนักงาน</NavLink></li>
            <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>
        {/* Content */}
        <div className="flex-1 p-10 bg-white shadow-lg rounded-lg ml-1">
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

export default LeaveGraph;
