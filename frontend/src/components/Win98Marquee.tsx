interface Win98MarqueeProps {
  text: string;
}

export function Win98Marquee({ text }: Win98MarqueeProps) {
  return (
    <div className="win98-marquee-wrap" aria-live="polite">
      <div className="win98-marquee-track">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
