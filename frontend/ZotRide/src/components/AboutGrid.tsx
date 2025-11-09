import React from "react";
import { motion, type Variants } from "framer-motion";
import zotride_arrange from "../assets/zotride_arrange.png";
import zotride_club from "../assets/zotride_club.png";
import zotride_money from "../assets/zotride_money.png";

const AboutGrid: React.FC = () => {
  // Animation variants for fade-in from left
  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  // Animation variants for fade-in from right
  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section id="about-grid" className="min-h-screen bg-white pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* First Hero Section - Image on Left, Content on Right */}
        <motion.div
          className="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <div className="hero-content flex-col lg:flex-row-reverse justify-between gap-16 w-full">
            <motion.div className="max-w-lg lg:ml-auto" variants={fadeInRight}>
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Don't have a car? Arrange a ride with ZotRide!
              </h2>
              <p className="text-xl text-gray-600">
                Browse available rides from fellow Anteaters, or post your own
                ride request. Enter your pickup and destination, choose your
                preferred time, and let drivers come to you. Join rides
                instantly and split costs with other riders heading the same
                way!
              </p>
            </motion.div>
            <motion.figure className="lg:mr-auto" variants={fadeInLeft}>
              <img
                src={zotride_arrange}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </motion.figure>
          </div>
        </motion.div>

        {/* Second Hero Section - Image on Right, Content on Left */}
        <motion.div
          className="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <div className="hero-content flex-col lg:flex-row justify-between gap-16 w-full">
            <motion.div className="max-w-lg lg:mr-auto" variants={fadeInLeft}>
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Club needs ride planning? We've got you covered!
              </h2>
              <p className="text-xl text-gray-600">
                Create or join student organizations and coordinate group rides
                effortlessly. Use access codes to manage your club's private
                ride network, authorize trusted drivers, and keep everyone
                connected. Perfect for hackathons, events, and regular club
                activities!
              </p>
            </motion.div>
            <motion.figure className="lg:ml-auto" variants={fadeInRight}>
              <img
                src={zotride_club}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </motion.figure>
          </div>
        </motion.div>

        {/* Third Hero Section - Image on Left, Content on Right */}
        <motion.div
          className="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <div className="hero-content flex-col lg:flex-row-reverse justify-between gap-16 w-full">
            <motion.div className="max-w-lg lg:ml-auto" variants={fadeInRight}>
              <h2 className="text-6xl font-bold text-gray-900 mb-6">
                Low on Money? Make some quick cash!
              </h2>
              <p className="text-xl text-gray-600">
                Become a verified ZotDriver and turn your daily commute into
                income. Accept ride requests, host your own rides, and choose
                between free rides, gas money, or earn extra fees. Upload your
                license, set your schedule, and start driving on your own terms!
              </p>
            </motion.div>
            <motion.figure className="lg:mr-auto" variants={fadeInLeft}>
              <img
                src={zotride_money}
                alt="Feature illustration"
                className="max-w-lg rounded-lg shadow-2xl"
              />
            </motion.figure>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutGrid;
