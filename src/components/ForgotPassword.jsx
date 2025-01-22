import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Emp_login.css'; // เรียกใช้ CSS เดียวกัน

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('รูปแบบอีเมลไม่ถูกต้อง');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://localhost:7039/api/PasswordResets/reset-request',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message || 'ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณแล้ว');
        setTimeout(() => navigate('/ChangePassword'), 3000);
      } else {
        setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="emp_login-container">
      <div className="emp-card w-96 bg-gray-800 text-white shadow-2xl rounded-lg">
        <div className="card-body p-6">
          <h3 className="text-center text-2xl font-semibold mb-6  text-black font-FontNoto">
            ลืมรหัสผ่าน ?
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="input bg-gray-700 text-white w-full pl-10 py-3 rounded-md border border-gray-600 font-FontNoto"
                  placeholder="อีเมลที่ใช้สมัคร"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    // กรองภาษาไทยออก
                    if (/^[^\u0E00-\u0E7F]*$/.test(value)) {
                      setEmail(value);
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="flex justify-center items-center mt-6 font-FontNoto">
              <button
                type="submit"
                className="btn bg-blue-400 hover:bg-blue-500 text-gray-800 font-bold py-3 px-6 rounded-md w-full font-FontNoto"
                disabled={isLoading}
              >
                {isLoading ? 'กำลังส่งลิงก์...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 text-center font-FontNoto">
              <span
                className={`text-sm ${message.includes('สำเร็จ') ? 'text-green-500' : 'text-red-500 '
                  }`}
              >
                {message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
