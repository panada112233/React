import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import 'daisyui/dist/full.css'; // Import daisyUI styles

const EditWorkExperience = () => {
  const [workExperience, setWorkExperience] = useState({
    companyName: "",
    jobTitle: "",
    salary: "",
    startDate: "",
    endDate: "",
  });
  const [modalMessage, setModalMessage] = useState("");
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const navigate = useNavigate();
  const { experienceID, userID } = useParams();  // ดึง userID และ experienceID จาก URL params

  // Fetch work experience data
  useEffect(() => {
    const fetchWorkExperience = async () => {
      try {
        const response = await axios.get(`https://localhost:7039/api/Admin/WorkExperiences/${experienceID}`);
        setWorkExperience(response.data);
      } catch (error) {
        setModalMessage("ไม่สามารถโหลดข้อมูลประสบการณ์ทำงานได้");
        document.getElementById("error_modal").showModal();
      }
    };

    fetchWorkExperience();
  }, [experienceID]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "companyName" || name === "jobTitle") {
      // อนุญาตเฉพาะตัวอักษรภาษาไทย
      const thaiOnly = /^[ก-๙\s]*$/;
      if (!thaiOnly.test(value)) return;
    }

    if (name === "salary") {
      // ป้องกันค่าติดลบ
      if (value < 0) return;
    }

    if (name === "startDate" || name === "endDate") {
      // อนุญาตเฉพาะตัวเลขเท่านั้น
      const numberOnly = /^[0-9]*$/; // รับเฉพาะตัวเลข
      if (!numberOnly.test(value)) return;
      if (value.length > 4) return; // จำกัดความยาวไม่เกิน 4 หลัก
    }

    setWorkExperience((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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

  // ตั้งค่า modalMessage และแสดง Success Modal หลังการบันทึกสำเร็จ
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // ตรวจสอบข้อมูลก่อนบันทึก
      if (!workExperience.companyName || !workExperience.jobTitle || !workExperience.salary || !workExperience.startDate || !workExperience.endDate) {
        setModalMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
        document.getElementById("error_modal").showModal();
        return;
      }

      // ตรวจสอบความถูกต้องของ startDate และ endDate
      if (
        workExperience.startDate.length !== 4 ||
        workExperience.endDate.length !== 4
      ) {
        setModalMessage("กรุณากรอกปีเริ่มต้นและปีสิ้นสุดเป็นตัวเลข 4 หลัก");
        document.getElementById("error_modal").showModal();
        return;
      }

      // บันทึกข้อมูล
      await axios.put(
        `https://localhost:7039/api/Admin/WorkExperiences/${experienceID}`,
        workExperience
      );

      // ตั้งค่าข้อความสำเร็จ
      setModalMessage("บันทึกข้อมูลสำเร็จ");
      document.getElementById("success_modal").showModal();
    } catch (error) {
      console.error("Error saving data:", error);

      // แสดงข้อผิดพลาด
      setModalMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      document.getElementById("error_modal").showModal();
    }
  };

  // ตรวจสอบการส่ง userID ที่ไม่ใช่ undefined
  const handleCloseSuccessModal = () => {
    if (!userID) {
      setModalMessage("ไม่พบข้อมูลผู้ใช้");
      document.getElementById("error_modal").showModal();
      // ใช้ navigate(-1) หรือ window.history.back() เพื่อกลับไปหน้าก่อนหน้า
      navigate(-1);  // หรือ window.history.back();
      return;
    }
    document.getElementById("success_modal").close();
    navigate(`/WorkExperienceDetail/${userID}`); // ไปยังหน้า WorkExperienceDetail พร้อม userID
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
            <li><Link to="/UserList" className="hover:bg-green-100 hover:text-black font-FontNoto font-bold">ข้อมูลพนักงาน</Link></li>
            <li><Link to="/FileList" className="hover:bg-orange-100 hover:text-black font-FontNoto font-bold">จัดการเอกสาร</Link></li>
            <li><Link to="/WorkExperienceList" className="hover:bg-yellow-100 hover:text-black font-FontNoto font-bold">ประสบการณ์ทำงาน</Link></li>
            <li><Link to="/EducationList" className="hover:bg-purple-100 hover:text-black font-FontNoto font-bold">การศึกษา</Link></li>
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
          <div className="max-w-5xl mx-auto rounded-lg border border-white p-6 bg-white">
            <div className="text-left ">
              <h2 className="text-2xl font-bold text-black font-FontNoto">แก้ไขข้อมูลประสบการณ์ทำงาน</h2>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-FontNoto text-black">บริษัท</label>
                  <input
                    type="text"
                    className="input input-bordered font-FontNoto"
                    name="companyName"
                    value={workExperience.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label font-FontNoto text-black">ตำแหน่ง</label>
                  <input
                    type="text"
                    className="input input-bordered font-FontNoto"
                    name="jobTitle"
                    value={workExperience.jobTitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label font-FontNoto text-black">เงินเดือน</label>
                  <input
                    type="number"
                    className="input input-bordered font-FontNoto"
                    name="salary"
                    value={workExperience.salary}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label font-FontNoto text-black">ปีเริ่มต้น</label>
                  <input
                    type="text"
                    className="input input-bordered font-FontNoto"
                    name="startDate"
                    value={workExperience.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label font-FontNoto text-black">ปีสิ้นสุด</label>
                  <input
                    type="text"
                    className="input input-bordered font-FontNoto"
                    name="endDate"
                    value={workExperience.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <button type="submit" className="btn btn-warning w-full md:w-1/2 font-FontNoto">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <dialog id="success_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-success font-FontNoto">สำเร็จ</h3>
          <p className="py-4 font-FontNoto">{modalMessage}</p>
          <div className="modal-action">
            <button
              className="btn btn-outline btn-error font-FontNoto"
              onClick={handleCloseSuccessModal} // ฟังก์ชันที่ตรวจสอบ userID และกลับไปหน้าก่อนหน้า
            >
              ปิด
            </button>
          </div>
        </div>
      </dialog>

      {/* Error Modal */}
      <dialog id="error_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-red-500 font-FontNoto">ข้อผิดพลาด</h3>
          <p className="py-4 font-FontNoto">{modalMessage}</p>
          <div className="modal-action">
            <button className="btn btn-outline btn-error font-FontNoto" onClick={() => document.getElementById("error_modal").close()}>ปิด</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default EditWorkExperience;
