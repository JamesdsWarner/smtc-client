import { useState } from "react";
import violetSvg from "../../assets/violet.svg";
import martySvg from "../../assets/marty.svg";

export const FlipCard = ({ card, swap }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Track button hovers independently
  const [isSwapHovered, setIsSwapHovered] = useState(false);
  const [isCompletedHovered, setIsCompletedHovered] = useState(false);

  // Base layout styles shared by both front and back faces
  const cardFaceStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "#FFF",
    borderRadius: "16px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    border: "3px solid #96AD4D",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "20px",
    boxSizing: "border-box",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  const buttonBaseStyle = {
    borderRadius: "15px",
    fontSize: "20px",
    textAlign: "center",
    border: "3px solid #FFF",
    fontWeight: 900,
    fontFamily: "Panton",
    padding: "10px 20px",
    cursor: "pointer",
    height: "fit-content",
    alignSelf: "center",
    transition: "background-color 0.2s ease, color 0.2s ease",
  };

  // import goldieSvg from "../../assets/goldie.svg"; (Add more as you scale!)

  // 2. Create a clean dictionary map linking your backend numeric IDs to the assets
  const ICON_ASSET_MAP: Record<string, string> = {
    "1": violetSvg,
    "2": martySvg,
    // "3": goldieSvg,
  };

  const currentIconSrc = ICON_ASSET_MAP[card.iconId] || violetSvg;

  return (
    /* 1. PERSPECTIVE WRAPPER */
    <div
      style={{
        width: "200px",
        height: "340px",
        perspective: "1000px",
        cursor: "pointer",
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 2. THE INNER ROTATING CONTAINER */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 3. FRONT SIDE */}
        <div style={cardFaceStyle}>
          <img
            src={currentIconSrc}
            alt="Card Icon"
            style={{ width: "65px", height: "65px", margin: "0 auto" }}
          />
          <div>
            <p
              style={{
                fontFamily: "Panton",
                fontSize: "18px",
                fontWeight: 800,
                color: "#4A4A4A",
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              {card.cardPrompt}
            </p>

            <div
              style={{
                height: "6px",
                width: "40px",
                backgroundColor: "#F58C1E",
                borderRadius: "3px",
                margin: "0 auto",
              }}
            />
          </div>
        </div>

        {/* 4. BACK SIDE */}
        <div
          style={{
            ...cardFaceStyle,
            backgroundColor: "#F58C1E",
            border: "3px solid #FFF",
            transform: "rotateY(180deg)",
          }}
        >
          <button
            onMouseEnter={() => setIsSwapHovered(true)}
            onMouseLeave={() => setIsSwapHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Swap clicked!");
              swap(card.cardId, "discarded");
            }}
            style={{
              ...buttonBaseStyle,
              backgroundColor: isSwapHovered ? "#FDE489" : "#96AD4D",
              color: isSwapHovered ? "#F58C1E" : "#FFF",
            }}
          >
            SWAP
          </button>

          <button
            onMouseEnter={() => setIsCompletedHovered(true)}
            onMouseLeave={() => setIsCompletedHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Completed clicked!");
              swap(card.cardId, "success");
            }}
            style={{
              ...buttonBaseStyle,
              backgroundColor: isCompletedHovered ? "#FDE489" : "#96AD4D",
              color: isCompletedHovered ? "#F58C1E" : "#FFF",
            }}
          >
            COMPLETED
          </button>
        </div>
      </div>
    </div>
  );
};
