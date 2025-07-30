import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const openCalendar = () => {
    window.open("https://calendar.google.com/calendar/appointments/schedules/AcZssZ2KkMjW8QjV4bP0XOlLqHgJ7vUHX0YzB8R8kN_t2K4LrZp2Q1MzX5Y7W9B3?gv=true", "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 lg:hidden">
      <button
        onClick={openCalendar}
        className="bg-secondary text-black font-bold py-3 px-4 rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 flex items-center animate-pulse"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Book Free Consultation
      </button>
    </div>
  );
}