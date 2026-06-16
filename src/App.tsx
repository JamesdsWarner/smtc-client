import { useState } from "react";
import "../App.css";
// import michael from "./assets/mark.jpg";
// import robert from "./assets/greyhound.jpeg";
import logo from "./assets/smtc-logo.png";

function App() {
  const [count, setCount] = useState(0);
  const [players, setPlayers] = useState([{ name: "" }]);
  console.log("players", players);

  const addNewPlayer = () => {
    const newPlayers = [...players, { name: "" }];

    setPlayers(newPlayers);
  };

  return (
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
          >
            NEW GAME
          </button>
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
          >
            JOIN GAME
          </button>
        </div>
      </section>

      {/* <section id="next-steps">
        <div style={{ gap: "20px", display: "flex", flexDirection: "column" }}>
          <h3>Enter player names:</h3>
          {players.map((player, id) => {
            return (
              <div style={{ gap: "20px", display: "flex" }}>
                <input
                  onChange={(event) => {
                    console.log("value:", event.target.value);
                    const newPlayers = players.map((player, i) => {
                      if (id === i) return { name: event.target.value };
                      else return player;
                    });

                    setPlayers(newPlayers);

                    console.log(newPlayers);
                  }}
                  value={player.name}
                ></input>
              </div>
            );
          })}

          <button onClick={() => addNewPlayer()}>Add new player</button>
        </div>
      </section> */}
      <div className="ticks">Mit Mo Melly Games</div>
    </>
  );
}

export default App;
