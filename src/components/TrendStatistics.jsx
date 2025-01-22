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

    const categoryMapping = {
        Identification: 'ลาพักร้อน',
        WorkContract: 'ใบลากิจ',
        Certificate: 'ใบลาป่วย',
        Others: 'อื่นๆ',
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get("https://localhost:7039/api/Files");
                const counts = response.data.reduce((acc, doc) => {
                    const category = categoryMapping[doc.category] || 'อื่นๆ';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, { 'ใบลากิจ': 0, 'ลาพักร้อน': 0, 'ใบลาป่วย': 0, 'อื่นๆ': 0 });

                setCategoryCounts(counts);
                setFilesData(response.data);
                setStatistics(prevStats => ({
                    ...prevStats,
                    totalDocuments: response.data.length,
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
        const documentCounts = Array.from({ length: 12 }, (_, i) =>
            filesData.filter(
                f =>
                    new Date(f.uploadDate).getFullYear() === selectedYear &&
                    new Date(f.uploadDate).getMonth() === i
            ).length
        );

        return {
            labels: months,
            datasets: [
                {
                    label: `จำนวนไฟล์เอกสารที่เพิ่มในปี ${selectedYear}`,
                    data: documentCounts,
                    backgroundColor: "#3B82F6",
                }
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

                        <h2 className="text-2xl font-bold text-black font-FontNoto">สถิติแนวโน้มพนักงาน</h2>

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
                            <div key={category} className="bg-white border border-black p-4 rounded-lg shadow-md w-48 flex">
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
                        <div
                            className="card bg-base-100 shadow-lg p-4 flex-grow"
                            style={{ border: '1px solid white', maxWidth: '42%' }}
                        >
                            <h3 className="text-lg font-bold text-black mb-4 font-FontNoto">
                                แนวโน้มการเพิ่มจำนวนพนักงาน
                            </h3>
                            <Bar data={createEmployeesChartData()} options={trendsChartOptions} />
                        </div>
                        {/* Chart for Document Growth */}
                        <div
                            className="card bg-base-100 shadow-lg p-4 flex-grow"
                            style={{ border: '1px solid white', maxWidth: '42%' }}
                        >
                            <h3 className="text-lg font-bold text-black mb-4 font-FontNoto">
                                แนวโน้มการเพิ่มจำนวนไฟล์เอกสาร
                            </h3>
                            <Bar data={createDocumentsChartData()} options={trendsChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendStatistics;
