import { useState } from "react";
import "../../App.css";

export const Lobby = () => {
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface SessionData {
    id: string;
    roomCode: string;
    hostId: string;
    status: string;
    createdAt: string;
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Adjust URL based on your local development port
      const response = await fetch(
        "http://localhost:3000/api/sessions/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, pin: "1234" }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create game room");
      }

      const data: SessionData = await response.json();

      // Store credentials so this browser tab can act as the authorized host
      localStorage.setItem("game_user_id", data.hostId);
      localStorage.setItem("current_session_id", data.id);

      // Set state to trigger re-render and show the lobby screen
      setSession(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="center">
        <label
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "#96AD4D",
            fontFamily: "Panton",
            marginBottom: "60px",
          }}
        >
          ENTER YOUR NAME
        </label>
        <input
          style={{
            backgroundColor: "#FFF",
            fontSize: "40px",
            textAlign: "center",
            border: "none",
            fontWeight: 900,
            color: "#000",
            fontFamily: "Panton",
            marginBottom: "30px",
          }}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button
          className="my-button"
          style={{
            backgroundColor: "#F58C1E",
            borderRadius: "30px",
            fontSize: "40px",
            fontWeight: 900,
            color: "#FDE489",
            fontFamily: "Panton",
            cursor: "pointer",
            marginBottom: "30px",
          }}
          onClick={handleCreateSession}
        >
          CREATE GAME
        </button>
      </section>
      <section id="next-steps"></section>

      <div className="ticks">Mit Mo Melly Games</div>
    </>
  );
};

export default Lobby;
