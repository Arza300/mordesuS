/** Coarse pointer / touch-primary devices (phones, many tablets). */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches
  );
}
