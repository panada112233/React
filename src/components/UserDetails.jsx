import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import { GetUser } from '../function/apiservice';


const sexLabels = {
  Male: "ชาย",
  Female: "หญิง",
};
const roleMapping = {
  Hr: "ทรัพยากรบุคคล",
  GM: "ผู้จัดการทั่วไป",
  Dev: "นักพัฒนาระบบ",
  BA: "นักวิเคราะห์ธุรกิจ",
  Employee: "พนักงาน",
};
const levelLabels = {
  Primary: "ประถมศึกษา",
  Secondary: "มัธยมศึกษา",
  Voc: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
  Dip: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
  Bachelor: "ปริญญาตรี",
  Master: "ปริญญาโท",
  Doctorate: "ปริญญาเอก",
};
// ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบ DD-MM-YYYY
const formatDateForDisplay = (date) => {
  if (!date) return "-";
  const nDate = new Date(date);
  if (isNaN(nDate)) return "-";

  const day = String(nDate.getDate()).padStart(2, "0");
  const month = String(nDate.getMonth() + 1).padStart(2, "0");
  const year = nDate.getFullYear();
  return `${day}-${month}-${year}`; // รูปแบบ DD-MM-YYYY
};

const UserDetails = () => {
  const { UserID } = useParams();  // ดึง UserID จาก URL
  const [user, setUser] = useState(null);
  const [educations, setEducations] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [modalExperienceID, setModalExperienceID] = useState(null); // สถานะสำหรับเก็บ ID ของประสบการณ์ที่ต้องการลบ
  const [modalEducationID, setModalEducationID] = useState(null); // สถานะสำหรับเก็บ ID ของการศึกษาที่ต้องการลบ
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(""); // รูปโปรไฟล์
  const [adminName, setAdminName] = useState(""); // ชื่อจริงของแอดมิน
  const [selectedFile, setSelectedFile] = useState(null); // ไฟล์ที่เลือก
  const [uploadMessage, setUploadMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [error, setError] = useState(null);
  const profileImageUrl = `https://localhost:7039/api/Files/GetProfileImage?userID=${UserID}`;
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้งาน
  useEffect(() => {
    if (!UserID) {
      navigate("/UserList");
      return;
    }

    const fetchData = async () => {
      try {
        // ดึงข้อมูลผู้ใช้งาน
        const userResponse = await axios.get(`https://localhost:7039/api/Admin/Users/${UserID}`);
        setUser(userResponse.data || null);

        // ดึงข้อมูลการศึกษา
        const educationResponse = await axios.get("https://localhost:7039/api/Admin/Educations");
        const filteredEducations = educationResponse.data.filter(
          (education) => education.userID === parseInt(UserID, 10)
        );
        setEducations(filteredEducations);

        // ดึงข้อมูลประสบการณ์ทำงาน
        const workResponse = await axios.get("https://localhost:7039/api/Admin/WorkExperiences");
        const filteredExperiences = workResponse.data.filter(
          (experience) => experience.userID === parseInt(UserID, 10)
        );
        setWorkExperiences(filteredExperiences);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [UserID, navigate]);

  // ดึงข้อมูลแอดมิน
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
  // ฟังก์ชันลบข้อมูลประสบการณ์ทำงาน
  const handleDelete = () => {
    if (modalExperienceID) {
      axios
        .delete(`https://localhost:7039/api/Admin/WorkExperiences/${modalExperienceID}`)
        .then(() => {
          setWorkExperiences(workExperiences.filter((exp) => exp.experienceID !== modalExperienceID));
          setModalExperienceID(null); // ปิดโมเดล
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error.response || error);
          alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
          setModalExperienceID(null); // ปิดโมเดล
        });
    }
  };
  // ฟังก์ชันแก้ไขข้อมูลประสบการณ์ทำงาน
  const handleEdit = (id) => {
    navigate(`/work-experience/edit/${id}`);
  };

  // ฟังก์ชันลบข้อมูลการศึกษา
  const handleDelete1 = () => {
    if (modalEducationID) {
      axios
        .delete(`https://localhost:7039/api/Admin/Educations/${modalEducationID}`)
        .then(() => {
          setEducations(educations.filter((edu) => edu.educationID !== modalEducationID));
          setModalEducationID(null); // ปิดโมเดล
        })
        .catch((error) => {
          console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error.response || error);
          alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
          setModalEducationID(null); // ปิดโมเดล
        });
    }
  };

  // ฟังก์ชันแก้ไขข้อมูลการศึกษา
  const handleEdit1 = (id) => {
    navigate(`/educations/edit/${id}`);
  };

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

  // ฟังก์ชันอัปโหลดรูปโปรไฟล์
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


  if (loading) {
    return <div className="text-center py-6">กำลังโหลดข้อมูล...</div>;
  }

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
            <li><Link to="/AdminLogout" className="hover:bg-error hover:text-white font-FontNoto font-bold">ออกจากระบบ</Link></li>
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 p-20 bg-white shadow-lg rounded-lg ml-1">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-4 font-FontNoto">รายละเอียดผู้ใช้งาน</h1>

            <div className="flex justify-center mb-6">
              <img
                src={profileImageUrl || "/placeholder.jpg"}
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400"
              />
            </div>
            <div className="mt-6 flex justify-between p-2">
              <Link to={`/users/edit/${user.userID}`} className="btn btn-outline btn-warning font-FontNoto">
                แก้ไขข้อมูล
              </Link>
              <button
                onClick={() => navigate("/UserList")}
                className="btn btn-outline btn-error font-FontNoto"
              >
                กลับไปยังรายการ
              </button>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300 text-left">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border px-4 py-2 font-semibold font-FontNoto">ชื่อ-นามสกุล</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">อีเมล</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">เบอร์โทรศัพท์</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">แผนก</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">ตำแหน่ง</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">วันที่เริ่มงาน</th>
                  <th className="border px-4 py-2 font-semibold font-FontNoto">เพศ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border px-4 py-2 font-FontNoto">{user.firstName} {user.lastName}</td>
                  <td className="border px-4 py-2 font-FontNoto">{user.email}</td>
                  <td className="border px-4 py-2 font-FontNoto">{user.contact}</td>
                  <td className="border px-4 py-2 font-FontNoto">{roleMapping[user.role]}</td>
                  <td className="border px-4 py-2 font-FontNoto">{user.designation}</td>
                  <td className="border px-4 py-2 font-FontNoto">{formatDateForDisplay(user.jDate)}</td>
                  <td className="border px-4 py-2 font-FontNoto">{sexLabels[user.gender] || "ไม่ระบุ"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-2"></div>
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold mt-6 font-FontNoto">ประสบการณ์ทำงาน</h2>
              <Link
                to="/experiences/create"
                className="btn btn-outline btn-primary font-FontNoto"
              >
                เพิ่มข้อมูลประสบการณ์
              </Link>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border px-4 py-2 font-FontNoto">บริษัท</th>
                  <th className="border px-4 py-2 font-FontNoto">ตำแหน่ง</th>
                  <th className="border px-4 py-2 font-FontNoto">เงินเดือน</th>
                  <th className="border px-4 py-2 font-FontNoto">ปีเริ่มต้น</th>
                  <th className="border px-4 py-2 font-FontNoto">ปีสิ้นสุด</th>
                  <th className="border px-4 py-2 font-FontNoto">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {workExperiences.length > 0 ? (
                  workExperiences.map((experience) => (
                    <tr key={experience.experienceID} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-FontNoto">{experience.companyName}</td>
                      <td className="border px-4 py-2 font-FontNoto">{experience.jobTitle}</td>
                      <td className="border px-4 py-2 text-center font-FontNoto">{experience.salary}</td>
                      <td className="border px-4 py-2 text-center font-FontNoto">{experience.startDate}</td>
                      <td className="border px-4 py-2 text-center font-FontNoto">{experience.endDate}</td>
                      <td className="border px-4 py-2 space-x-2 text-center">
                        <button
                          className="btn btn-outline btn-warning btn-sm font-FontNoto"
                          onClick={() => handleEdit(experience.experienceID)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-outline btn-error btn-sm font-FontNoto"
                          onClick={() => setModalExperienceID(experience.experienceID)} // เปิดโมเดล
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border px-4 py-2 text-center font-FontNoto" colSpan={5}>ไม่พบข้อมูลประสบการณ์ทำงาน</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {modalExperienceID && (
            <dialog open className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg text-left font-FontNoto">คุณแน่ใจหรือไม่?</h3>
                <p className="py-4 text-left font-FontNoto">การลบข้อมูลประสบการณ์ทำงานนี้จะไม่สามารถกู้คืนได้!</p>
                <div className="modal-action">
                  <button
                    className="btn btn-warning font-FontNoto"
                    onClick={() => setModalExperienceID(null)} // ปิดโมเดล
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="btn btn-success font-FontNoto"
                    onClick={handleDelete} // ลบข้อมูล
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </dialog>
          )}
          <div className="p-2"></div>
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold mt-6 font-FontNoto">ประวัติการศึกษา</h2>
              <Link
                to="/educations/create"
                className="btn btn-outline btn-primary font-FontNoto"
              >
                เพิ่มข้อมูลการศึกษา
              </Link>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border px-4 py-2 font-FontNoto">ระดับการศึกษา</th>
                  <th className="border px-4 py-2 font-FontNoto">สถาบัน</th>
                  <th className="border px-4 py-2 font-FontNoto">สาขาวิชา</th>
                  <th className="border px-4 py-2 font-FontNoto">ปีที่ศึกษา</th>
                  <th className="border px-4 py-2 font-FontNoto">(GPA)</th>
                  <th className="border px-4 py-2 font-FontNoto">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {educations.length > 0 ? (
                  educations.map((education) => (
                    <tr key={education.educationID} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-FontNoto">{levelLabels[education.level]}</td>
                      <td className="border px-4 py-2 font-FontNoto">{education.institute}</td>
                      <td className="border px-4 py-2 font-FontNoto">{education.fieldOfStudy}</td>
                      <td className="border px-4 py-2 text-center font-FontNoto">{education.year}</td>
                      <td className="border px-4 py-2 text-center font-FontNoto">{education.gpa}</td>
                      <td className="border px-4 py-2 space-x-2 text-center">
                        <button
                          className="btn btn-outline btn-warning btn-sm font-FontNoto"
                          onClick={() => handleEdit1(education.educationID)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-outline btn-error btn-sm font-FontNoto"
                          onClick={() => setModalEducationID(education.educationID)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border px-4 py-2 text-center font-FontNoto" colSpan={5}>ไม่พบข้อมูลการศึกษา</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {modalEducationID && (
            <dialog open className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg text-left font-FontNoto">คุณแน่ใจหรือไม่?</h3>
                <p className="py-4 text-left font-FontNoto">การลบข้อมูลการศึกษานี้จะไม่สามารถกู้คืนได้!</p>
                <div className="modal-action">
                  <button
                    className="btn btn-warning font-FontNoto"
                    onClick={() => setModalEducationID(null)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="btn btn-success font-FontNoto"
                    onClick={handleDelete1}
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
