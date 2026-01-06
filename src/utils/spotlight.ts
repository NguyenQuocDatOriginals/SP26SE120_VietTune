// Utility to add spotlight effect to containers
export const addSpotlightEffect = (element: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    element.style.setProperty("--mouse-x", `${x}%`);
    element.style.setProperty("--mouse-y", `${y}%`);
  };

  element.addEventListener("mousemove", handleMouseMove);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
  };
};
