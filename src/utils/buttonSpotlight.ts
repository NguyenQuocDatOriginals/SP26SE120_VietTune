// Utility to add spotlight effect to buttons
export const addButtonSpotlightEffect = (button: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    button.style.setProperty("--mouse-x", `${x}%`);
    button.style.setProperty("--mouse-y", `${y}%`);
  };

  button.addEventListener("mousemove", handleMouseMove);

  return () => {
    button.removeEventListener("mousemove", handleMouseMove);
  };
};

// Automatically apply spotlight effect to all liquid glass buttons on mount
export const initializeButtonSpotlights = () => {
  const buttons = document.querySelectorAll(
    ".btn-liquid-glass, .btn-liquid-glass-primary, .btn-liquid-glass-secondary"
  );
  const cleanupFunctions: (() => void)[] = [];

  buttons.forEach((button) => {
    if (button instanceof HTMLElement) {
      cleanupFunctions.push(addButtonSpotlightEffect(button));
    }
  });

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
};
