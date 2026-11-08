import { useEffect, useState } from "react";
import { cityToday } from "./offer-fields";

export function useCityToday() {
  const [today, setToday] = useState(cityToday);

  useEffect(() => {
    const refresh = () => setToday(cityToday());
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return today;
}
