import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Allcreate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        email: '',
        passwordHash: '', // Assuming 'passwordHash' is the field used in the backend
        confirmPassword: '',
        role: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState({
        passwordHash: false,
        confirmPassword: false,
    });

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // เงื่อนไขสำหรับการอนุญาตเฉพาะภาษาไทยและช่องว่าง
        const thaiPattern = /^[\u0E00-\u0E7F\s]+$/; // สำหรับชื่อและนามสกุล
        const noThaiPattern = /^[^\u0E00-\u0E7F]*$/; // ห้ามตัวอักษรภาษาไทย
        const emailPattern = /^[^\u0E00-\u0E7F\s]+$/; // อนุญาตเฉพาะภาษาอังกฤษและไม่มีช่องว่าง

        // ตรวจสอบชื่อและนามสกุล
        if ((name === "firstname" || name === "lastname") && !thaiPattern.test(value) && value !== "") {
            return;
        }

        // ตรวจสอบอีเมล (ห้ามภาษาไทย)
        if (name === "email" && !emailPattern.test(value) && value !== "") {
            return;
        }

        // ตรวจสอบรหัสผ่าน (ห้ามภาษาไทย)
        if ((name === "passwordHash" || name === "confirmPassword") && !noThaiPattern.test(value) && value !== "") {
            return;
        }

        // หากผ่านทุกเงื่อนไข ให้บันทึกค่าลงใน state
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios
                .get(`https://localhost:7039/api/Admin/user/${id}`)
                .then((response) => {
                    setUser(response.data);
                    setLoading(false);
                })
                .catch(() => {
                    setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
                    setLoading(false);
                });
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const thaiRegex = /^[\u0E00-\u0E7F]+$/; // สำหรับตรวจสอบภาษาไทย
        const noThaiRegex = /^[^\u0E00-\u0E7F]*$/; // สำหรับตรวจสอบห้ามภาษาไทย
        const emailRegex = /^[^\u0E00-\u0E7F]+$/; // ห้ามตัวอักษรภาษาไทย

        // ตรวจสอบว่า Role ถูกเลือกหรือไม่
        if (!user.role) {
            setError("กรุณาเลือกตำแหน่ง");
            setLoading(false);
            return;
        }

        if (!thaiRegex.test(user.firstname)) {
            setError("ชื่อจะต้องเป็นภาษาไทยเท่านั้น");
            setLoading(false);
            return;
        }

        if (!thaiRegex.test(user.lastname)) {
            setError("นามสกุลจะต้องเป็นภาษาไทยเท่านั้น");
            setLoading(false);
            return;
        }
        if (!emailRegex.test(user.email)) {
            setError("อีเมลต้องเป็นภาษาอังกฤษและอยู่ในรูปแบบที่ถูกต้อง");
            setLoading(false);
            return;
        }

        if (!noThaiRegex.test(user.passwordHash)) {
            setError("รหัสผ่านต้องไม่มีตัวอักษรภาษาไทย");
            setLoading(false);
            return;
        }

        if (user.passwordHash !== user.confirmPassword) {
            setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            setLoading(false);
            return;
        }

        const apiCall = id
            ? axios.put(`https://localhost:7039/api/Admin/Users/${id}`, user)
            : axios.post("https://localhost:7039/api/Admin/Users", user);

        apiCall
            .then((response) => navigate(`/EmpHome/Allemployee`))
            .catch(() => {
                setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                setLoading(false);
            });
    };


    return (
        <div className="flex flex-col min-h-screen">
            <div className="min-h-screen bg-base-200 flex">
                {/* Form Section */}
                <div className="flex-1 p-6 bg-white shadow-lg rounded-lg ml-1">
                    <Link to="/EmpHome/Allemployee" className="btn btn-outline font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        พนักงานในระบบ
                    </Link>
                    <Link to="/EmpHome/Alldocuments" className="btn btn-outline btn-success font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        เอกสารพนักงาน
                    </Link>
                    <Link to="/EmpHome/Allexperiences" className="btn btn-outline btn-info font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        ประสบการณ์ทำงาน
                    </Link>
                    <Link to="/EmpHome/Alleducation" className="btn btn-outline btn-primary font-FontNoto mt-2" style={{ marginRight: '10px' }}>
                        การศึกษาพนักงาน
                    </Link>
                    <Link to="/EmpHome/Allcreate" className="btn btn-outline btn-secondary font-FontNoto mt-2">
                        เพิ่มพนักงานใหม่
                    </Link>
                    <div className="mb-6"></div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '32rem', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem', borderRadius: '0.5rem' }}>
                            <div className="text-left ">
                                <h2 className="text-2xl font-bold text-black font-FontNoto text-center">เพิ่มพนักงาน</h2>
                            </div>
                            {loading && <p style={{ textAlign: 'center', color: '#6B7280' }}>กำลังโหลดข้อมูล...</p>}
                            {error && <p style={{ textAlign: 'center', color: '#DC2626' }}>{error}</p>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ชื่อ</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        placeholder="ชื่อ"
                                        value={user.firstname}
                                        onChange={handleChange}
                                        className="input input-bordered font-FontNoto"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">นามสกุล</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        placeholder="นามสกุล"
                                        value={user.lastname}
                                        onChange={handleChange}
                                        className="input input-bordered font-FontNoto"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">แผนก</span>
                                    </label>
                                    <select
                                        name="role"
                                        value={user.role} // ใช้ user.role แทน
                                        onChange={handleChange}
                                        className="select select-bordered font-FontNoto"
                                        required
                                    >
                                        <option value="" disabled>เลือกตำแหน่ง</option>
                                        <option value="Hr">ทรัพยากรบุคคล</option>
                                        <option value="GM">ผู้จัดการทั่วไป</option>
                                        <option value="Dev">นักพัฒนาระบบ</option>
                                        <option value="BA">นักวิเคราะห์ธุรกิจ</option>
                                        <option value="Employee">พนักงาน</option>
                                    </select>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">อีเมล</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="อีเมล"
                                        value={user.email}
                                        onChange={handleChange}
                                        className="input input-bordered font-FontNoto"
                                        required
                                    />
                                </div>

                                <div className="form-control mb-4 relative">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">รหัสผ่าน</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.passwordHash ? "text" : "password"}
                                            name="passwordHash"
                                            placeholder="รหัสผ่าน"
                                            value={user.passwordHash}
                                            onChange={handleChange}
                                            className="input input-bordered font-FontNoto bg-gray-700 text-white w-full py-3 px-4 rounded-md border border-gray-600"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 font-FontNoto"
                                            onClick={() => togglePasswordVisibility("passwordHash")}
                                        >
                                            {showPassword.passwordHash ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control mb-4 relative">
                                    <label className="label">
                                        <span className="label-text font-FontNoto">ยืนยันรหัสผ่าน</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="ยืนยันรหัสผ่าน"
                                            value={user.confirmPassword}
                                            onChange={handleChange}
                                            className="input input-bordered font-FontNoto bg-gray-700 text-white w-full py-3 px-4 rounded-md border border-gray-600"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 font-FontNoto"
                                            onClick={() => togglePasswordVisibility("confirmPassword")}
                                        >
                                            {showPassword.confirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control font-FontNoto">
                                    <button type="submit" className={`btn btn-warning ${loading && "loading"}`} disabled={loading}>
                                        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Allcreate;
