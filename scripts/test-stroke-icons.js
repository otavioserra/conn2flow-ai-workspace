const fs = require('fs');
const path = require('path');

// Variation 1: Interlocking Flow Knot (pure stroke, 24x24)
// Two interlocking fluid loops representing connection and flow
const iconStrokeFlowKnot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Outer flowing diamond lobes -->
  <path d="M12 2.5 L19.5 10 C21.5 12 21.5 15 19 17.5 L17 19.5 C14.5 22 11.5 22 9.5 20 L2.5 13" />
  <!-- Inner intersecting flow curve -->
  <path d="M4.5 6.5 C2.5 8.5 2 11.5 4 14 L12 22" />
  <!-- Central connector loop (Conn2Flow) -->
  <path d="M8 8 C10 6 14 6 16 8 C18 10 18 14 16 16 C14 18 10 18 8 16" />
</svg>`;

// Variation 2: Precise 4-lobe Flow Knot mirroring Logomarca.svg in pure stroke
const iconStrokeLogomarca = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Top-left loop -->
  <path d="M8 12 C5 9 5 5.5 7.5 3.5 C10 1.5 13.5 2.5 15 5.5 L12 8.5" />
  <!-- Bottom-right loop -->
  <path d="M16 12 C19 15 19 18.5 16.5 20.5 C14 22.5 10.5 21.5 9 18.5 L12 15.5" />
  <!-- Connecting flow bridge -->
  <path d="M6 14 C3.5 14 2 16 2 18 C2 20.5 4.5 22 7 21 C9 20 10.5 17.5 12 15.5" />
  <path d="M18 10 C20.5 10 22 8 22 6 C22 3.5 19.5 2 17 3 C15 4 13.5 6.5 12 8.5" />
</svg>`;

// Variation 3: Clean Diamond Flow Ribbon (the official diamond silhouette with open flow lines)
const iconDiamondFlow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Flow Loop 1: Top-Left to Bottom-Right -->
  <path d="M12 3 C7.5 3 3 7.5 3 12 C3 14.5 4.5 16.5 7 16.5 C10 16.5 12 14 14 11 C15.5 8.5 17.5 7.5 20 7.5 C21.5 7.5 22 8.5 22 9.5" />
  <!-- Flow Loop 2: Bottom-Right to Top-Left -->
  <path d="M12 21 C16.5 21 21 16.5 21 12 C21 9.5 19.5 7.5 17 7.5 C14 7.5 12 10 10 13 C8.5 15.5 6.5 16.5 4 16.5 C2.5 16.5 2 15.5 2 14.5" />
  <!-- Central Flow nodes -->
  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
</svg>`;

console.log('Generated test icons');
