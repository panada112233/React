import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
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

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TrendStatistics = () => {
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
    const [leaveData, setLeaveData] = useState([]); // ✅ เพิ่ม state สำหรับเก็บข้อมูลใบลา


    const categoryMapping = {
        Certificate: 'ใบลาป่วย',
        WorkContract: 'ใบลากิจ',
        Identification: 'ใบลาพักร้อน',
        Maternity: 'ใบลาคลอด',
        Ordination: 'ใบลาบวช',
        Doc: 'เอกสารส่วนตัว',
        Others: 'อื่นๆ',
    };

    const categoryMappingg = {
        "A461E72F-B9A3-4F9D-BF69-1BBE6EA514EC": "ใบลาป่วย",
        "6CF7C54A-F9BA-4151-A554-6487FDD7ED8D": "ใบลาพักร้อน",
        "1799ABEB-158C-479E-A9DC-7D45E224E8ED": "ใบลากิจ",
        "DAA14555-28E7-497E-B1D8-E0DA1F1BE283": "ใบลาคลอด",
        "AE3C3A05-1FCB-4B8A-9044-67A83E781ED6": "ใบลาบวช",
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get("https://localhost:7039/api/Files");
                const leaveResponse = await axios.get("https://localhost:7039/api/Document/GetAllCommitedDocuments");

                setLeaveData(leaveResponse.data); // ✅ เก็บข้อมูลใบลาใน state

                const counts = {
                    'ใบลาป่วย': 0,
                    'ใบลากิจ': 0,
                    'ใบลาพักร้อน': 0,
                    'ใบลาคลอด': 0,
                    'ใบลาบวช': 0,
                    'เอกสารส่วนตัว': 0,
                    'อื่นๆ': 0
                };

                response.data.forEach((doc) => {
                    const category = categoryMapping[doc.category] || 'อื่นๆ';
                    counts[category] = (counts[category] || 0) + 1;
                });

                leaveResponse.data.forEach((doc) => {
                    const category = categoryMappingg[doc.leaveTypeId.toUpperCase()] || "อื่นๆ";
                    counts[category] = (counts[category] || 0) + 1;
                });

                setCategoryCounts(counts);
                setFilesData(response.data);
                setStatistics(prevStats => ({
                    ...prevStats,
                    totalDocuments: response.data.length + leaveResponse.data.length,
                }));
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
                    fetchDocuments(); // ✅ โหลดข้อมูลเอกสาร
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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

        // ✅ รวมข้อมูลใบลาเข้าไปในประเภทเอกสารหลัก
        const mergedCategoryMapping = {
            ...categoryMapping,
            ...categoryMappingg,
        };

        console.log("📊 Merged Category Mapping:", mergedCategoryMapping);

        // ✅ เตรียมข้อมูลแต่ละหมวดหมู่สำหรับแต่ละเดือน
        const categoryData = categories.map(category => {
            return Array.from({ length: 12 }, (_, i) => {
                const uploadCount = filesData.filter(
                    f =>
                        new Date(f.uploadDate).getFullYear() === selectedYear &&
                        new Date(f.uploadDate).getMonth() === i &&
                        categoryMapping[f.category] === category
                ).length;

                const leaveCount = leaveData.filter(
                    f =>
                        new Date(f.startdate).getFullYear() === selectedYear &&
                        new Date(f.startdate).getMonth() === i &&
                        categoryMappingg[f.leaveTypeId.toUpperCase()] === category
                ).length;

                return uploadCount + leaveCount; // ✅ รวมค่าทั้งสอง
            });
        });

        console.log("📊 categoryData:", categoryData);

        return {
            labels: months,
            datasets: categories.map((category, index) => ({
                label: category,
                data: categoryData[index],
                backgroundColor: [
                    'rgba(0, 255, 0, 1)',
                    'rgba(0, 194, 233, 1)',
                    'rgba(255, 0, 0, 1)',
                    'rgba(255, 20, 147, 0.7)',
                    'rgba(255, 252, 0, 1)',
                    'rgba(152, 60, 0, 1)',
                    'rgba(145, 0, 203, 1)',
                ][index],
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
                                family: 'font-FontNoto', // ใช้ฟอนต์ Noto Sans Thai
                            }
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                family: 'font-FontNoto', // ใช้ฟอนต์ Noto Sans Thai
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
                    <div className="flex justify-between items-center mb-3">

                        <h2 className="text-2xl font-bold text-black font-FontNoto">สถิติแนวโน้มไฟล์เอกสาร</h2>

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

export default TrendStatistics;
