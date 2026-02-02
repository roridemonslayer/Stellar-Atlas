"use client";

import { useEffect, useRef, useMemo } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color?: { r: number; g: number; b: number };
}

interface Galaxy {
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: { r: number; g: number; b: number };
  type: "spiral" | "elliptical" | "nebula";
}

interface StarfieldProps {
  starCount?: number;
  speed?: number;
  ambient?: boolean;
}

export function Starfield({
  starCount = 1500,
  speed = 0.3,
  ambient = false,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const galaxiesRef = useRef<Galaxy[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  // Star color palette
  const starColors = [
    { r: 255, g: 255, b: 255 }, // White
    { r: 200, g: 220, b: 255 }, // Blue-white
    { r: 255, g: 240, b: 220 }, // Warm white
    { r: 180, g: 200, b: 255 }, // Light blue
    { r: 255, g: 200, b: 180 }, // Light orange
  ];

  const stars = useMemo(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      // Create varied star sizes - mostly small with some medium and few large
      const sizeRandom = Math.random();
      let size: number;
      if (sizeRandom < 0.7) {
        // 70% tiny stars (background dust)
        size = Math.random() * 0.8 + 0.2;
      } else if (sizeRandom < 0.92) {
        // 22% small-medium stars
        size = Math.random() * 1.5 + 0.8;
      } else {
        // 8% larger, brighter stars
        size = Math.random() * 2.5 + 1.5;
      }

      newStars.push({
        x: Math.random() * 3000 - 1500,
        y: Math.random() * 3000 - 1500,
        z: Math.random() * 1500,
        size,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
    return newStars;
  }, [starCount]);

  // Generate distant galaxies and nebulae
  const galaxies = useMemo(() => {
    const newGalaxies: Galaxy[] = [];
    const galaxyColors = [
      { r: 100, g: 120, b: 180 }, // Blue nebula
      { r: 150, g: 100, b: 160 }, // Purple nebula
      { r: 180, g: 140, b: 100 }, // Orange/brown galaxy
      { r: 120, g: 160, b: 140 }, // Teal nebula
      { r: 160, g: 120, b: 180 }, // Violet galaxy
    ];

    for (let i = 0; i < 8; i++) {
      newGalaxies.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 150 + 80,
        rotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.15 + 0.05,
        color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
        type: ["spiral", "elliptical", "nebula"][
          Math.floor(Math.random() * 3)
        ] as Galaxy["type"],
      });
    }
    return newGalaxies;
  }, []);

  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    galaxiesRef.current = galaxies;
  }, [galaxies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    // Draw a galaxy/nebula
    const drawGalaxy = (galaxy: Galaxy, parallaxX: number, parallaxY: number) => {
      const x = galaxy.x * canvas.width + parallaxX * 0.02;
      const y = galaxy.y * canvas.height + parallaxY * 0.02;
      const { r, g, b } = galaxy.color;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(galaxy.rotation + time * 0.001);

      if (galaxy.type === "spiral") {
        // Draw spiral galaxy
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath();
          for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 3 + (arm * Math.PI);
            const radius = (i / 100) * galaxy.size;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius * 0.4;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${galaxy.opacity * 0.5})`;
          ctx.lineWidth = galaxy.size * 0.15;
          ctx.lineCap = "round";
          ctx.filter = `blur(${galaxy.size * 0.1}px)`;
          ctx.stroke();
        }
        // Core glow
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.3);
        coreGradient.addColorStop(0, `rgba(${r + 50}, ${g + 50}, ${b + 50}, ${galaxy.opacity * 0.8})`);
        coreGradient.addColorStop(1, "transparent");
        ctx.filter = `blur(${galaxy.size * 0.05}px)`;
        ctx.fillStyle = coreGradient;
        ctx.fillRect(-galaxy.size * 0.3, -galaxy.size * 0.3, galaxy.size * 0.6, galaxy.size * 0.6);
      } else if (galaxy.type === "elliptical") {
        // Draw elliptical galaxy
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
        gradient.addColorStop(0, `rgba(${r + 30}, ${g + 30}, ${b + 30}, ${galaxy.opacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${galaxy.opacity * 0.4})`);
        gradient.addColorStop(1, "transparent");
        ctx.filter = `blur(${galaxy.size * 0.15}px)`;
        ctx.fillStyle = gradient;
        ctx.scale(1, 0.6);
        ctx.beginPath();
        ctx.arc(0, 0, galaxy.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw nebula
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${galaxy.opacity * 0.6})`);
        gradient.addColorStop(0.4, `rgba(${r - 20}, ${g + 20}, ${b + 30}, ${galaxy.opacity * 0.3})`);
        gradient.addColorStop(1, "transparent");
        ctx.filter = `blur(${galaxy.size * 0.2}px)`;
        ctx.fillStyle = gradient;
        // Irregular shape for nebula
        ctx.beginPath();
        ctx.ellipse(0, 0, galaxy.size, galaxy.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Secondary cloud
        ctx.beginPath();
        ctx.ellipse(galaxy.size * 0.3, galaxy.size * 0.2, galaxy.size * 0.5, galaxy.size * 0.4, Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.filter = "none";
    };

    const animate = () => {
      time += 0.016;
      // Much darker background
      ctx.fillStyle = "rgba(4, 6, 18, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Subtle parallax based on mouse position
      const parallaxX = (mouseRef.current.x - 0.5) * 30;
      const parallaxY = (mouseRef.current.y - 0.5) * 30;

      // Draw distant galaxies and nebulae first (background layer)
      galaxiesRef.current.forEach((galaxy) => {
        drawGalaxy(galaxy, parallaxX, parallaxY);
      });

      starsRef.current.forEach((star) => {
        // Move star towards viewer
        star.z -= speed * (ambient ? 0.3 : 1);

        // Reset star if it goes behind the camera
        if (star.z <= 0) {
          star.z = 1500;
          star.x = Math.random() * 3000 - 1500;
          star.y = Math.random() * 3000 - 1500;
        }

        // Project 3D to 2D with parallax
        const scale = 600 / star.z;
        const x = star.x * scale + centerX + parallaxX * scale * 0.1;
        const y = star.y * scale + centerY + parallaxY * scale * 0.1;

        // Calculate size and opacity based on depth
        const size = star.size * scale * 0.5;
        const depthOpacity = Math.min(1, (1500 - star.z) / 800);

        // Twinkle effect
        const twinkle =
          Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.3 +
          0.7;
        const finalOpacity = star.opacity * depthOpacity * twinkle;

        // Skip if off screen
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) {
          return;
        }

        // Draw star with glow using star's color
        const color = star.color || { r: 255, g: 255, b: 255 };
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(
          0,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${finalOpacity})`
        );
        gradient.addColorStop(
          0.3,
          `rgba(${color.r * 0.8}, ${color.g * 0.85}, ${color.b}, ${finalOpacity * 0.5})`
        );
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core of the star - brighter
        ctx.beginPath();
        ctx.fillStyle = `rgba(${Math.min(255, color.r + 30)}, ${Math.min(255, color.g + 30)}, ${Math.min(255, color.b + 30)}, ${finalOpacity})`;
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [speed, ambient]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
