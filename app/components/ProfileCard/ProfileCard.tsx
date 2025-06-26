'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export default function ProfileCard() {
    return (
        <motion.div
            className="w-64 h-80 border-4 border-yellow-400 bg-orange-200 p-2 relative shadow-lg"
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            // --- PERBAIKAN: Mengganti 'shadow' menjadi 'boxShadow' ---
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 25px rgba(251, 191, 36, 0.8)" }}
        >
            {/* Ganti dengan gambar profil Anda di folder /public */}
            <div className="w-full h-48 border-2 border-yellow-600 bg-gray-800">
                <Image
                    src="/profile-pic.jpg" // Pastikan ada gambar ini di /public/profile-pic.jpg
                    alt="Your Name"
                    width={240}
                    height={192}
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="p-2 text-black">
                <h3 className="text-xl font-bold text-center border-t-2 border-b-2 border-yellow-600 my-2">
                    YOUR NAME
                </h3>
                <p className="text-xs text-center">
                    [ATTRIBUTE/CLASS]
                </p>
            </div>
        </motion.div>
    );
}
