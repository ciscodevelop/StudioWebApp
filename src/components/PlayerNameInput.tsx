interface PlayerNameInputProps {
  playerName: string;
  onNameChange: (name: string) => void;
}

export const PlayerNameInput = ({
  playerName,
  onNameChange,
}: PlayerNameInputProps) => {
  return (
    <div className="card name-card">
      <h2>✍️ Nome</h2>
      <input
        className="name-input"
        type="text"
        value={playerName}
        maxLength={20}
        onChange={(e) =>
          onNameChange(
            e.target.value.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ\s'-]/g, ""),
          )
        }
        placeholder="Scrivi il tuo nome"
      />
    </div>
  );
};
