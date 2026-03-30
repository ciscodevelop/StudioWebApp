import { motion } from "framer-motion";

interface AvatarDisplayProps {
  avatarSrc: string;
  avatarAlt: string;
  message: string;
  playerName: string;
}

export const AvatarDisplay = ({
  avatarSrc,
  avatarAlt,
  message,
  playerName,
}: AvatarDisplayProps) => {
  const normalizedPlayerName = playerName.trim();

  const getSubtitle = () => {
    if (message.includes("🎉")) {
      return `${normalizedPlayerName || "Grande"}!! 😍`;
    }
    if (message.includes("❌")) {
      return `${normalizedPlayerName || "Dai"} 💪`;
    }
    return `${normalizedPlayerName ? `Forza ${normalizedPlayerName}` : "Proviamo"}! ✨`;
  };

  return (
    <div className="avatar">
      <img src={avatarSrc} alt={avatarAlt} />
      <p>{getSubtitle()}</p>
    </div>
  );
};
