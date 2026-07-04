/** Déclenche une classe CSS d'animation une fois, puis la retire. */
export function playOneShotAnimation(element: HTMLElement | null, className: string): void {
  if (!element) return;

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);

  element.addEventListener(
    'animationend',
    () => {
      element.classList.remove(className);
    },
    { once: true },
  );
}
