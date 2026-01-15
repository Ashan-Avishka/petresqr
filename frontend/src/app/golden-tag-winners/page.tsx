'use client';

import { motion } from 'framer-motion';
import { Trophy, Sparkles, Calendar, MapPin, Award, QrCode, Shield, Heart, Loader, PartyPopper, Sun, Minimize } from 'lucide-react';

// Mock winner data - replace with your actual data
const winners = [
  {
    id: 1,
    name: "Sarah Johnson",
    petName: "Max",
    petType: "Golden Retriever",
    location: "New York, USA",
    quarter: "Q4 2024",
    drawDate: "December 15, 2024",
    image: "/images/winner-1.jpg",
    testimonial: "We're so grateful for this beautiful golden tag! Max looks so stylish, and knowing he's protected with your QR technology gives us such peace of mind."
  },
  {
    id: 2,
    name: "Michael Chen",
    petName: "Luna",
    petType: "Siamese Cat",
    location: "Los Angeles, USA",
    quarter: "Q3 2024",
    drawDate: "September 28, 2024",
    image: "/images/winner-2.jpg",
    testimonial: "Luna's golden tag is stunning! The quality is exceptional and we love being part of this amazing community."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    petName: "Buddy",
    petType: "Labrador",
    location: "Miami, USA",
    quarter: "Q2 2024",
    drawDate: "June 10, 2024",
    image: "/images/winner-3.jpg",
    testimonial: "This golden tag is absolutely beautiful. Thank you for creating such wonderful products for our furry friends!"
  },
  {
    id: 4,
    name: "James Wilson",
    petName: "Bella",
    petType: "French Bulldog",
    location: "Chicago, USA",
    quarter: "Q1 2024",
    drawDate: "March 15, 2024",
    image: "/images/winner-4.jpg",
    testimonial: "Bella wears her golden tag with pride! It's not just beautiful, it's also giving us the security we need."
  }
];

export default function GoldenTagWinnersPage() {
  const latestWinner = winners[0];
  const previousWinners = winners.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 left-120 text-primary opacity-20"
        >
          <Sparkles size={60} />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-120 text-primary opacity-20"
        >
          <Sparkles size={80} />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-6 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 rounded-full px-6 py-3 mt-20"
          >
            <Trophy className="text-primary" size={24} />
            <span className="text-primary text-lg">Quarterly Winners</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            24K Golden Tag
            <span className="block text-amber-400 mt-2">Winners</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Every quarter, we celebrate one lucky pet owner with an exclusive 24K gold-plated QR code tag. 
            Not only is it a stunning accessory, but it also keeps your beloved pet safe with our advanced pet recovery system.
          </motion.p>
        </div>
      </section>

      {/* About Golden Tag Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-black to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Makes the Golden Tag Special?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/20 to-gray-900/20 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 text-center"
            >
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">24K Gold Plated</h3>
              <p className="text-gray-300 leading-relaxed">
                Crafted with genuine 24K gold plating, this premium tag is not just functional but a luxurious accessory for your pet.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/20 to-gray-900/20 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 text-center"
            >
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart QR Technology</h3>
              <p className="text-gray-300 leading-relaxed">
                Each tag features a unique QR code that instantly connects finders with pet owners, ensuring quick and safe reunions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/20 to-gray-900/20 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 text-center"
            >
              <div className="bg-amber-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-amber-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lifetime Protection</h3>
              <p className="text-gray-300 leading-relaxed">
                Your pet's safety is priceless. The golden tag comes with lifetime access to our pet recovery database.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Winner - Featured */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-bl from-gray-800 via-gray-900 via-60% to-primary border border-primary/30 text-primary px-6 py-2 rounded-full mb-4">
              <PartyPopper size={20} />
              <span>Latest Winner</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-white">
              {latestWinner.quarter} Champion
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary rounded-3xl blur-xl opacity-50"></div>
            
            <div className="relative bg-gradient-to-br from-primary/50 via-black via-40% to-black rounded-3xl border-1 border-primary overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-12">
                {/* Left: Image Section */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative w-80 h-80 rounded-full bg-gradient-to-br from-primary via-black to-black flex items-center justify-center text-white text-8xl font-bold shadow-2xl shadow-amber-400/50"
                    >
                      {latestWinner.name.charAt(0)}
                    </motion.div>
                    
                    {/* Orbiting sparkles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -inset-10"
                    >
                      <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 text-primary opacity-40" size={42} />
                      <Loader className="absolute top-0 left-1/2 -translate-x-1/2 text-primary opacity-40" size={42} />
                      <Sparkles className="absolute bottom-0 left-1/2 -translate-x-1/2 text-primary opacity-40" size={62} />
                      <Loader className="absolute bottom-0 left-1/2 -translate-x-1/2 text-primary opacity-40" size={62} />
                    </motion.div>
                  </div>
                </div>

                {/* Right: Info Section */}
                <div className="flex flex-col justify-center space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="text-primary" size={32} />
                      <span className="text-primary font-bold text-xl">{latestWinner.quarter} Winner</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{latestWinner.name}</h3>
                    <p className="text-gray-400 text-xl mb-4">
                      <MapPin className="inline mr-2" size={20} />
                      {latestWinner.location}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="text-primary" size={24} />
                      <div>
                        <p className="text-white font-bold text-xl">{latestWinner.petName}</p>
                        <p className="text-gray-400">{latestWinner.petType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span className="text-sm">Draw Date: {latestWinner.drawDate}</span>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-6 italic text-gray-300 text-lg">
                    "{latestWinner.testimonial}"
                  </blockquote>

                  <div className="bg-gradient-to-br from-primary to-black rounded-xl p-6 text-white shadow-sm shadow-primary">
                    <div className="flex items-center gap-3 mb-2">
                      <Award size={28} />
                      <span className="font-bold text-xl">Prize Won</span>
                    </div>
                    <p className="text-2xl font-bold">24K Gold Plated QR Tag</p>
                    <p className="text-sm mt-2 opacity-90">Lifetime Pet Protection + Premium Design</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Previous Winners */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Previous Winners
            </h2>
            <p className="text-gray-400 text-lg">Hall of Fame</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previousWinners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-primary/50 transition-all duration-300 h-full">
                  {/* Winner Image Placeholder */}
                  <div className="relative h-64 bg-gradient-to-tl from-black via-black to-primary/20 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-black to-black shadow-md shadow-primary flex items-center justify-center text-white text-4xl font-bold">
                      {winner.name.charAt(0)}
                    </div>
                  </div>

                  {/* Winner Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-400/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {winner.quarter}
                      </span>
                      <Trophy className="text-primary" size={20} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{winner.name}</h3>
                      <p className="text-gray-400 flex items-center gap-1 text-sm mb-2">
                        <MapPin size={14} />
                        {winner.location}
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="text-primary" size={16} />
                        <span className="text-white font-semibold">{winner.petName}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{winner.petType}</p>
                    </div>

                    <p className="text-gray-300 text-sm italic">
                      "{winner.testimonial}"
                    </p>

                    <div className="flex items-center gap-2 text-gray-400 text-xs pt-2 border-t border-gray-700">
                      <Calendar size={14} />
                      <span>{winner.drawDate}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How the Draw Works
            </h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Every three months, we randomly select one customer to receive our exclusive 24K Golden Tag
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Purchase Any Tag", desc: "Buy any of our QR code tags for your pet" },
              { step: "2", title: "Automatic Entry", desc: "You're automatically entered into the quarterly draw" },
              { step: "3", title: "Random Selection", desc: "Winners are drawn randomly every 3 months" },
              { step: "4", title: "Win Golden Tag", desc: "Lucky winner receives the premium 24K golden tag" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-primary via-black to-black w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-md shadow-primary">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 pb-60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-black rounded-3xl p-12 shadow-md shadow-primary"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-whhite mb-6">
              Your Pet Could Win Next !
            </h2>
            <p className="text-gray-300 text-xl mb-4 leading-relaxed">
              Purchase any QR code tag and you'll be automatically entered into our next quarterly draw
            </p>
            <p className="text-gray-300 text-lg mb-8">
              Protect your pet today, and you might just win the exclusive 24K Golden Tag!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-primary font-bold text-lg px-10 py-4 rounded-full shadow-primary transition-colors shadow-md inline-flex items-center gap-3"
            >
              <QrCode size={24} />
              Get Your QR Tag Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}