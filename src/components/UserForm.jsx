import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const UserForm = () => {
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
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
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
      .then((response) => navigate(`/users/${response.data.userID}`))
      .catch(() => {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setLoading(false);
      });
  };
  useEffect(() => {
    axios.get('https://localhost:7039/api/Admin/GetAdminInfo')
      .then(response => {
        console.log("API Response:", response.data); // ตรวจสอบผลลัพธ์
        setAdminName(response.data.name || "ไม่มีชื่อแอดมิน"); // ใช้ Name หรือข้อความเริ่มต้น
        const profileUrls = response.data.profilePictureUrl || [];
        setProfilePic(profileUrls.length ? `http://localhost/${profileUrls}` : '/uploads/admin/default-profile.jpg');
      })
      .catch(error => {
        console.error('Error fetching admin data:', error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      });
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
    const formData = new FormData();
    console.log("Name to update:", adminName); // ล็อกชื่อที่จะอัปเดต

    if (adminName) formData.append("name", adminName);

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setIsEditingName(false);
      setUploadMessage(<p className="text-green-500 font-FontNoto">บันทึกชื่อสำเร็จ!</p>);
    } catch (error) {
      console.error("Error updating admin name:", error);
      setUploadMessage(
        <p className="text-red-500 font-FontNoto">เกิดข้อผิดพลาดในการบันทึกชื่อ</p>
      );
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

    const formData = new FormData();
    formData.append("profilePictures", selectedFile); // ส่งเฉพาะรูปภาพ

    try {
      const response = await axios.post(
        "https://localhost:7039/api/Admin/UpdateAdminInfo",
        formData,
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
      <div className="min-h-screen bg-base-200 flex">
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
            <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
            <li><NavLink to="/UserList" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>ข้อมูลพนักงาน</NavLink></li>
            <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
            <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
            <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>

        {/* Form Section */}
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '32rem', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '2rem', borderRadius: '0.5rem' }}>
              <div className="text-left ">
                <h2 className="text-2xl font-bold text-black font-FontNoto text-center">เพิ่มผู้ใช้งาน</h2>
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

export default UserForm;
