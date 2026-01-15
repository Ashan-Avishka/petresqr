'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  Building2, 
  Stethoscope, 
  Leaf, 
  Lightbulb, 
  QrCode, 
  Truck,
  Shield,
  Droplets,
  Wind,
  Microscope,
  Activity,
  Pill,
  Syringe,
  Dog
} from 'lucide-react';

export default function PawResQRAboutPage() {
  const features = [
    {
      icon: Building2,
      title: "Sustainable Shelter Facility",
      description: "A comprehensive facility with kennels, exercise areas, quarantine zones, kitchen, fenced dog park, swimming pool, and storage areas"
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Design",
      description: "Reducing waste, conserving energy and water, recycling, using reusable items, and choosing energy-efficient appliances"
    },
    {
      icon: Lightbulb,
      title: "Sustainable Infrastructure",
      description: "Solar energy, wind turbines, LED lights, low voltage security surveillance, tube water well, and composting animal waste into fertilizer"
    },
    {
      icon: Stethoscope,
      title: "24/7 Emergency Hospital",
      description: "Full-service veterinary hospital with diagnostic imaging, surgical facilities, and round-the-clock emergency care"
    }
  ];

  const medicalEquipment = [
    { category: "Diagnostic Imaging", items: ["Veterinary Ultrasounds", "X-ray Machines"] },
    { category: "Anesthesia Equipment", items: ["Breathing Anesthesia Machines", "Anesthesia Laryngoscopes"] },
    { category: "Analysis Instruments", items: ["Blood Analyzers", "Urine Analyzers", "Biochemical Instruments"] },
    { category: "Surgical Equipment", items: ["Surgical Tables & Lights", "AutoClave Sterilization", "Dental Units"] },
    { category: "Monitoring Systems", items: ["Patient Monitors", "IV Pumps", "Vital Signs Equipment"] },
    { category: "Basic Medical Tools", items: ["Stethoscopes", "Otoscopes", "Centrifuges", "Microscopes", "Thermometers"] }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-80 pb-35">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -mt-40"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 text-primary px-6 py-2 rounded-full mb-4"
          >
            <Heart className="text-primary" size={24} />
            <span className="text-primary text-lg">A Mission to Save Lives</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Launch Paw ResQR
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-300 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
          >
            A Lifesaving Rescue Hub for Sri Lanka's Stray Animals
          </motion.p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="pb-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-900/20 to-gray-800/50 rounded-3xl p-12 border border-red-500/30"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              The Crisis in Sri Lanka
            </h2>
            <p className="text-gray-300 text-xl leading-relaxed text-center max-w-4xl mx-auto">
              One of the major problems in Sri Lanka is the huge amount of stray animals roaming the streets in every town. 
              It is estimated that there are <span className="text-primary font-bold">over 3 million strays</span>, 
              many of whom suffer from starvation, malnutrition, diseases, and severe injuries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Solution
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              A comprehensive facility designed to rescue, rehabilitate, and protect stray animals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-tl from-primary/50 via-black to-black rounded-2xl p-8 border border-primary/20 hover:border-primary/50 transition-all"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Equipment */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 text-primary px-6 py-2 rounded-full mb-4">
              <Stethoscope className="text-primary" size={24} />
              <span className="text-primary">State-of-the-Art Equipment</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              24/7 Emergency Animal Hospital
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Fully equipped with diagnostic imaging, anesthesia machines, blood and urine analysis instruments, and comprehensive medical tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalEquipment.map((equipment, index) => (
              <motion.div
                key={equipment.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/20 via-black to-black rounded-xl p-6 border border-primary/20"
              >
                <h3 className="text-xl font-bold text-primary mb-4">{equipment.category}</h3>
                <ul className="space-y-2">
                  {equipment.items.map((item) => (
                    <li key={item} className="text-gray-300 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-black via-primary/20 to-black rounded-2xl p-8 border border-primary/20"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Pill className="text-primary mx-auto mb-4" size={40} />
                <h4 className="text-lg font-bold text-white mb-2">Medications</h4>
                <p className="text-gray-400">Comprehensive drug supply in tablets, capsules, liquids, creams, and patches</p>
              </div>
              <div className="text-center">
                <Syringe className="text-primary mx-auto mb-4" size={40} />
                <h4 className="text-lg font-bold text-white mb-2">Medical Instruments</h4>
                <p className="text-gray-400">Bandages, gauze, syringes, surgical equipment, and infection control supplies</p>
              </div>
              <div className="text-center">
                <Dog className="text-primary mx-auto mb-4" size={40} />
                <h4 className="text-lg font-bold text-white mb-2">Mobility Support</h4>
                <p className="text-gray-400">Wheelchairs and carts for canines with mobility issues</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QR Collar Technology */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 text-primary font-bold px-6 py-2 rounded-full mb-4">
                <QrCode className="text-primary" size={24} />
                <span className="text-primary">Smart Technology</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                QR Code Safety Collars
              </h2>
              <div className="space-y-4 text-gray-300 text-lg">
                <p>
                  Each rescued animal will receive a high-quality collar with integrated QR code technology, providing vital information about their vaccination, spaying/neutering status, and organizational care.
                </p>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Collar Features:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Shield className="text-primary mt-1 flex-shrink-0" size={20} />
                      <span><strong className="text-white">Night Reflective:</strong> 3M reflective tape that shines brightly in vehicle headlights, reducing accident risks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <QrCode className="text-primary mt-1 flex-shrink-0" size={20} />
                      <span><strong className="text-white">QR Code Linked:</strong> Instant access to vaccination, spay/neuter records, and organizational information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Droplets className="text-primary mt-1 flex-shrink-0" size={20} />
                      <span><strong className="text-white">Premium Materials:</strong> Duraflex buckle, stainless steel O-ring, Dupont nylon fabric, sandwich mesh padding, waterproof and breathable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/20 to-gray-800 rounded-3xl p-12 border border-primary/30">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <QrCode className="text-primary mx-auto mb-6" size={80} />
                  <h3 className="text-2xl font-bold text-white mb-4">Mobile App Integration</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Upon scanning the QR code, users are directed to download the Paw ResQR app from their device's app store, providing instant access to the animal's complete profile and medical history.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transportation */}
      <section className="py-20 bg-gradient-to-l from-black via-primary/40 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 text-primary font-bold px-6 py-2 rounded-full mb-4">
              <Truck className="text-primary" size={24} />
              <span className="text-primary">Rescue Operations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Paw ResQR Transport
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Dedicated rescue vehicles to safely transport injured animals, puppies, kittens, and senior dogs/cats in need of shelter and medical attention throughout Sri Lanka
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Goal: Transform Lives
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "3M+", label: "Stray Animals in Sri Lanka", icon: Heart },
              { number: "24/7", label: "Emergency Care Available", icon: Activity },
              { number: "100%", label: "Sustainable Facility", icon: Leaf },
              { number: "∞", label: "Lives We Can Save", icon: Shield }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary/20 via-black to-black rounded-2xl p-8 border border-primary/20 text-center hover:border-primary/50 transition-all"
              >
                <stat.icon className="text-primary mx-auto mb-4" size={40} />
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 pb-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-black rounded-3xl p-12 shadow-md shadow-primary"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Help Us Make This Vision a Reality
            </h2>
            <p className="text-gray-300 text-xl mb-8 leading-relaxed max-w-5xl">
              Your support will help us build a sustainable animal shelter with a 24/7 emergency hospital, medical equipment, QR-linked safety collars, rescue transport, and lifelong care for animals in need.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://www.gofundme.com/f/Please-Kindly-Help-Launch-Paw-ResQR', '_blank')}
              className="bg-black text-primary font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-900 transition-colors shadow-md shadow-primary inline-flex items-center gap-3"
            >
              <Heart size={24} />
              Donate Now
            </motion.button>
            <p className="text-gray-400 text-sm mt-4">Every contribution brings us closer to saving innocent lives</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}