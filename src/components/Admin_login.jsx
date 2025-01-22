import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Admin_login.css';
import imgPath from '../assets/c.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Admin_login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // จัดการการมองเห็นรหัสผ่าน

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // เรียก API เพื่อตรวจสอบการล็อกอิน
      const response = await fetch('https://localhost:7039/api/Admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('เข้าสู่ระบบสำเร็จ!');

        // เก็บข้อมูลใน sessionStorage หรือ localStorage
        sessionStorage.setItem('adminId', data.adminId); // เก็บ userId
        sessionStorage.setItem('token', data.token); // เก็บ token

        // ตั้งสถานะล็อกอิน
        setIsLoggedIn(true);

        // เปลี่ยนเส้นทางไปยังหน้า AdminDashboard
        navigate('/AdminDashboard');
      } else {
        alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการล็อกอิน:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่!');
    }
  };

  return (
    <div className="admin_login-container">
      <div className="admin-card w-80 bg-gray-800 text-white shadow-2xl rounded-lg">
        <div className="flex justify-center items-center mt-5">
          <img
            src={imgPath}
            width="100"
            height="100"
            className="rounded-full border-4 border-yellow-400"
            alt="Admin Avatar"
          />
        </div>
        <div className="card-body p-6">
          <h3 className="text-center text-2xl font-semibold mb-6">
            เข้าสู่ระบบแอดมิน
          </h3>
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-400">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input bg-gray-700 text-white w-full pl-10 py-3 rounded-md border border-gray-600"
                  placeholder="ชื่อผู้ใช้"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-400">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'} // เปลี่ยน type ตาม state
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input bg-gray-700 text-white w-full pl-10 py-3 rounded-md border border-gray-600"
                  placeholder="รหัสผ่าน"
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
                className="btn bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-6 rounded-lg"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin_login;
