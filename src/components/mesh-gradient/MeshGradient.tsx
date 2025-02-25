import { ReactNode, useEffect } from "react";
import { Gradient } from "./Gradient";

const MeshGradient = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Initialize the gradient after the component mounts
    const gradient = new Gradient();
    gradient.initGradient("#gradient-canvas");
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Canvas for the gradient background */}
      <canvas
        id="gradient-canvas"
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          "--gradient-color-1": "#FF8019",
          "--gradient-color-2": "#a3d3f9",
          "--gradient-color-3": "#fcd6d6",
          transform:
            "translateY(var(--s-transform-align-y)) translate(var(--s-transform-x), var(--s-transform-y)) rotate(var(--s-transform-rotate)) scale(var(--s-transform-scale)) var(--s-transform)",
          "--s-transform": "skewY(-12deg)",
          "--s-transform-align-y": 0,
          "--s-transform-x": 0,
          "--s-transform-y": 0,
          "--s-transform-rotate": "0deg",
          "--s-transform-scale": 1,
          height: "calc(290px + 10.6278vw)",
          top: "calc(-10.6278vw)"
        }}
      />
      <div className="container max-w-[1080px] h-full my-0 mx-auto flex flex-col justify-between items-center relative border-none shadow-none">
        {children}
      </div>
    </div>
  );
};

export default MeshGradient;
