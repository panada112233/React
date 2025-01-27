import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import { useParams, useNavigate, Link } from "react-router-dom"; // ใช้ Link สำหรับเมนู
import { GetUser } from '../function/apiservice';


const roleMapping = {
  Hr: "ทรัพยากรบุคคล",
  GM: "ผู้จัดการทั่วไป",
  Dev: "นักพัฒนาระบบ",
  BA: "นักวิเคราะห์ธุรกิจ",
  Employee: "พนักงาน",
};

const UserEdit = () => {
  const { UserID } = useParams(); // รับ UserID จาก URL
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    contact: "",
    email: "",
    JDate: "",
    gender: "None",
    createdAt: "",
    isActive: "",
    passwordHash: "",
    role: "",
    updatedAt: "",
    userID: "",
  });
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const navigate = useNavigate();

  // โหลดข้อมูลจาก API
  useEffect(() => {
    if (UserID) {
      axios
        .get(`https://localhost:7039/api/Admin/users/${UserID}`)
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error loading user data:", error);
          setModalMessage("ไม่พบข้อมูลผู้ใช้งาน");
          setShowModal(true);
        });
    } else {
      setModalMessage("ไม่พบ UserID");
      setShowModal(true);
    }
  }, [UserID, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    // เงื่อนไขสำหรับการอนุญาตเฉพาะภาษาไทย
    const thaiPattern = /^[\u0E00-\u0E7F\s]+$/; // อนุญาตเฉพาะตัวอักษรภาษาไทยและช่องว่าง

    // ตรวจสอบข้อมูลเฉพาะฟิลด์ที่ต้องการให้เป็นภาษาไทยเท่านั้น
    if (['firstName', 'lastName', 'department', 'designation'].includes(name)) {
      if (!thaiPattern.test(value)) {
        return; // ข้อมูลไม่ผ่านเงื่อนไข ไม่อัปเดตค่า
      }
    }

    // เงื่อนไขสำหรับเบอร์โทรศัพท์
    if (name === 'contact') {
      const numericPattern = /^\d*$/; // ยอมรับเฉพาะตัวเลข
      if (!numericPattern.test(value)) {
        return; // ถ้าไม่ใช่ตัวเลข ให้หยุดการเปลี่ยนแปลง
      }

      // อัปเดตค่าได้เฉพาะเมื่อจำนวนตัวเลขไม่เกิน 10 หลัก
      if (value.length <= 10) {
        setUser({ ...user, [name]: value });
      }
      return; // ไม่ต้องให้โค้ดส่วนอื่นทำงาน
    }


    // เงื่อนไขสำหรับอีเมล (ห้ามภาษาไทย)
    if (name === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        return;
      }
    }

    setUser({ ...user, [name]: value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (user.contact.length !== 10) {
      setModalMessage("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      setShowModal(true);
      return;
    }

    axios
      .put(`https://localhost:7039/api/Admin/Users/${UserID}`, user)
      .then(() => {
        setModalMessage("แก้ไขข้อมูลสำเร็จ");
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        setModalMessage("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
        setShowModal(true);
      });
  };

  const closeModal = () => {
    setShowModal(false);
    if (modalMessage === "แก้ไขข้อมูลสำเร็จ") {
      navigate("/UserList");
    }
  };
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await GetUser(); // ใช้ฟังก์ชันจาก apiservice
        setAdminName(response.name || "ไม่มีชื่อแอดมิน");
        setProfilePic(
          response.profilePictureUrl
            ? `http://localhost${response.profilePictureUrl}`
            : "/uploads/admin/default-profile.jpg"
        );
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminName("ไม่สามารถดึงข้อมูลได้");
      }
    };

    fetchAdminInfo();
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
    if (!adminName) {
      console.error("Admin name is empty, cannot update.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">กรุณากรอกชื่อแอดมิน</p>);
      return;
    }

    // ดึงข้อมูล User ID จาก localStorage
    const userInfo = JSON.parse(localStorage.getItem("userinfo"));
    if (!userInfo || !userInfo.userid) {
      console.error("User ID is missing in localStorage.");
      setUploadMessage(<p className="text-red-500 font-FontNoto">ไม่พบข้อมูลผู้ใช้</p>);
      return;
    }

    const formData = new FormData();
    formData.append("name", adminName);
    formData.append("id", userInfo.userid);

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
            <li><Link to="/AdminDashboard" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">Dashboard</Link></li>
            <li><Link to="/LeaveGraph" className="hover:bg-green-100 font-FontNoto font-bold">สถิติการลาพนักงาน</Link></li>
            <li><NavLink to="/UserList" className={({ isActive }) => isActive ? "hover:bg-gray-300 hover:text-black font-FontNoto font-bold bg-gray-200" : "hover:bg-yellow-100 hover:text-black font-FontNoto font-bold"}>ข้อมูลพนักงาน</NavLink></li>
            <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
            <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
            <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="mt-6 flex justify-between ">
              <h2 className="text-2xl font-bold text-black font-FontNoto">แก้ไขข้อมูลพนักงาน</h2>
              <button
                onClick={() => navigate("/UserList")}
                className="btn btn-outline btn-error font-FontNoto"
              >
                กลับไปยังรายการ
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div> </div>
              <div> </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4 mb-4">
                {/* ชื่อ */}
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">ชื่อ</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    className="input input-bordered font-FontNoto"
                    required
                  />
                </div>
                {/* นามสกุล */}
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">นามสกุล</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    className="input input-bordered font-FontNoto"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">อีเมล</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    className="input input-bordered font-FontNoto"
                    required
                  />
                </div>
                {/* เบอร์โทรศัพท์ */}
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">เบอร์โทรศัพท์</span>
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={user.contact}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="\d{10}"
                    className="input input-bordered font-FontNoto"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                {/* แผนก */}
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">แผนก</span>
                  </label>
                  <select
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                    className="select select-bordered font-FontNoto"
                    required
                  >
                    <option value="">เลือกแผนก</option>
                    {Object.entries(roleMapping).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                {/* ตำแหน่ง */}
                <div className="flex-1 form-control">
                  <label className="label">
                    <span className="label-text font-FontNoto">ตำแหน่ง</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={user.designation}
                    onChange={handleChange}
                    className="input input-bordered font-FontNoto"
                    required
                  />
                </div>
              </div>
              {/* ปุ่มบันทึก */}
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-warning w-full font-FontNoto">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <dialog open className="modal" onClick={closeModal}>
          <div className="modal-box">
            <h3 className="font-bold text-lg font-FontNoto">{modalMessage}</h3>
            <div className="modal-action">
              <button className="btn btn-outline btn-error font-FontNoto" onClick={closeModal}>
                ปิด
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default UserEdit;