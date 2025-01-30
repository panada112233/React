import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import { Bar } from "react-chartjs-2";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalDocuments: 0,
    totalExperience: 0,
  });
  const [employeeData, setEmployeeData] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [userinfostate, setuserinfoState] = useState(0);

  const categoryMapping = {
    Certificate: 'ใบลาป่วย',
    WorkContract: 'ใบลากิจ',
    Identification: 'ใบลาพักร้อน',
    Maternity: 'ใบลาคลอด',
    Ordination: 'ใบลาบวช',
    Doc: 'เอกสารส่วนตัว',
    Others: 'อื่นๆ',
  };

  const fectUserinfo = async () => {
    try {
      const responseUser = await GetUser();
      console.log("Response from GetUser:", responseUser);

      if (!responseUser || !responseUser.userid) {
        throw new Error("User ID not found in response");
      }

      setuserinfoState(responseUser.userid); // ตั้งค่า userinfostate
      setAdminName(responseUser.name || "ไม่มีชื่อแอดมิน");
      setProfilePic(
        responseUser.profilePictureUrl
          ? `http://localhost${responseUser.profilePictureUrl}`
          : "/uploads/admin/default-profile.jpg"
      );
    } catch (e) {
      console.error("Error fetching user info:", e);
    }
  };


  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("https://localhost:7039/api/Files");
        const counts = response.data.reduce((acc, doc) => {
          const category = categoryMapping[doc.category] || 'อื่นๆ';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, { 'ใบลาป่วย': 0, 'ใบลากิจ': 0, 'ใบลาพักร้อน': 0, 'ใบลาคลอด': 0, 'ใบลาบวช': 0, 'เอกสารส่วนตัว': 0, 'อื่นๆ': 0 });

        setCategoryCounts(counts);
        setFilesData(response.data);
        setStatistics(prevStats => ({
          ...prevStats,
          totalDocuments: response.data.length,
        }));

        await fectUserinfo()

      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    const fetchData = async () => {
      try {
        const employeeResponse = await axios.get("https://localhost:7039/api/Users");
        const experienceResponse = await axios.get("https://localhost:7039/api/WorkExperiences");

        if (employeeResponse.status === 200) {
          setEmployeeData(employeeResponse.data);
          setStatistics(prevStats => ({
            ...prevStats,
            totalEmployees: employeeResponse.data.length,
            totalExperience: experienceResponse.data.length,
          }));
          fetchDocuments(); // Fetch document data
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    if (!userinfostate) {
      console.error("User ID is missing, cannot update admin name");
      setUploadMessage(<p className="text-red-500 font-FontNoto">กรุณาตรวจสอบข้อมูลผู้ใช้</p>);
      return;
    }

    const formData = new FormData();
    formData.append("name", adminName);
    formData.append("id", userinfostate);

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

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getUniqueYears = () => {
    const startYear = 2024;
    const endYear = 2034;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    return years;
  };

  const createEmployeesChartData = () => {
    const months = Array.from({ length: 12 }, (_, i) => `เดือน ${i + 1}`);
    const employeeCounts = Array.from({ length: 12 }, (_, i) =>
      employeeData.filter(
        employee =>
          new Date(employee.createdAt).getFullYear() === selectedYear &&
          new Date(employee.createdAt).getMonth() === i
      ).length
    );

    return {
      labels: months,
      datasets: [
        {
          label: `จำนวนพนักงานที่เพิ่มในปี ${selectedYear}`,
          data: employeeCounts,
          backgroundColor: "#34D399",
        },
      ],
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: 'Noto Sans Thai, sans-serif', // ใช้ฟอนต์ Noto Sans Thai
              }
            }
          },
          y: {
            ticks: {
              font: {
                family: 'Noto Sans Thai, sans-serif', // ใช้ฟอนต์ Noto Sans Thai
              }
            }
          }
        }
      }
    };
  };

  const createDocumentsChartData = () => {
    const months = Array.from({ length: 12 }, (_, i) => `เดือน ${i + 1}`);
    const categories = Object.values(categoryMapping);

    // เตรียมข้อมูลสำหรับแต่ละหมวดหมู่ในแต่ละเดือน
    const categoryData = categories.map(category => {
      return Array.from({ length: 12 }, (_, i) =>
        filesData.filter(
          f =>
            new Date(f.uploadDate).getFullYear() === selectedYear &&
            new Date(f.uploadDate).getMonth() === i &&
            categoryMapping[f.category] === category
        ).length
      );
    });
    return {
      labels: months,
      datasets: categories.map((category, index) => ({
        label: category,
        data: categoryData[index],
        backgroundColor: [
          'rgba(0, 255, 0, 1)', // สีเขียวสด
          'rgba(0, 194, 233, 1)', // สีน้ำเงินสด
          'rgba(255, 0, 0, 1)', // สีแดงสด
          'rgba(255, 20, 147, 0.7)',
          'rgba(255, 252, 0, 1)', // สีเหลืองสด
          ' rgba(152, 60, 0, 1)',
          'rgba(145, 0, 203, 1)',
        ][index], // เลือกสีตามลำดับหมวดหมู่
      })),
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: {
            ticks: {
              font: {
                family: 'Noto Sans Thai, sans-serif', // ใช้ฟอนต์ Noto Sans Thai
              }
            }
          },
          y: {
            ticks: {
              font: {
                family: 'Noto Sans Thai, sans-serif', // ใช้ฟอนต์ Noto Sans Thai
              }
            }
          }
        }
      }
    };
  };

  const trendsChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

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
            <li><NavLink to="/AdminDashboard" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>Dashboard</NavLink></li>
            <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
            <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>
        {/* Content */}
        <div className="flex-1 p-10 bg-white shadow-lg rounded-lg ml-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-black font-FontNoto">แดชบอร์ด แอดมิน</h2>
              <Link to="/AdminManagement" className="btn btn-outline font-FontNoto mt-2">
                ข้อมูลแอดมิน
              </Link>
            </div>
            <div className="form-control w-80 p-2 border border-gray-300 rounded-lg shadow-lg bg-white">
              <label htmlFor="yearSelect" className="label flex items-center justify-between">
                <span className="label-text font-FontNoto" style={{ fontSize: '0.25 rem' }}>
                  เลือกปี:
                </span>
                <select
                  id="yearSelect"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="select select-bordered font-FontNoto w-60 text-black"
                >
                  {getUniqueYears().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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
                    />
                    <p className="text-3xl font-FontNoto">{categoryCounts[category]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Chart Section */}
          <div className="flex justify-center gap-4 mt-6 flex-nowrap">
            {/* Chart for Employee Growth */}
            {/* <div
              className="card bg-base-100 shadow-lg p-4 flex-grow"
              style={{ border: '1px solid white', maxWidth: '42%' }}
            >
              <h3 className="text-lg font-bold text-black mb-4 font-FontNoto">
                แนวโน้มการเพิ่มจำนวนพนักงาน
              </h3>
              <Bar data={createEmployeesChartData()} options={trendsChartOptions} />
            </div> */}
            {/* Chart for Document Growth */}
            <div
              className="card bg-base-100 shadow-lg p-4 flex-grow"
              style={{ border: '1px solid white', maxWidth: '60%' }}
            >
              <h3 className="text-lg font-bold text-black mb-4 font-FontNoto text-center">
                แนวโน้มการเพิ่มจำนวนไฟล์เอกสาร
              </h3>
              <Bar className="font-FontNoto" data={createDocumentsChartData()} options={trendsChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


