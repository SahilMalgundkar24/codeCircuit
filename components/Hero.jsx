"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rippleStyle, setRippleStyle] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Remove TypeScript annotation and use regular JavaScript
  const circleRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    circleRefs.current = circleRefs.current.slice(0, 3);
  }, []);

  const handleGenerate = (e) => {
    if (!inputValue.trim()) return;

    // Get click coordinates
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Calculate distance to farthest corner for complete coverage
    const distanceToCorners = [
      Math.hypot(clickX, clickY), // distance to top-left
      Math.hypot(window.innerWidth - clickX, clickY), // distance to top-right
      Math.hypot(clickX, window.innerHeight - clickY), // distance to bottom-left
      Math.hypot(window.innerWidth - clickX, window.innerHeight - clickY), // distance to bottom-right
    ];

    // Use the maximum distance to ensure full coverage
    const maxRadius = Math.max(...distanceToCorners);

    // Set ripple style centered at click position
    setRippleStyle({
      position: "fixed",
      top: 0,
      left: 0,
      width: `${maxRadius * 2}px`,
      height: `${maxRadius * 2}px`,
      borderRadius: "50%",
      backgroundColor: "#0e0e0e",
      transform: `translate(${clickX - maxRadius}px, ${
        clickY - maxRadius
      }px) scale(0)`,
      transformOrigin: "center",
      transition: "transform 2s cubic-bezier(0.11, 0.67, 0.08, 0.9)",
      zIndex: 9999,
    });

    // Start transition
    setIsTransitioning(true);

    // Trigger ripple expansion after a small delay to ensure style is applied
    setTimeout(() => {
      setRippleStyle((prev) => ({
        ...prev,
        transform: `translate(${clickX - maxRadius}px, ${
          clickY - maxRadius
        }px) scale(1)`,
      }));

      setTimeout(() => {
        // Navigate to mind maps page with the input value as parameter
        router.push(`/mindmaps?rootTitle=${encodeURIComponent(inputValue)}`);

        // Reset transition state after navigation (optional)
        setTimeout(() => {
          setIsTransitioning(false);
          setRippleStyle({});
        }, 700);
      }, 1300);
    }, 10);
  };

  // Track mouse movement
  useEffect(() => {
    // Remove TypeScript type annotation for MouseEvent
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update circle positions with a delay effect
  useEffect(() => {
    const updateCirclePosition = (index, delay) => {
      const circle = circleRefs.current[index];
      if (!circle) return;

      setTimeout(() => {
        // Calculate distance from mouse to create a pull effect
        const currentCx = Number.parseFloat(circle.getAttribute("cx") || "0");
        const currentCy = Number.parseFloat(circle.getAttribute("cy") || "0");

        // Pull factor decreases with circle index (outer circles move less)
        const pullFactor = 0.05 / (index + 1);

        // Calculate new position with smooth following
        const newCx = currentCx + (mousePosition.x - currentCx) * pullFactor;
        const newCy = currentCy + (mousePosition.y - currentCy) * pullFactor;

        // Update circle position
        circle.setAttribute("cx", newCx.toString());
        circle.setAttribute("cy", newCy.toString());
      }, delay);
    };

    // Update each circle with increasing delay
    updateCirclePosition(0, 10);
    updateCirclePosition(1, 30);
    updateCirclePosition(2, 50);

    // Request animation frame for smooth animation
    const animationId = requestAnimationFrame(() => {
      updateCirclePosition(0, 10);
      updateCirclePosition(1, 30);
      updateCirclePosition(2, 50);
    });

    return () => cancelAnimationFrame(animationId);
  }, [mousePosition]);

  return (
    <>
      <div className="mt-28">
        {/* Interactive circular lines */}
        <svg className="fixed inset-0 w-full h-full pointer-events-none -z-5">
          <circle
            ref={(el) => (circleRefs.current[0] = el)}
            cx="50%"
            cy="50%"
            r="150"
            fill="none"
            stroke="#79CDB5"
            strokeWidth="1"
            strokeDasharray="10 5"
            className="opacity-30"
          />
          <circle
            ref={(el) => (circleRefs.current[1] = el)}
            cx="50%"
            cy="50%"
            r="250"
            fill="none"
            stroke="#79CDB5"
            strokeWidth="1"
            strokeDasharray="15 10"
            className="opacity-20"
          />
          <circle
            ref={(el) => (circleRefs.current[2] = el)}
            cx="50%"
            cy="50%"
            r="350"
            fill="none"
            stroke="#79CDB5"
            strokeWidth="1"
            strokeDasharray="5 15"
            className="opacity-10"
          />
        </svg>

        {/* Center blur element with animation */}
        <div className="absolute inset-0 flex justify-center items-center -z-10">
          <div className="w-[600px] h-[600px] bg-[#26583d] opacity-15 blur-3xl rounded-full animate-pulse-slow"></div>
        </div>

        {/* Top-left blur element with different animation */}
        <div className="absolute inset-0 flex -z-10">
          <div className="w-[300px] h-[300px] bg-[#386e51] opacity-15 blur-3xl rounded-full animate-float-slow"></div>
        </div>

        {/* Bottom-right blur element with another animation */}
        <div className="absolute inset-0 justify-end items-end flex -z-10">
          <div className="w-[300px] h-[300px] bg-[#1c7043] opacity-20 blur-3xl rounded-full animate-breathe"></div>
        </div>

        <div className="flex justify-center">
          <div className="px-5 py-2 flex rounded-full border border-[#B9E3D7] text-white text-xs">
            Visualize Your Ideas through Mind Mapping
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl mx-6 font-medium text-center mt-5 text-white">
          Turn Your Thoughts into a <br className="hidden md:flex"></br>Visual
          Mind Map in Seconds
        </h1>

        {isTransitioning && (
          <div style={rippleStyle}>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl font-medium z-[10000] opacity-0 animate-fade-in">
              Creating your mind map...
            </div>
          </div>
        )}

        <div className="flex justify-center mt-20">
          <div className="relative w-80 md:w-2xl">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Mind Map Title..."
              className="w-full px-6 py-4 bg-transparent border border-[#B9E3D7] rounded-full text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B9E3D7] lg:pr-32"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate(e);
              }}
            />
            <button
              onClick={handleGenerate}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm md:text-base bg-[#B9E3D7] text-black font-medium px-6 py-2 rounded-full hover:bg-[#a8d6c7] transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default Hero;
