import React, { useState, useEffect } from "react";

function Typewriter({
  text = [],
  speed = 70,
  deleteSpeed = 40,
  waitTime = 1500,
  className = "",
  cursorChar = "|",
}) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (!isDeleting && charIndex <= text[index].length) {
      timeout = setTimeout(() => {
        setDisplayText(text[index].substring(0, charIndex));
        setCharIndex(charIndex + 1);
      }, speed);
    } else if (isDeleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayText(text[index].substring(0, charIndex));
        setCharIndex(charIndex - 1);
      }, deleteSpeed);
    } else if (!isDeleting && charIndex > text[index].length) {
      // Wait before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
        setCharIndex(charIndex - 1);
      }, waitTime);
    } else if (isDeleting && charIndex < 0) {
      setIsDeleting(false);
      setIndex((index + 1) % text.length);
      setCharIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index, text, speed, deleteSpeed, waitTime]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink">{cursorChar}</span>
      <style>{`
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export default Typewriter;
