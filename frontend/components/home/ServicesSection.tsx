'use client';

import { motion } from 'framer-motion';
import { Truck, Award, CreditCard, Tag } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Worldwide Shipping',
    description: 'We provide the best offers to our valued customers',
  },
  {
    icon: Award,
    title: 'Best Quality',
    description: 'We offer best quality tags there are. Get you tog today!',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'We offer secure payments to our customers because...',
  },
  {
    icon: Tag,
    title: 'Best Offers',
    description: 'We provide the best offers to our valued customers',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function ServicesSection() {
  return (
    <section className="relative h-[1100px] bg-amber-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute right-0 h-[900px]">
        <img
          src="/images/services-bg.png" 
          alt="Services Background" 
          className="w-full h-full object-cover "
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl inset-0 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
        </motion.div>

        {/* <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-300 rounded-full blur-3xl" /> */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.3 } 
              }}
              className="group"
            >
              <div className="bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl shadow-amber-950/40 transition-all duration-300 h-full">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-14 h-14 text-amber-700" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}