import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppFAB() {
  return (
    <motion.a
      href="https://wa.me/213555000001?text=Bonjour%20Honey%20Travel%20-%20Je%20cherche%20un%20hotel%20a%20Istanbul"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ y: { repeat: Infinity, duration: 2 } }}
    >
      <MessageCircle size={24} />
    </motion.a>
  );
}
