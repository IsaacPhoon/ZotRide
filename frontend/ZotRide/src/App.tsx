import { useState } from 'react'
import { motion } from 'framer-motion'

const App = () => {
  const [count, setCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Hero Section with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-white mb-4">
            ZotRide Test Components
          </h1>
          <p className="text-xl text-white/90">
            Tailwind CSS + DaisyUI + Framer Motion
          </p>
        </motion.div>

        {/* DaisyUI Card with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card bg-base-100 shadow-2xl"
        >
          <div className="card-body">
            <h2 className="card-title text-3xl">Animated Counter</h2>
            <p className="text-lg">Click the button to increment the counter with animation!</p>

            <motion.div
              key={count}
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-6xl font-bold text-primary text-center my-4"
            >
              {count}
            </motion.div>

            <div className="card-actions justify-end">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn btn-primary"
                onClick={() => setCount(count + 1)}
              >
                Increment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn btn-secondary"
                onClick={() => setCount(0)}
              >
                Reset
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* DaisyUI Buttons Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 shadow-2xl"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl">Button Variants</h2>
            <div className="flex flex-wrap gap-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-primary">
                Primary
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary">
                Secondary
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-accent">
                Accent
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-info">
                Info
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-success">
                Success
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-warning">
                Warning
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-error">
                Error
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Collapse/Accordion */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-base-100 shadow-2xl"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Animated Collapse</h2>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-outline btn-primary w-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Hide' : 'Show'} Content
            </motion.button>

            <motion.div
              initial={false}
              animate={{
                height: isOpen ? 'auto' : 0,
                opacity: isOpen ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-base-200 rounded-lg mt-4">
                <p className="text-lg">
                  This is some hidden content that appears with a smooth animation!
                  Framer Motion makes it easy to create beautiful transitions.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Alert Components */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Info: This is an informational alert with hover animation!</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Success: Your components are working perfectly!</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Warning: Remember to configure your theme!</span>
          </motion.div>
        </motion.div>

        {/* Badge Examples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="card bg-base-100 shadow-2xl"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl">Badges with Animation</h2>
            <div className="flex flex-wrap gap-4">
              <motion.span whileHover={{ scale: 1.2 }} className="badge badge-primary badge-lg">
                Primary
              </motion.span>
              <motion.span whileHover={{ scale: 1.2 }} className="badge badge-secondary badge-lg">
                Secondary
              </motion.span>
              <motion.span whileHover={{ scale: 1.2 }} className="badge badge-accent badge-lg">
                Accent
              </motion.span>
              <motion.span whileHover={{ scale: 1.2 }} className="badge badge-ghost badge-lg">
                Ghost
              </motion.span>
              <motion.span whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }} className="badge badge-success badge-lg">
                Spin Me!
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Loading Spinners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="card bg-base-100 shadow-2xl"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl">Loading Spinners</h2>
            <div className="flex flex-wrap gap-8 items-center">
              <span className="loading loading-spinner loading-xs"></span>
              <span className="loading loading-spinner loading-sm"></span>
              <span className="loading loading-spinner loading-md"></span>
              <span className="loading loading-spinner loading-lg"></span>
              <span className="loading loading-dots loading-lg"></span>
              <span className="loading loading-ring loading-lg"></span>
              <span className="loading loading-ball loading-lg"></span>
              <span className="loading loading-bars loading-lg"></span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default App