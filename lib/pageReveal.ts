// Signals when the first-load loader has lifted, so page intros can wait
// for it instead of playing behind the overlay.
let revealed = false;
const listeners = new Set<() => void>();

export function markPageRevealed() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onPageRevealed(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
