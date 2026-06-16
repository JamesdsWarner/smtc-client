import { useParams } from "@tanstack/react-router";
import "../../App.css";
import { useEffect, useRef, useState } from "react";
import { FlipCard } from "../../molecules";

interface SessionData {
  id: string;
  roomCode: string;
  hostId: string;
  status: string;
  createdAt: string;
}

interface PlayerData {
  id: string;
  name: string;
}

interface SessionUserCard {
  id: string;
  sessionId: string;
  userId: string;
  cardId: string;
  status: string;
  createdAt: string;
  cardPrompt: string;
  iconId: string;
  gameModeId: string;
  cardCategoryId: string;
}

export const Game = () => {
  const { roomCode } = useParams({ from: "/$roomCode" });
  const [getSessionLoading, setGetSessionLoading] = useState(false);
  const [getSessionError, setGetSessionError] = useState<string | null>(null);
  const [getSessionData, setGetSessionData] = useState(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [startGameLoading, setStartGameLoading] = useState(false);
  const [startGameError, setStartGameError] = useState<string | null>(null);
  const [hostId, setHostId] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");
  const [fetchCardsLoading, setFetchCardsLoading] = useState(false);
  const [fetchCardsError, setFetchCardsError] = useState<string | null>(null);
  const [cards, setCards] = useState<SessionUserCard[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);

  // 🌟 Simple toggle state for your card deck
  const [areCardsHidden, setAreCardsHidden] = useState(false);
  const [isShowHovered, setIsShowHovered] = useState(false);

  const sessionIdRef = useRef("");
  const formattedRoomCode = roomCode.replace("-", " ");

  useEffect(() => {
    const handleGetSession = async () => {
      setGetSessionLoading(true);
      setGetSessionError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/sessions/${roomCode}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          setGetSessionError(errorData.message);
          throw new Error(errorData.message || "Failed to get game room");
        }

        const data: SessionData = await response.json();
        localStorage.setItem("game_user_id", data.hostId);
        localStorage.setItem("current_session_id", data.id);

        sessionIdRef.current = data.id;
        setHostId(data.hostId);
        setSessionStatus(data.status);
      } catch (err: any) {
        setGetSessionError(err.message || "Something went wrong");
      } finally {
        setGetSessionLoading(false);
      }
    };
    if (roomCode) handleGetSession();
  }, [roomCode]);

  useEffect(() => {
    const handleGetPlayers = async () => {
      setPlayersLoading(true);
      setPlayersError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/sessions/${roomCode}/players`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load players");
        }

        const data: PlayerData[] = await response.json();
        setPlayers(data);
      } catch (err: any) {
        setPlayersError(err.message || "Could not load players");
      } finally {
        setPlayersLoading(false);
      }
    };

    if (roomCode) handleGetPlayers();
  }, [roomCode]);

  const startGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartGameLoading(true);
    setStartGameError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${sessionIdRef.current}/update-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress", userId: hostId }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create game room");
      }

      const data: SessionData = await response.json();
      localStorage.setItem("game_user_id", data.hostId);
      localStorage.setItem("current_session_id", data.id);

      setSessionStatus(data.status);
    } catch (err: any) {
      setStartGameError(err.message || "Something went wrong");
    } finally {
      setStartGameLoading(false);
    }
  };

  useEffect(() => {
    const fetchMyCards = async () => {
      const sessionId = localStorage.getItem("current_session_id");
      const userId = localStorage.getItem("game_user_id");
      if (!sessionId || !userId) {
        setFetchCardsError("Missing session or player credentials.");
        return;
      }

      setFetchCardsLoading(true);
      setFetchCardsError(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/sessions/${sessionId}/players/${userId}/cards`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load your hand");
        }

        const data: SessionUserCard[] = await response.json();
        setCards(data);
      } catch (err: any) {
        setFetchCardsError(
          err.message || "Something went wrong fetching cards",
        );
      } finally {
        setFetchCardsLoading(false);
      }
    };

    fetchMyCards();
  }, [sessionStatus]);

  interface CardSwapResult {
    success: boolean;
    updatedHand: any[];
  }

  // 🌟 actionType now defaults to "discarded" if not passed
  async function executeCardSwap(
    cardId: string,
    actionType: "discarded" | "success" = "discarded",
  ): Promise<CardSwapResult> {
    try {
      // STEP 1: Update the status dynamically based on what was passed in
      const discardResponse = await fetch(
        `http://localhost:3000/api/sessions/${sessionIdRef.current}/cards/${cardId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: hostId, status: actionType }),
        },
      );

      if (!discardResponse.ok)
        throw new Error(`Failed to update card to ${actionType}`);

      // STEP 2: Conditional execution gate
      // Only fetch a brand new replacement card if they are SWAPPING (discarding).
      const drawResponse = await fetch(
        `http://localhost:3000/api/sessions/${sessionIdRef.current}/players/${hostId}/cards`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountOfCards: 1 }),
        },
      );

      if (!drawResponse.ok) {
        const errorData = await drawResponse.json();
        throw new Error(
          errorData.message || "Drawing a replacement card failed!",
        );
      }

      // STEP 3: Fetch the player's refreshed hand layout
      const handResponse = await fetch(
        `http://localhost:3000/api/sessions/${sessionIdRef.current}/players/${hostId}/cards`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!handResponse.ok) throw new Error("Failed to reload your hand");

      const updatedHand = await handResponse.json();
      setCards(updatedHand);

      // 🌟 STEP 4: Fetch the fresh session user data to get the updated score
      const userResponse = await fetch(
        `http://localhost:3000/api/sessions/${sessionIdRef.current}/players/${hostId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Save the updated score directly into your local component state!
        setPlayerScore(userData.score);
      }

      return { success: true, updatedHand };
    } catch (error: any) {
      console.error("Card Action Failure:", error.message);
      alert(`Card action aborted: ${error.message}`);
      return { success: false, updatedHand: [] };
    }
  }

  return (
    <div className="p-6 text-center">
      <div
        style={{
          marginBottom: "70px",
        }}
      >
        <h2
          style={{
            color: "#96AD4D",
            fontSize: "40px",
            fontWeight: 900,
            fontFamily: "Panton",
          }}
        >
          Your room code is
        </h2>
        <h1
          style={{
            color: "#F58C1E",
            fontSize: "60px",
            fontWeight: 900,
            fontFamily: "Panton",
            wordSpacing: "20px",
            margin: 0,
            marginBottom: "15px",
          }}
        >
          {formattedRoomCode}
        </h1>
      </div>

      {sessionStatus !== "in_progress" && (
        <>
          <p
            style={{
              color: "#96AD4D",
              fontSize: "20px",
              fontWeight: 900,
              fontFamily: "Panton",
            }}
          >
            Tell your friends to join using this room name!
          </p>
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h3
              style={{
                color: "#96AD4D",
                fontSize: "24px",
                fontWeight: 900,
                fontFamily: "Panton",
                textAlign: "left",
                marginBottom: "15px",
              }}
            >
              Players in Lobby ({players.length})
            </h3>

            {playersLoading && (
              <p style={{ color: "#96AD4D", fontFamily: "Panton" }}>
                Loading squad...
              </p>
            )}
            {playersError && (
              <p style={{ color: "red", fontFamily: "Panton" }}>
                {playersError}
              </p>
            )}

            {!playersLoading && players.length === 0 && (
              <p
                style={{
                  color: "#ccc",
                  fontFamily: "Panton",
                  textAlign: "left",
                }}
              >
                Waiting for players to join...
              </p>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    textAlign: "left",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#4A4A4A",
                    fontFamily: "Panton",
                    textTransform: "capitalize",
                    borderLeft: "5px solid #F58C1E",
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>
            {hostId && sessionStatus !== "in_progress" && (
              <button
                className="my-button"
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: "30px",
                  fontSize: "40px",
                  textAlign: "center",
                  border: "none",
                  fontWeight: 900,
                  color: "#000",
                  fontFamily: "Panton",
                  marginBottom: "30px",
                }}
                onClick={startGame}
              >
                START GAME
              </button>
            )}
          </div>
        </>
      )}

      {cards && cards.length > 0 && (
        <div>
          {fetchCardsLoading && (
            <p style={{ color: "#96AD4D", fontFamily: "Panton" }}>
              Dealing your cards...
            </p>
          )}
          {fetchCardsError && (
            <p style={{ color: "red", fontFamily: "Panton" }}>
              {fetchCardsError}
            </p>
          )}

          {/* 🃏 CONDITIONAL RENDER: Grid of cards vs. One placeholder card */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {areCardsHidden ? (
              /* THE PLACEHOLDER CARD (Visually matches the back of your regular cards) */
              <div
                style={{
                  width: "200px",
                  height: "340px",
                  backgroundColor: "#F58C1E",
                  borderRadius: "16px",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  border: "3px solid #FFF",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <button
                  onMouseEnter={() => setIsShowHovered(true)}
                  onMouseLeave={() => setIsShowHovered(false)}
                  onClick={() => setAreCardsHidden(false)}
                  style={{
                    borderRadius: "15px",
                    fontSize: "24px",
                    textAlign: "center",
                    border: "3px solid #FFF",
                    fontWeight: 900,
                    fontFamily: "Panton",
                    padding: "15px 25px",
                    cursor: "pointer",
                    height: "fit-content",
                    alignSelf: "center",
                    backgroundColor: isShowHovered ? "#FDE489" : "#96AD4D",
                    color: isShowHovered ? "#F58C1E" : "#FFF",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                  }}
                >
                  SHOW
                  <span style={{ display: "block" }}>CARDS</span>
                </button>
              </div>
            ) : (
              /* THE REGULAR CARDS GRID */
              <>
                {cards.map((card) => {
                  if (card.status === "active")
                    return (
                      <FlipCard
                        key={card.id}
                        swap={executeCardSwap}
                        card={card}
                      />
                    );
                })}
              </>
            )}
          </div>
        </div>
      )}
      {sessionStatus === "in_progress" && (
        <div style={{ marginTop: "30px" }}>
          {!areCardsHidden && (
            <button
              onClick={() => setAreCardsHidden(true)}
              className="hide-cards-btn"
            >
              HIDE
              <span style={{ display: "block" }}>CARDS</span>
            </button>
          )}

          <div
            style={{
              margin: "40px 0",
              fontFamily: "Panton",
              fontSize: "44px",
              fontWeight: 900,
              color: "#96AD4D",
            }}
          >
            Your Score: <span style={{ color: "#F58C1E" }}>{playerScore}</span>{" "}
            pts
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
