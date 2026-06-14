'use client';

import { motion } from 'framer-motion';
import { Truck, Award, CreditCard, Zap, RotateCcw, Headphones } from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Worldwide Shipping',
    description: 'We provide the best offers to our valued customers',
  },
  {
    icon: Award,
    title: 'Best Quality',
    description: 'We offer best quality tags there are. Get your tag today!',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'We offer secure payments to our customers always',
  },
  {
    icon: Zap,
    title: 'Best Offers',
    description: 'We provide the best offers to our valued customers',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle-free returns within 30 days guaranteed',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Our team is here to help you anytime',
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
    <section className="relative min-h-[600px] sm:min-h-[700px] lg:h-[800px] bg-gradient-to-bl from-primary via-black/50 to-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-3/4 md:w-2/3 lg:w-auto opacity-30 sm:opacity-50 lg:opacity-100">
        <img
          src="/images/services-bg.png" 
          alt="Services Background" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl"
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
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl shadow-amber-950/40 transition-all duration-300 h-full">
                <div className="flex flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <service.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
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