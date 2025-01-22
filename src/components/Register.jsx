import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // เพิ่มการใช้งาน useNavigate
import '../Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    pwd: '',
    cpwd: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();  // สร้าง useNavigate เพื่อใช้ในการเปลี่ยนหน้า

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบรหัสผ่านว่าเหมือนกันไหม
    if (formData.pwd !== formData.cpwd) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    let data = JSON.stringify({
      "firstName": formData.firstname,
      "lastName": formData.lastname,
      "email": formData.email,
      "passwordHash": formData.pwd
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://localhost:7039/api/Users/Insert',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        if (response.status === 201) {
          alert('ลงทะเบียนสำเร็จ');
          setError('');
          // รีไดเร็กต์ไปหน้าล็อกอิน
          navigate('/Emp_login');
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.data) {
          if (error.response.data.includes("duplicate")) {  // ตรวจสอบข้อความ error จาก API ที่บอกว่าอีเมลซ้ำ
            setError('อีเมลนี้มีผู้ใช้งานแล้ว');
          } else {
            setError(`เกิดข้อผิดพลาด: ${error.response.data}`);
          }
        } else {
          setError('เกิดข้อผิดพลาดในการลงทะเบียน');
        }
      });
  };

  return (
    <div className="register-container bg-black min-h-screen flex justify-center items-center">
      <div className="card bg-neutral shadow-xl w-96 text-white">
        <div className="card-body">
        <h5 className="header-title p-2 text-danger">สร้างบัญชี</h5>
          <div className="container-fluid">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label>ชื่อ</label>
                  <input
                    type="text"
                    name="firstname"
                    className="input input-bordered w-full"
                    placeholder="กรอกชื่อจริง"
                    pattern="[\u0E00-\u0E7F]+"
                    title="กรุณากรอกเป็นภาษาไทย"
                    required
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>นามสกุล</label>
                  <input
                    type="text"
                    name="lastname"
                    className="input input-bordered w-full"
                    placeholder="กรอกนามสกุล"
                    pattern="[\u0E00-\u0E7F]+"
                    title="กรุณากรอกเป็นภาษาไทย"
                    required
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols gap-4 mb-4">
                <div className="form-group">
                  <label>อีเมล</label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full"
                    placeholder="อีเมล"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label>รหัสผ่าน</label>
                  <input
                    type="password"
                    name="pwd"
                    className="input input-bordered w-full"
                    placeholder="รหัสผ่าน"
                    required
                    value={formData.pwd}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>ยืนยันรหัสผ่าน</label>
                  <input
                    type="password"
                    name="cpwd"
                    className="input input-bordered w-full"
                    placeholder="ยืนยันรหัสผ่าน"
                    required
                    value={formData.cpwd}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button className="btn btn-warning w-full">ยืนยันการลงทะเบียน</button>
            </form>
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
