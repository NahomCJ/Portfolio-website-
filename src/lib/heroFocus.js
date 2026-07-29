// Where the hero profile photo sits within the hero section, as a
// fraction of the section's box (0..1 on each axis). Home.jsx keeps this
// updated on mount/resize; the hero Beams instance reads it every frame
// so its circular formation can center itself behind the photo instead
// of at the raw canvas center — a shared mutable signal (same pattern as
// audioReactivity.js) so neither file needs to import the other's React
// tree.
export const heroFocus = { x: 0.5, y: 0.5 };
