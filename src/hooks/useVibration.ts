import { useEffect } from "react";

export const useVibration = () => {
  const vibrate = (type: "success" | "error") => {
    if (!navigator.vibrate) return;
    if (type === "success") {
      navigator.vibrate([100, 50, 100]);
    } else {
      navigator.vibrate(200);
    }
  };

  return { vibrate };
};
