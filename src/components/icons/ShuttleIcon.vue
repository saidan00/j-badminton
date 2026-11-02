<script setup>
import { SHUTTLE } from '@/lib/shuttle.js';
</script>

<template>
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path :d="SHUTTLE.feathers" style="fill: var(--feather, #fff)" />
      <path :d="SHUTTLE.spines" />
      <path :d="SHUTTLE.cork" fill="currentColor" />
    </g>
  </svg>
</template>
