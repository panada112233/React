import React from "react";

const Home = () => {
    return (
        <section className="relative w-full h-screen bg-lufy flex items-center justify-start px-6 sm:px-16">
            <div className="text-left">
                <h1 className="HomeHeadText font-FontNoto">
                    <span className="text-black">THE</span>{" "}
                    <span className="text-[#FF8800]">EXPERTISE</span>{" "}
                    <span className="text-black">CO,LTD.</span>
                </h1>
                <p className="HomeSubText mt-4 text-black font-bold font-FontNoto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Digital Innovator & Platform Provider
                </p>
            </div>
        </section>
    );
};

export default Home;
