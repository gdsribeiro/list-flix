<template>
  <!-- LF monogram: L upper-left, diagonal bridge up-right, F spanning full height on right -->
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- L: vertical + foot -->
    <path d="M3 3 v9 h5"/>
    <!-- diagonal bridge: L foot endpoint → F top -->
    <line x1="8" y1="12" x2="12" y2="3"/>
    <!-- F: vertical -->
    <line x1="12" y1="3" x2="12" y2="17"/>
    <!-- F: top bar -->
    <line x1="12" y1="3" x2="17" y2="3"/>
    <!-- F: middle bar -->
    <line x1="12" y1="9" x2="16" y2="9"/>
  </svg>
</template>
