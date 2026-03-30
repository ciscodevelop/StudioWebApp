import { AvatarKey } from "../types/game.types";

interface AvatarPickerProps {
  selectedAvatar: AvatarKey;
  onAvatarSelect: (avatar: AvatarKey) => void;
  avatarF: string;
  avatarM: string;
}

export const AvatarPicker = ({
  selectedAvatar,
  onAvatarSelect,
  avatarF,
  avatarM,
}: AvatarPickerProps) => {
  return (
    <div className="card avatar-picker-card">
      <h2>🧑 Scegli Avatar</h2>
      <div className="avatar-options">
        <button
          type="button"
          className={`avatar-option ${selectedAvatar === "avatarF" ? "active" : ""}`}
          onClick={() => onAvatarSelect("avatarF")}
          aria-label="Scegli avatar F"
        >
          <img src={avatarF} alt="Avatar F" />
        </button>

        <button
          type="button"
          className={`avatar-option ${selectedAvatar === "avatarM" ? "active" : ""}`}
          onClick={() => onAvatarSelect("avatarM")}
          aria-label="Scegli avatar M"
        >
          <img src={avatarM} alt="Avatar M" />
        </button>
      </div>
    </div>
  );
};
