import React from "react";

const style: React.CSSProperties = {
  width: "50px",
  height: "50px",
  textAlign: "center",
  margin: "0 auto",
  backgroundImage: "radial-gradient(circle, rgb(0 0 0 / 15%) 2px, transparent 3px)",
  backgroundSize: "33.33% 100%",
};

const DotSeparator = () => {
  return <div style={style} />;
};

export default DotSeparator;
