<script>
  export let size = '48';
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
  <!-- Cerchio di sfondo -->
  <circle cx="12" cy="12" r="12" fill="#FFF8E1"/>
  <!-- Cerchio interno del sole -->
  <circle cx="12" cy="12" r="5" fill="#FFC107"/>
 
  <g fill="#FFC107" stroke="none">
    <!-- Sopra -->
    <polygon points="12,2 11,6 13,6"/>
    <!-- Sotto -->
    <polygon points="12,22 11,18 13,18"/>
    <!-- Sinistra -->
    <polygon points="2,12 6,11 6,13"/>
    <!-- Destra -->
    <polygon points="22,12 18,11 18,13"/>
  </g>
</svg>