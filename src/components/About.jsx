import React from 'react';
import '../About.css'; // Import CSS สำหรับหน้า About

function About() {
  return (
    <div className="about-container font-FontNoto">
      <div className="about-overlay font-FontNoto">
        <h1 className="about-title font-FontNoto">ABOUT US</h1>
        <hr className="about-divider" />
        <p className="about-description font-FontNoto">
          บริษัท ดิ เอคซ-เพอะทีส (The Expertise) จำกัด
          ยินดีต้อนรับสู่ ระบบจัดเก็บเอกสารพนักงาน<br />ที่ออกแบบมาเพื่อตอบสนองความต้องการขององค์กรในยุคดิจิทัล!
          เรามุ่งมั่นที่จะสร้างแพลตฟอร์ม<br />ที่ใช้งานง่ายและมีประสิทธิภาพสำหรับการจัดเก็บข้อมูลพนักงานอย่างครบวงจร
        </p>
        <hr className="about-divider" />
        <h2 className="about-features font-FontNoto">FEATURES</h2>
        <div className="about-description font-FontNoto">
          <p className="about-description font-FontNoto">หน้าแดชบอร์ด: ดูข้อมูลพนักงานและอัปเดตข้อมูลที่สำคัญได้อย่างรวดเร็วและง่ายดาย</p>
          <p className="about-description font-FontNoto">หน้าโปรไฟล์: ข้อมูลส่วนบุคคล การติดต่อ และอื่นๆ</p>
          <p className="about-description font-FontNoto">หน้าประสบการณ์ทำงาน: ข้อมูลส่วนบุคคลและประสบการณ์การทำงาน</p>
          <p className="about-description font-FontNoto">หน้าอัปโหลดและแสดงเอกสาร: ให้พนักงานสามารถอัปโหลดและดาวน์โหลดเอกสารแบบง่ายดาย เพื่อความสะดวกรวดเร็ว</p>
        </div>

      </div>
    </div>
  );
}

export default About;
