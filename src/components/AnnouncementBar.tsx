const messages = [
  "🚚 ENVÍOS A TODO EL PAÍS",
  "🏬 RETIRÁ EN 25 DE MAYO 466, SANTA ROSA (LA PAMPA)",
  "💳 3 Y 6 CUOTAS CON MERCADO PAGO",
  "✨ NUEVA TEMPORADA DISPONIBLE",
];

export default function AnnouncementBar() {
  const line = messages.join("     •     ");
  return (
    <div className="overflow-hidden bg-ink py-2 text-[11px] font-semibold uppercase tracking-widest text-white">
      <div className="flex w-max whitespace-nowrap">
        <span className="marquee px-4">{line}&nbsp;&nbsp;•&nbsp;&nbsp;{line}&nbsp;&nbsp;•&nbsp;&nbsp;</span>
        <span className="marquee px-4" aria-hidden>
          {line}&nbsp;&nbsp;•&nbsp;&nbsp;{line}&nbsp;&nbsp;•&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
}
