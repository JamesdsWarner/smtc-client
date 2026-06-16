import { useRef, useState } from "react";
import "../../App.css";
// import michael from "./assets/mark.jpg";
// import robert from "./assets/greyhound.jpeg";
import logo from "../../assets/smtc-logo.png";
import { useNavigate } from "@tanstack/react-router";

export const Home = () => {
  const [players, setPlayers] = useState([{ name: "" }]);
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewGame, setIsNewGame] = useState<boolean>(false);
  const [isJoinGame, setIsJoinGame] = useState<boolean>(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const navigate = useNavigate();

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

      // // Set state to trigger re-render and show the lobby screen
      // setSession(data);

      await navigate({
        to: "/$roomCode",
        params: { roomCode: data.roomCode }, // Replace 'data.roomCode' with whatever property your API uses
      });
      console.log(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedRoomCode = roomCodeInput
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      // Adjust URL based on your local development port
      const response = await fetch(
        `http://localhost:3000/api/sessions/${normalizedRoomCode}/add-player`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName,
            pin: "1234",
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join game room");
      }

      const data: SessionData = await response.json();

      // Store credentials so this browser tab can act as the authorized host
      // localStorage.setItem("game_user_id", data.hostId);
      // localStorage.setItem("current_session_id", data.id);

      // // Set state to trigger re-render and show the lobby screen
      // setSession(data);

      await navigate({
        to: "/$roomCode",
        params: { roomCode: normalizedRoomCode }, // Replace 'data.roomCode' with whatever property your API uses
      });
      console.log(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addNewPlayer = () => {
    const newPlayers = [...players, { name: "" }];

    setPlayers(newPlayers);
  };

  const newGameOnClick = () => {
    setIsNewGame(true);
  };

  const joinGameOnClick = () => {
    setIsJoinGame(true);
  };

  const resetHome = () => {
    setIsNewGame(false);
    setIsJoinGame(false);
  };

  const isLandingView = !isNewGame && !isJoinGame;

  return (
    <>
      {!isLandingView && (
        <button className="home-back-button" onClick={resetHome}>
          ← BACK
        </button>
      )}

      {isLandingView && (
        <>
          <section id="center">
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
              <img width="900px" src={logo}></img>
            </div>
          </section>
          <section id="next-steps">
            <div
              style={{
                display: "flex",
                gap: "30px",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* <Link to="/lobby"> */}
              <button
                className="my-button"
                style={{
                  backgroundColor: "#96AD4D",
                  borderRadius: "30px",
                  // border: "none",
                  fontSize: "80px",
                  fontWeight: 900,
                  color: "#FDE489",
                  width: "600px",
                  fontFamily: "Panton",
                  cursor: "pointer",
                }}
                onClick={newGameOnClick}
              >
                NEW GAME
              </button>
              {/* </Link> */}
              <button
                className="my-button"
                style={{
                  backgroundColor: "#F58C1E",
                  borderRadius: "30px",
                  // border: "none",
                  fontSize: "80px",
                  fontWeight: 900,
                  color: "#FDE489",
                  width: "600px",
                  fontFamily: "Panton",
                  cursor: "pointer",
                }}
                onClick={joinGameOnClick}
              >
                JOIN GAME
              </button>
            </div>
          </section>
        </>
      )}
      <section id="center">
        {isJoinGame && (
          <>
            <label
              style={{
                fontSize: "80px",
                fontWeight: 900,
                color: "#96AD4D",
                fontFamily: "Panton",
                marginBottom: "60px",
              }}
            >
              ENTER THE ROOM CODE
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
              onChange={(e) => setRoomCodeInput(e.target.value)}
            />
          </>
        )}

        {(isNewGame || isJoinGame) && (
          <>
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
              onClick={isNewGame ? handleCreateSession : handleJoinSession}
            >
              {isNewGame ? "CREATE GAME" : "JOIN GAME"}
            </button>
          </>
        )}
      </section>

      <div className="ticks">Mit Mo Melly Games</div>
    </>
  );
};

export default Home;
