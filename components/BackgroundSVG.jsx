"use client";
import { useEffect, useRef, useState } from "react";

const BackgroundSVG = ({ mousePosition }) => {
  // Create refs for circles and lines
  const circleRefs = useRef([]);
  const lineRefs = useRef([]);
  const dotRefs = useRef([]);
  const [time, setTime] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1000,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Generate random dots for the background
  const [dots, setDots] = useState([]);

  // Initialize random dots
  useEffect(() => {
    const newDots = [];
    const dotCount = 30; // Number of floating dots

    for (let i = 0; i < dotCount; i++) {
      newDots.push({
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    setDots(newDots);

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize refs arrays
  useEffect(() => {
    circleRefs.current = circleRefs.current.slice(0, 5);
    lineRefs.current = lineRefs.current.slice(0, 8);
    dotRefs.current = dotRefs.current.slice(0, dots.length);
  }, [dots.length]);

  // Animation timer
  useEffect(() => {
    let frameId;
    const animate = () => {
      setTime((prev) => prev + 1);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Update dots position
  useEffect(() => {
    const updateDots = () => {
      setDots((prevDots) =>
        prevDots.map((dot, i) => {
          // Get current dot element
          const dotEl = dotRefs.current[i];
          if (!dotEl) return dot;

          // Update position based on speed
          let newX = dot.x + dot.speedX;
          let newY = dot.y + dot.speedY;

          // Bounce off edges
          if (newX < 0 || newX > windowSize.width) {
            dot.speedX *= -1;
            newX = dot.x + dot.speedX;
          }

          if (newY < 0 || newY > windowSize.height) {
            dot.speedY *= -1;
            newY = dot.y + dot.speedY;
          }

          // Update dot position
          dotEl.setAttribute("cx", newX.toString());
          dotEl.setAttribute("cy", newY.toString());

          // Mouse influence - slight attraction to mouse
          const distX = mousePosition.x - newX;
          const distY = mousePosition.y - newY;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < 200) {
            // Increase opacity when near mouse
            const opacityBoost = 1 - distance / 200;
            dotEl.setAttribute(
              "opacity",
              (dot.opacity + opacityBoost * 0.2).toString()
            );
          } else {
            dotEl.setAttribute("opacity", dot.opacity.toString());
          }

          return {
            ...dot,
            x: newX,
            y: newY,
          };
        })
      );
    };

    const animationId = requestAnimationFrame(updateDots);
    return () => cancelAnimationFrame(animationId);
  }, [time, mousePosition, windowSize]);

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

        // Add subtle pulsing based on mouse movement
        const baseSize = [150, 250, 350, 100, 200][index];
        const pulseAmount = Math.sin(time * 0.02) * 5;
        const movementPulse =
          (Math.abs(mousePosition.x - currentCx) +
            Math.abs(mousePosition.y - currentCy)) *
          0.01;
        circle.setAttribute(
          "r",
          (baseSize + pulseAmount + movementPulse).toString()
        );
      }, delay);
    };

    // Update each circle with increasing delay
    for (let i = 0; i < 5; i++) {
      updateCirclePosition(i, i * 15);
    }

    // Request animation frame for smooth animation
    const animationId = requestAnimationFrame(() => {
      for (let i = 0; i < 5; i++) {
        updateCirclePosition(i, i * 15);
      }
    });

    return () => cancelAnimationFrame(animationId);
  }, [mousePosition, time]);

  // Update decorative lines
  useEffect(() => {
    const updateLinePosition = (index, delay) => {
      const line = lineRefs.current[index];
      if (!line) return;

      setTimeout(() => {
        // Get wave patterns based on time
        const timeOffset = time * 0.01;
        const sinWave = Math.sin(timeOffset) * 20;
        const cosWave = Math.cos(timeOffset) * 20;

        // Different movement patterns for different lines
        switch (index) {
          case 0:
            // Gentle wave pattern influenced by mouse
            line.setAttribute(
              "d",
              `M0,50 Q${mousePosition.x / 8},${50 + sinWave} ${
                windowSize.width
              },50`
            );
            break;
          case 1:
            // Responsive diagonal line
            line.setAttribute(
              "d",
              `M0,${windowSize.height} L${mousePosition.x * 0.7},${
                mousePosition.y * 0.7
              }`
            );
            break;
          case 2:
            // Curved path that follows mouse
            line.setAttribute(
              "d",
              `M0,${windowSize.height / 2} Q${mousePosition.x / 2},${
                mousePosition.y
              } ${windowSize.width},${windowSize.height / 2}`
            );
            break;
          case 3:
            // Dynamic horizontal line
            line.setAttribute(
              "d",
              `M0,${mousePosition.y * 0.8} L${windowSize.width},${
                mousePosition.y * 0.8 + sinWave
              }`
            );
            break;
          case 4:
            // Dynamic vertical line
            line.setAttribute(
              "d",
              `M${mousePosition.x * 0.8},0 L${
                mousePosition.x * 0.8 + cosWave
              },${windowSize.height}`
            );
            break;
          case 5:
            // Floating bezier curve
            line.setAttribute(
              "d",
              `M${windowSize.width * 0.2},${windowSize.height * 0.3} 
              C${windowSize.width * 0.4 + sinWave * 5},${
                windowSize.height * 0.1
              } 
              ${windowSize.width * 0.6 + cosWave * 5},${windowSize.height * 0.7}
              ${windowSize.width * 0.8},${windowSize.height * 0.5}`
            );
            break;
          case 6:
            // Abstract wave pattern
            line.setAttribute(
              "d",
              `M0,${windowSize.height * 0.7} 
              Q${windowSize.width * 0.25},${
                windowSize.height * 0.6 + sinWave * 2
              } 
              ${windowSize.width * 0.5},${
                windowSize.height * 0.7 + cosWave * 1.5
              }
              T${windowSize.width},${windowSize.height * 0.65}`
            );
            break;
          case 7:
            // Mouse-influenced diagonal
            const startY = windowSize.height * 0.1;
            const endY = windowSize.height * 0.9;
            const midX = windowSize.width * 0.5;
            const mouseInfluence = (mousePosition.x - midX) * 0.3;
            line.setAttribute(
              "d",
              `M0,${startY} Q${midX + mouseInfluence},${(startY + endY) / 2} ${
                windowSize.width
              },${endY}`
            );
            break;
        }
      }, delay);
    };

    // Update each line with different delays
    for (let i = 0; i < 8; i++) {
      updateLinePosition(i, i * 10);
    }

    const animationId = requestAnimationFrame(() => {
      for (let i = 0; i < 8; i++) {
        updateLinePosition(i, i * 10);
      }
    });

    return () => cancelAnimationFrame(animationId);
  }, [mousePosition, time, windowSize]);

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none -z-5">
      {/* Background definitions */}
      <defs>
        <pattern
          id="smallGrid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#79CDB5"
            strokeWidth="0.5"
            opacity="0.1"
          />
        </pattern>
        <pattern
          id="grid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100" height="100" fill="url(#smallGrid)" />
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="#79CDB5"
            strokeWidth="1"
            opacity="0.2"
          />
        </pattern>

        {/* Radial gradient for glow effects */}
        <radialGradient
          id="mouseGlow"
          cx="0.5"
          cy="0.5"
          r="0.5"
          fx="0.5"
          fy="0.5"
        >
          <stop offset="0%" stopColor="#79CDB5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#79CDB5" stopOpacity="0" />
        </radialGradient>

        {/* Filters for glows */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Grid background */}
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.05" />

      {/* Mouse glow effect */}
      <circle
        cx={mousePosition.x}
        cy={mousePosition.y}
        r="100"
        fill="url(#mouseGlow)"
        opacity="0.3"
      >
        <animate
          attributeName="r"
          values="80;120;80"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Floating dots */}
      {dots.map((dot, i) => (
        <circle
          key={i}
          ref={(el) => (dotRefs.current[i] = el)}
          cx={dot.x}
          cy={dot.y}
          r={dot.size}
          fill="#79CDB5"
          opacity={dot.opacity}
        />
      ))}

      {/* Interactive decorative lines */}
      <path
        ref={(el) => (lineRefs.current[0] = el)}
        d={`M0,50 Q400,70 ${windowSize.width},50`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="1"
        opacity="0.15"
      />
      <path
        ref={(el) => (lineRefs.current[1] = el)}
        d={`M0,${windowSize.height} L400,300`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="1"
        strokeDasharray="5,10"
        opacity="0.2"
      />
      <path
        ref={(el) => (lineRefs.current[2] = el)}
        d={`M0,300 Q400,400 ${windowSize.width},300`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="1"
        opacity="0.15"
      />
      <path
        ref={(el) => (lineRefs.current[3] = el)}
        d={`M0,400 L${windowSize.width},400`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      />
      <path
        ref={(el) => (lineRefs.current[4] = el)}
        d={`M400,0 L400,${windowSize.height}`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      />
      <path
        ref={(el) => (lineRefs.current[5] = el)}
        d={`M${windowSize.width * 0.2},${windowSize.height * 0.3} 
           C${windowSize.width * 0.4},${windowSize.height * 0.1} 
           ${windowSize.width * 0.6},${windowSize.height * 0.7}
           ${windowSize.width * 0.8},${windowSize.height * 0.5}`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.7"
        opacity="0.13"
        strokeDasharray="8,12"
      />
      <path
        ref={(el) => (lineRefs.current[6] = el)}
        d={`M0,${windowSize.height * 0.7} 
           Q${windowSize.width * 0.25},${windowSize.height * 0.6} 
           ${windowSize.width * 0.5},${windowSize.height * 0.7}
           T${windowSize.width},${windowSize.height * 0.65}`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      />
      <path
        ref={(el) => (lineRefs.current[7] = el)}
        d={`M0,${windowSize.height * 0.1} Q${windowSize.width * 0.5},${
          windowSize.height * 0.5
        } ${windowSize.width},${windowSize.height * 0.9}`}
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.6"
        opacity="0.15"
        strokeDasharray="2,8"
      />

      {/* Interactive circular lines */}
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

      {/* Additional interactive circles */}
      <circle
        ref={(el) => (circleRefs.current[3] = el)}
        cx="30%"
        cy="40%"
        r="100"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.6"
        strokeDasharray="3 8"
        className="opacity-15"
      />
      <circle
        ref={(el) => (circleRefs.current[4] = el)}
        cx="70%"
        cy="60%"
        r="200"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        strokeDasharray="2 12"
        className="opacity-10"
      />

      {/* Additional decorative elements */}
      <circle
        cx="75%"
        cy="25%"
        r="50"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      >
        <animate
          attributeName="r"
          values="50;70;50"
          dur="10s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="1,10;5,10;10,10;5,10;1,10"
          dur="17s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="25%"
        cy="75%"
        r="30"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      >
        <animate
          attributeName="r"
          values="30;50;30"
          dur="7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.1;0.2;0.1"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Static decorative elements */}
      <circle
        cx="85%"
        cy="70%"
        r="15"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      >
        <animate
          attributeName="r"
          values="15;25;15"
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="15%"
        cy="30%"
        r="20"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.1"
      >
        <animate
          attributeName="r"
          values="20;35;20"
          dur="9s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Connecting lines */}
      <line
        x1="25%"
        y1="75%"
        x2="75%"
        y2="25%"
        stroke="#79CDB5"
        strokeWidth="0.5"
        strokeDasharray="5,15"
        opacity="0.1"
      />

      <line
        x1="15%"
        y1="30%"
        x2="85%"
        y2="70%"
        stroke="#79CDB5"
        strokeWidth="0.5"
        strokeDasharray="3,10"
        opacity="0.08"
      />

      {/* Hexagonal pattern */}
      <polygon
        points="50,150 150,150 200,250 150,350 50,350 0,250"
        fill="none"
        stroke="#79CDB5"
        strokeWidth="0.5"
        opacity="0.07"
        transform="translate(600, 200)"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0,10;5,10;10,10;15,10;20,10;15,10;10,10;5,10;0,10"
          dur="20s"
          repeatCount="indefinite"
        />
      </polygon>

      {/* Node connections - simulate a mind map structure */}
      <g opacity="0.05">
        <circle cx="50%" cy="50%" r="5" fill="#79CDB5" />
        <circle cx="45%" cy="40%" r="3" fill="#79CDB5" />
        <circle cx="55%" cy="35%" r="2" fill="#79CDB5" />
        <circle cx="60%" cy="55%" r="3" fill="#79CDB5" />
        <circle cx="40%" cy="60%" r="4" fill="#79CDB5" />
        <circle cx="35%" cy="45%" r="2" fill="#79CDB5" />

        <line
          x1="50%"
          y1="50%"
          x2="45%"
          y2="40%"
          stroke="#79CDB5"
          strokeWidth="0.8"
        />
        <line
          x1="50%"
          y1="50%"
          x2="55%"
          y2="35%"
          stroke="#79CDB5"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};

export default BackgroundSVG;
