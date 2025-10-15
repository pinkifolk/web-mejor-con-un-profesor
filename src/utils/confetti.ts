import confetti from "canvas-confetti";

export function thowConfetti() {
  confetti({
    particleCount: 100,
    spread: 100,
    angle: 60,
    origin: { x: 0, y: 1 },
  });
  confetti({
    particleCount: 100,
    spread: 100,
    angle: 120,
    origin: { x: 1, y: 1 },
  });
}
