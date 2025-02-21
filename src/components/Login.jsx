import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Admin_login.css';
import '../Emp_login.css';
import imgPath from '../assets/2.png';
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = ({ setIsLoggedIn }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        const url = isEmail
            ? "http://localhost:7039/api/Users/Login"   // ✅ ใช้ API ของพนักงาน
            : "http://localhost:7039/api/Admin/login";  // ✅ ใช้ API ของแอดมิน

        const data = isEmail
            ? { email: identifier, passwordHash: password }
            : { username: identifier, password };

        try {
            const response = await axios.post(url, data);

            if (response.status === 200) {
                const res = response.data;
                console.log(response.data.userid)
                if (res === null) {
                    setError('ไม่พบข้อมูล role ของพนักงาน');
                    return;
                }
                const userinfo = JSON.stringify(response.data)

                setIsLoggedIn(true);
                localStorage.setItem('userinfo', JSON.stringify(response.data));

                sessionStorage.setItem('userId', response.data.userid);
                if (isEmail) {
                    sessionStorage.setItem('role', response.data.role); // เก็บ role สำหรับพนักงานเท่านั้น
                }

                sessionStorage.setItem('isAdmin', !isEmail); // บันทึกสถานะแอดมิน
                navigate(isEmail ? '/EmpHome' : '/AdminDashboard');
            }
        } catch (err) {
            console.log(err)
            if (err.response && err.response.status === 401) {
                setError('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
            } else {
                setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="emp_login-container">
            <div className="emp-card">
                <div className="flex justify-center items-center mt-5">
                    <img
                        src={imgPath}
                        width="100"
                        height="100"
                        className="rounded-full border-4 border-yellow-400"
                        alt="Employee Avatar"
                    />
                </div>
                <div className="card-body p-6">
                    <h3 className="text-center text-2xl font-semibold mb-6 text-black font-FontNoto">
                        เข้าสู่ระบบ
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <input
                                type="text"
                                className="input bg-gray-700 text-white w-full py-3 px-4 rounded-md border border-gray-600 font-FontNoto"
                                placeholder="อีเมลที่ใช้สมัคร"
                                value={identifier}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // กรองเฉพาะภาษาอังกฤษและตัวเลข
                                    if (/^[a-zA-Z0-9@._-]*$/.test(value)) {
                                        setIdentifier(value);
                                    }
                                }}
                                required
                            />
                        </div>
                        <div className="mb-5 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input bg-gray-700 text-white w-full py-3 px-4 rounded-md border border-gray-600 font-FontNoto"
                                placeholder="รหัสผ่าน"
                                value={password}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // กรองเฉพาะภาษาอังกฤษและตัวเลข
                                    if (/^[a-zA-Z0-9]*$/.test(value)) {
                                        setPassword(value);
                                    }
                                }}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 font-FontNoto"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        {error && <div className="text-red-400 mt-4 text-center font-FontNoto">{error}</div>}
                        <div className="flex justify-center items-center mt-6 font-FontNoto">
                            <button
                                type="submit"
                                className="btn bg-blue-400 hover:bg-blue-500 text-gray-800 font-bold py-2 px-6 rounded-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 text-center">
                        <Link to="/ForgotPassword" className="text-sm text-yellow-500 hover:text-yellow-600 hover:underline font-FontNoto font-bold">
                            ลืมรหัสผ่าน?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
