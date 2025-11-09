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

  // Stagger container for text elements
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Child animation for staggered text
  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="about-grid"
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-20 px-4"
    >
      <div className="max-w-7xl mx-auto space-y-32">
        {/* First Hero Section - Image on Left, Content on Right */}
        <motion.div
          className="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <div className="hero-content flex-col lg:flex-row-reverse justify-between gap-16 w-full">
            <motion.div
              className="max-w-lg lg:ml-auto"
              variants={containerVariants}
            >
              <motion.div variants={childVariants} className="mb-4">
                <div className="badge badge-primary badge-lg font-semibold">
                  🎒 For Riders
                </div>
              </motion.div>
              <motion.h2
                variants={childVariants}
                className="text-6xl font-bold text-gray-900 mb-6 hover:text-blue-600 transition-colors duration-300"
              >
                Don't have a car? Arrange a ride with ZotRide!
              </motion.h2>
              <motion.p
                variants={childVariants}
                className="text-xl text-gray-600"
              >
                Browse available rides from fellow Anteaters, or post your own
                ride request. Enter your pickup and destination, choose your
                preferred time, and let drivers come to you. Join rides
                instantly and split costs with other riders heading the same
                way!
              </motion.p>
              <motion.div variants={childVariants} className="mt-6 flex gap-3">
                <div className="badge badge-outline border-blue-500 text-blue-600">
                  Quick Match
                </div>
                <div className="badge badge-outline border-blue-500 text-blue-600">
                  Cost Sharing
                </div>
                <div className="badge badge-outline border-blue-500 text-blue-600">
                  Instant Booking
                </div>
              </motion.div>
            </motion.div>
            <motion.figure
              className="lg:mr-auto"
              variants={fadeInLeft}
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <img
                  src={zotride_arrange}
                  alt="Feature illustration"
                  className="max-w-lg rounded-lg shadow-2xl ring-4 ring-blue-100"
                />
                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  🚀 Easy & Fast
                </div>
              </div>
            </motion.figure>
          </div>
        </motion.div>

        {/* Divider with icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          className="flex justify-center"
        >
          <div className="divider divider-neutral w-64">
            <span className="text-4xl">🎓</span>
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
            <motion.div
              className="max-w-lg lg:mr-auto"
              variants={containerVariants}
            >
              <motion.div variants={childVariants} className="mb-4">
                <div className="badge badge-secondary badge-lg font-semibold">
                  🎉 For Organizations
                </div>
              </motion.div>
              <motion.h2
                variants={childVariants}
                className="text-6xl font-bold text-gray-900 mb-6 hover:text-purple-600 transition-colors duration-300"
              >
                Club needs ride planning? We've got you covered!
              </motion.h2>
              <motion.p
                variants={childVariants}
                className="text-xl text-gray-600"
              >
                Create or join student organizations and coordinate group rides
                effortlessly. Use access codes to manage your club's private
                ride network, authorize trusted drivers, and keep everyone
                connected. Perfect for hackathons, events, and regular club
                activities!
              </motion.p>
              <motion.div variants={childVariants} className="mt-6 flex gap-3">
                <div className="badge badge-outline border-purple-500 text-purple-600">
                  Private Network
                </div>
                <div className="badge badge-outline border-purple-500 text-purple-600">
                  Event Rides
                </div>
                <div className="badge badge-outline border-purple-500 text-purple-600">
                  Admin Controls
                </div>
              </motion.div>
            </motion.div>
            <motion.figure
              className="lg:ml-auto"
              variants={fadeInRight}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <img
                  src={zotride_club}
                  alt="Feature illustration"
                  className="max-w-lg rounded-lg shadow-2xl ring-4 ring-purple-100"
                />
                <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  🤝 Better Together
                </div>
              </div>
            </motion.figure>
          </div>
        </motion.div>

        {/* Divider with icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          className="flex justify-center"
        >
          <div className="divider divider-neutral w-64">
            <span className="text-4xl">💰</span>
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
            <motion.div
              className="max-w-lg lg:ml-auto"
              variants={containerVariants}
            >
              <motion.div variants={childVariants} className="mb-4">
                <div className="badge badge-accent badge-lg font-semibold">
                  🚗 For Drivers
                </div>
              </motion.div>
              <motion.h2
                variants={childVariants}
                className="text-6xl font-bold text-gray-900 mb-6 hover:text-yellow-600 transition-colors duration-300"
              >
                Low on Money? Make some quick cash!
              </motion.h2>
              <motion.p
                variants={childVariants}
                className="text-xl text-gray-600"
              >
                Become a verified ZotDriver and turn your daily commute into
                income. Accept ride requests, host your own rides, and choose
                between free rides, gas money, or earn extra fees. Upload your
                license, set your schedule, and start driving on your own terms!
              </motion.p>
              <motion.div variants={childVariants} className="mt-6 flex gap-3">
                <div className="badge badge-outline border-yellow-500 text-yellow-600">
                  Flexible Hours
                </div>
                <div className="badge badge-outline border-yellow-500 text-yellow-600">
                  Verified System
                </div>
                <div className="badge badge-outline border-yellow-500 text-yellow-600">
                  Earn Money
                </div>
              </motion.div>
            </motion.div>
            <motion.figure
              className="lg:mr-auto"
              variants={fadeInLeft}
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <img
                  src={zotride_money}
                  alt="Feature illustration"
                  className="max-w-md rounded-lg shadow-2xl ring-4 ring-yellow-100"
                />
                <div className="absolute -bottom-4 -right-4 bg-yellow-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                  💵 Start Earning
                </div>
              </div>
            </motion.figure>
          </div>
        </motion.div>

        {/* Call to Action at the bottom */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-3xl p-12 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-5xl font-bold text-white mb-6">
              Ready to ZotRide?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of Anteaters already riding together. Sign up today
              and get your first ride!
            </p>
            <motion.div
              className="flex gap-4 justify-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <motion.div variants={childVariants}>
                <div className="stat bg-white/20 backdrop-blur-sm rounded-xl text-white">
                  <div className="stat-title text-white/80">Active Riders</div>
                  <div className="stat-value">1,000+</div>
                </div>
              </motion.div>
              <motion.div variants={childVariants}>
                <div className="stat bg-white/20 backdrop-blur-sm rounded-xl text-white">
                  <div className="stat-title text-white/80">
                    Rides Completed
                  </div>
                  <div className="stat-value">5,000+</div>
                </div>
              </motion.div>
              <motion.div variants={childVariants}>
                <div className="stat bg-white/20 backdrop-blur-sm rounded-xl text-white">
                  <div className="stat-title text-white/80">Organizations</div>
                  <div className="stat-value">50+</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutGrid;
