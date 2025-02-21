// ลบเงื่อนไข if (!userID) ออก
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Emp_login.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword1, setShowNewPassword1] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      setPopupMessage("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน!");
      setPopupVisible(true);
      return;
    }

    setLoading(true);
    setMessages([]);

    const resetData = {
      // ไม่จำเป็นต้องมี userID อีกต่อไป
      oldPassword: oldPassword,
      newPassword: newPassword1,
    };

    try {
      const response = await axios.post(
        "http://localhost:7039/api/Users/ChangePassword",
        resetData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setPopupMessage(response.data.message || "เปลี่ยนรหัสผ่านสำเร็จ!");
        setPopupVisible(true);
        setOldPassword("");
        setNewPassword1("");
        setNewPassword2("");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      setPopupMessage(
        error.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้!"
      );
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupMessage("");
  };

  return (
    <div className="emp_login-container">
      <div className="emp-card w-96 bg-gray-800 text-black  shadow-2xl rounded-lg">
        <h2 className="text-center text-2xl font-semibold mb-6 font-FontNoto">
          เปลี่ยนรหัสผ่าน
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text  font-FontNoto">รหัสยืนยัน</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                className="input input-bordered input-primary w-full font-FontNoto"
                placeholder="รหัสยืนยัน"
                value={oldPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  // กรองตัวอักษรภาษาไทยออก
                  if (/^[^\u0E00-\u0E7F]*$/.test(value)) {
                    setOldPassword(value);
                  }
                }}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center font-FontNoto"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-black" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-black" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-FontNoto">รหัสผ่านใหม่</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword1 ? "text" : "password"}
                className="input input-bordered input-primary w-full pr-10 font-FontNoto"
                placeholder="รหัสผ่านใหม่"
                value={newPassword1}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[^\u0E00-\u0E7F]*$/.test(value)) {
                    setNewPassword1(value);
                  }
                }}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center font-FontNoto"
                onClick={() => setShowNewPassword1(!showNewPassword1)}
              >
                {showNewPassword1 ? (
                  <EyeSlashIcon className="h-5 w-5 text-black" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-black" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-FontNoto">ยืนยันรหัสผ่านใหม่</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword2 ? "text" : "password"}
                className="input input-bordered input-primary w-full pr-10 font-FontNoto"
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={newPassword2}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[^\u0E00-\u0E7F]*$/.test(value)) {
                    setNewPassword2(value);
                  }
                }}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center font-FontNoto"
                onClick={() => setShowNewPassword2(!showNewPassword2)}
              >
                {showNewPassword2 ? (
                  <EyeSlashIcon className="h-5 w-5 text-black" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-black" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control">
            <button
              type="submit"
              className="btn bg-yellow-500 hover:bg-yellow-600 text-black w-full font-FontNoto border-none"
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>

          </div>
        </form>
      </div>

      {popupVisible && (
        <dialog id="popup_modal" className="modal" open>
          <div className="modal-box">
            <p className="py-4">{popupMessage}</p>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default ChangePassword;
