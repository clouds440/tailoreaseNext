import { useContext, useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import UserContext from "@/utils/UserContext";

const TrendPop = () => {
  const { theme } = useContext(UserContext);
  const [city, setCity] = useState("");
  const [trendData, setTrendData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 5500,
    responseMimeType: "application/json",
  };

  const model = useMemo(
    () =>
      genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig,
      }),
    []
  );

  const getUserCity = async () => {
    try {
      const res = await axios.get("https://ipwhois.app/json/");
      return res.data.city || "Unknown";
    } catch (error) {
      console.error(error);
      return "Unknown";
    }
  };

  const getSeasonFromDate = (date = new Date()) => {
    const month = date.getMonth() + 1; // Jan = 0, so add 1
    const year = date.getFullYear();
    if ([12, 1, 2].includes(month)) return "Winter, " + year;
    if ([3, 4, 5].includes(month)) return "Spring, " + year;
    if ([6, 7, 8].includes(month)) return "Summer, " + year;
    if ([9, 10, 11].includes(month)) return "Autumn, " + year;

    return "Unknown";
  };

  const season = getSeasonFromDate();

  useEffect(() => {
    const getTrends = async () => {
      const cityName = await getUserCity();
      setCity(cityName);

      const prompt = `
        You're an AI fashion advisor. Based on current global fashion trends and the city/country "${cityName}", and it's currently "${season}" there. 
        Tell me what styles, colors, and fabrics are popular now. 
        Give the output as JSON like:
        {
          "season": ${season},
          "styles": ["baggy jeans", "linen blazers"],
          "fabrics": ["cotton", "linen"],
          "suggestion": "Try pairing a linen blazer with pastel cotton pants for a breathable spring outfit."
        }
      `;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text);
        setTrendData(data);
        setIsVisible(true);
      } catch (err) {
        console.error("Error fetching trends:", err);
      }
    };

    getTrends();
  }, []);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 10000);

      return () => clearTimeout(timerRef.current);
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current); // pause
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 7000); // resume with some remaining time (or reset full 10s if you want)
  };

  return (
    <AnimatePresence>
      {isVisible && trendData && (
        <motion.div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={`fixed top-6 right-4 bg-white shadow-lg p-4 rounded-2xl w-[300px] ${theme.colorText} ${theme.mainTheme} z-50`}
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl"
          >
            ×
          </button>

          <h2 className="text-xl font-semibold mb-2">🌍 Trends in {city}</h2>
          <p className="text-sm mb-1">
            <strong>Season:</strong> {trendData.season}
          </p>
          <p className="text-sm mb-1">
            <strong>Styles:</strong> {trendData.styles.join(", ")}
          </p>
          <p className="text-sm mb-1">
            <strong>Fabrics:</strong> {trendData.fabrics.join(", ")}
          </p>
          <p className={`text-sm ${theme.iconColor} mt-2 italic`}>
            {trendData.suggestion}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrendPop;
