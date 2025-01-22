import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Emp_login.css';
import imgPath from '../assets/2.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Emp_login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // จัดการการมองเห็นรหัสผ่าน


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      setIsLoading(false);
      return;
    }

    const data = JSON.stringify({
      email: email,
      passwordHash: password,
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://localhost:7039/api/Users/Login',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      if (response.status === 200) {
        setError('');
        // alert('เข้าสู่ระบบสำเร็จ');
        setIsLoggedIn(true);
        sessionStorage.setItem('userId', response.data.userid);
        sessionStorage.setItem('token', response.data.token);


        navigate('/EmpHome');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('กรุณาลองใหม่อีกครั้ง');
      }
      console.error('Login failed:', err.response || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="emp_login-container">
      <div className="emp-card w-80 bg-gray-800 text-white shadow-2xl rounded-lg">
        <div className="flex justify-center items-center mt-5">
          <img
            src={imgPath}
            width="100"
            height="100"
            className="rounded-full border-4 border-blue-400"
            alt="Employee Avatar"
          />
        </div>
        <div className="card-body p-6">
          <h3 className="text-center text-2xl font-semibold mb-6">
            เข้าสู่ระบบพนักงาน
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="input bg-gray-700 text-white w-full pl-10 py-3 rounded-md border border-gray-600"
                  placeholder="อีเมลที่ใช้สมัคร"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'} // เปลี่ยน type ตาม state
                  className="input bg-gray-700 text-white w-full pl-10 py-3 rounded-md border border-gray-600"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* ไอคอนแสดง/ซ่อนรหัสผ่าน */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center items-center mt-6">
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
            <a
              href="/ForgotPassword"
              className="text-sm text-blue-300 hover:text-blue-400 hover:underline"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>
          {error && (
            <div className="text-red-400 mt-4 text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emp_login;
