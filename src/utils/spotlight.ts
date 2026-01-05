// Utility to add spotlight effect to containers
export const addSpotlightEffect = (element: HTMLElement) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    element.style.setProperty("--mouse-x", `${x}%`);
    element.style.setProperty("--mouse-y", `${y}%`);
  };

  const handleClick = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create multiple concentric ripples like water waves
    const rippleCount = 3;
    for (let i = 0; i < rippleCount; i++) {
      setTimeout(() => {
        const ripple = document.createElement("div");
        ripple.className = "water-ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = "10px";
        ripple.style.height = "10px";
        ripple.style.marginLeft = "-5px";
        ripple.style.marginTop = "-5px";

        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
          ripple.remove();
        }, 1500);
      }, i * 150); // Delay each ripple for wave effect
    }
  };

  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("click", handleClick);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("click", handleClick);
  };
};
