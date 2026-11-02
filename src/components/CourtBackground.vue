<template>
  <svg class="court" viewBox="-40 -40 1420 690" aria-hidden="true">
    <g fill="none" stroke="rgba(255,255,255,.15)" stroke-width="5">
      <rect x="0" y="0" width="1340" height="610" fill="rgba(255,255,255,.025)" />
      <path d="M0 46H1340 M0 564H1340 M76 0V610 M1264 0V610 M472 0V610 M868 0V610 M0 305H472 M868 305H1340" />
    </g>
    <line x1="670" y1="-28" x2="670" y2="638" stroke="rgba(255,255,255,.3)" stroke-width="6" stroke-dasharray="3 8" />
    <circle cx="670" cy="-28" r="9" fill="rgba(255,255,255,.3)" />
    <circle cx="670" cy="638" r="9" fill="rgba(255,255,255,.3)" />
  </svg>
</template>

<style scoped>
.court {
  position: fixed;
  left: 50%;
  top: 50%;
  width: min(1500px, 140vw);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

@media (max-width: 899px) {
  .court {
    width: min(150vh, 230vw);
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
</style>
