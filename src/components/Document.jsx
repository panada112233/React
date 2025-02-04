import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Document() {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    category: '',
    file: null,
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFileID, setDeleteFileID] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // เพิ่ม state สำหรับควบคุมการกดปุ่ม


  const categoryMapping = {
    Certificate: 'ใบลาป่วย',
    WorkContract: 'ใบลากิจ',
    Identification: 'ใบลาพักร้อน',
    Maternity: 'ใบลาคลอด',
    Ordination: 'ใบลาบวช',
    Doc: 'เอกสารส่วนตัว',
    Others: 'อื่นๆ',
  };

  // ดึง User ID จาก session หรือ localStorage
  const userID = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      // โหลดเอกสารของพนักงานปกติ
      const response = await fetch(
        `https://localhost:7039/api/Files/Document?userID=${userID}`
      );
      const data = await response.json();

      // โหลดเอกสารที่ HR ส่งให้พนักงานจาก LocalStorage
      const sentToEmployeesForms = JSON.parse(localStorage.getItem("sentToEmployeesFormsForEmployee")) || [];

      // รวมเอกสารทั้งสองแหล่ง
      const combinedDocuments = [...data, ...sentToEmployeesForms];

      setDocuments(combinedDocuments); // ตั้งค่าเอกสาร
      setFilteredDocuments(combinedDocuments); // ใช้สำหรับฟิลเตอร์
      
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("ไม่สามารถโหลดข้อมูลเอกสารได้");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenModal = (filePath) => {
    setSelectedFilePath(filePath);
    setPassword(''); // รีเซ็ตรหัสผ่านทุกครั้งที่เปิด modal
    setIsModalOpen(true);
  };

  const handleVerifyPassword = async () => {
    if (!password) {
      alert('กรุณาใส่รหัสผ่าน');
      return;
    }

    const verifyPassword = async (userID, password) => {
      try {
        const data = JSON.stringify({
          userID: userID,
          passwordHash: password,
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://localhost:7039/api/Files/VerifyPassword',
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
        };

        const response = await axios.request(config);

        if (response.data.isValid) {
          window.open('https://localhost:7039' + selectedFilePath, '_blank');
          setIsModalOpen(false); // ปิด modal
        } else {
          alert('รหัสผ่านไม่ถูกต้อง');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        alert('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
      }
    };

    verifyPassword(userID, password);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // ป้องกันการกดซ้ำ
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('File', newDocument.file);
    formData.append('Category', newDocument.category);
    formData.append('Description', newDocument.description);
    formData.append('UserID', userID);

    try {
      const response = await fetch('https://localhost:7039/api/Files/Create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Response:', result);
        setModalMessage('สร้างเอกสารสำเร็จ');
        setIsSuccessModalOpen(true); // เปิดโมเดลสำเร็จ
        await fetchDocuments(); // โหลดข้อมูลใหม่

        // รีเซ็ตฟอร์มหลังอัปโหลดสำเร็จ
        setNewDocument({
          category: '',
          file: null,
          description: '',
        });
      } else {
        console.error('Error creating document:', response.statusText);
        setModalMessage('เกิดข้อผิดพลาดในการสร้างเอกสาร');
        setIsErrorModalOpen(true); // เปิดโมเดลล้มเหลว
      }
    } catch (error) {
      console.error('Error creating document:', error);
      setModalMessage('เกิดข้อผิดพลาดในการสร้างเอกสาร');
      setIsErrorModalOpen(true); // เปิดโมเดลล้มเหลว
    } finally {
      setIsSubmitting(false); // ตั้งค่า isSubmitting กลับเป็น false
    }
  };

  const handleSearch = () => {
    const results = documents.filter(
      (doc) =>
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(results);
  };

  const handleDeleteDocument = async (id) => {
    try {
      const response = await fetch(`https://localhost:7039/api/Files/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments(); // โหลดรายการเอกสารใหม่
      } else {
        console.error('Error deleting document:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteFileID(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteFileID(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteDocument = () => {
    handleDeleteDocument(deleteFileID);
    handleCloseDeleteModal();
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.match('application/*')) {
      setNewDocument({ ...newDocument, file: selectedFile });
    } else {
      alert('กรุณาอัปโหลดไฟล์ที่ถูกต้อง เช่น PDF หรือ Word');
    }
  };

  return (
    <div className="">
      <div className="flex justify-start gap-4 mb-4">
        <Link
          to="/EmpHome/Document"
          className="btn btn-outline font-FontNoto"
        >
          จัดการเอกสาร
        </Link>
        <Link
          to="/EmpHome/LeaveForm"
          className="btn btn-outline font-FontNoto"
        >
          ฟอร์มใบลา
        </Link>
        <Link
          to="/EmpHome/EmployeeView"
          className="btn btn-outline font-FontNoto"
        >
          เอกสารใบลาจาก HR
        </Link>
      </div>
      <div className="max-w-5xl mx-auto rounded-lg  p-6 ">
        <h2 className="text-2xl font-bold text-black font-FontNoto">จัดการเอกสารพนักงาน</h2>

        {/* Modal ใส่รหัสผ่าน */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 font-FontNoto">กรุณาใส่รหัสผ่าน</h3>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}  // ถ้าต้องการให้มีการแสดง/ซ่อนรหัสผ่าน
                  className="input input-bordered w-full mb-4"
                  placeholder="ใส่รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* ปุ่มสำหรับแสดง/ซ่อนรหัสผ่าน */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="btn btn-outline btn-warning font-FontNoto"
                  onClick={() => setIsModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button className="btn btn-outline btn-primary font-FontNoto" onClick={handleVerifyPassword}>
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>

        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 font-FontNoto">ยืนยันการลบ</h3>
              <p className="font-FontNoto">คุณต้องการลบเอกสารนี้หรือไม่?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="btn btn-outline btn-warning font-FontNoto"
                  onClick={handleCloseDeleteModal}
                >
                  ยกเลิก
                </button>
                <button
                  className="btn btn-outline btn-error font-FontNoto"
                  onClick={confirmDeleteDocument}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal สำเร็จ */}
        {isSuccessModalOpen && (
          <dialog id="success_modal" className="modal" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg font-FontNoto">สำเร็จ</h3>
              <p className="text-lg font-FontNoto">{modalMessage}</p>
              <div className="modal-action">
                <button
                  className="btn btn-outline btn-error font-FontNoto"
                  onClick={() => setIsSuccessModalOpen(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* Modal ล้มเหลว */}
        {isErrorModalOpen && (
          <dialog id="error_modal" className="modal" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg font-FontNoto">ข้อผิดพลาด</h3>
              <p className="text-lg font-FontNoto">{modalMessage}</p>
              <div className="modal-action">
                <button
                  className="btn btn-outline btn-error font-FontNoto"
                  onClick={() => setIsErrorModalOpen(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* Form อัปโหลดเอกสาร */}
        <form
          onSubmit={handleAddDocument}
          className="space-y-4 mb-8 bg-base-100 p-4 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">ชื่อเอกสาร</span>
              </label>
              <input
                type="text"
                className="input input-bordered font-FontNoto"
                placeholder="กรอกชื่อเอกสาร"
                value={newDocument.description}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, description: e.target.value })
                }
              />
            </div>
            <div className="form-control font-FontNoto">
              <label className="label">
                <span className="label-text font-FontNoto">หมวดหมู่เอกสาร</span>
              </label>
              <select
                className="select select-bordered font-FontNoto"
                value={newDocument.category}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, category: e.target.value })
                }
              >
                <option className="font-FontNoto" value="">กรุณาเลือกหมวดหมู่เอกสาร</option>
                <option className="font-FontNoto" value="Certificate">ใบลาป่วย</option>
                <option className="font-FontNoto" value="WorkContract">ใบลากิจ</option>
                <option className="font-FontNoto" value="Identification">ใบลาพักร้อน</option>
                <option className="font-FontNoto" value="Maternity">ใบลาคลอด</option>
                <option className="font-FontNoto" value="Ordination">ใบลาบวช</option>
                <option className="font-FontNoto" value="Doc">เอกสารส่วนตัว</option>
                <option className="font-FontNoto" value="Others">อื่นๆ</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-FontNoto">ไฟล์เอกสาร</span>
              </label>
              <input
                type="file"
                className="file-input file-input-bordered font-FontNoto"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <button
            className="btn btn-warning mt-4 w-full font-FontNoto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังอัปโหลด...' : 'อัปโหลดเอกสาร'}
          </button>

        </form>

        {/* ค้นหาเอกสาร */}
        <div className="bg-base-100 p-4 rounded-lg shadow mb-8">
          <h3 className="text-xl font-bold text-black font-FontNoto">ค้นหาชื่อเอกสาร</h3>
          <div className="flex gap-4 mt-4">
            <input
              type="text"
              className="input input-bordered flex-grow font-FontNoto"
              placeholder="ค้นหาชื่อเอกสาร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-info font-FontNoto" onClick={handleSearch}>
              ค้นหา
            </button>
          </div>
        </div>

        {/* แสดงรายการเอกสาร */}
        <div className="bg-base-100 p-4 rounded-lg shadow font-FontNoto">
          <h3 className="text-xl font-bold text-black mb-4 font-FontNoto">รายการเอกสาร</h3>
          <ul className="space-y-4 font-FontNoto">
            {filteredDocuments.map((doc) => {
              const fileExtension = doc.filePath ? doc.filePath.split('.').pop() : "ไม่พบข้อมูล";
              const uploadDate = doc.uploadDate || "จาก HR";
              const fileCategory = categoryMapping[doc.category] || doc.category || "ไม่ระบุหมวดหมู่";
              const fileUrl = doc.filePath ? `https://localhost:7039${doc.filePath}` : null; // สร้าง URL สำหรับดูไฟล์

              return (
                <li
                  key={doc.fileID || Math.random()}
                  className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-lg font-bold font-FontNoto">
                      {doc.description || "ใบลา"}
                    </h4>
                    <p className="text-sm text-gray-600 font-FontNoto">
                      หมวดหมู่เอกสาร: {fileCategory}
                    </p>
                    <p className="text-sm text-gray-600 font-FontNoto">
                      วันที่อัปโหลด: {uploadDate}
                    </p>
                    <p className="text-sm text-gray-600 font-FontNoto">
                      นามสกุลไฟล์: {fileExtension}
                    </p>
                    {doc.uploadedAutomatically && (
                      <p className="text-sm text-green-500 font-FontNoto">
                        (เอกสารจาก HR)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* ปุ่มดูไฟล์ */}
                    <button
                      className="btn btn-outline btn-info font-FontNoto"
                      onClick={() => {
                        if (fileUrl) {
                          window.open(fileUrl, "_blank"); // เปิดไฟล์ในแท็บใหม่
                        } else {
                          alert("ไม่พบไฟล์");
                        }
                      }}
                    >
                      ดูไฟล์
                    </button>
                    {/* ปุ่มลบ */}
                    <button
                      className="btn btn-outline btn-error font-FontNoto"
                      onClick={() => handleOpenDeleteModal(doc.fileID)}
                    >
                      ลบ
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Document;
