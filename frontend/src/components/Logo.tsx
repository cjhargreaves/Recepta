export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Teal cross piece */}
      <path
        d="M60 40 C45 40 35 50 35 65 L35 95 C35 110 45 120 60 120 L90 120 C105 120 115 130 115 145 L115 175 C115 190 125 200 140 200 L170 200 C185 200 195 190 195 175 L195 145 C195 130 185 120 170 120 L140 120 C125 120 115 110 115 95 L115 65 C115 50 105 40 90 40 Z"
        fill="#5DADA6"
        opacity="0.9"
      />
      {/* Dark teal cross piece */}
      <path
        d="M140 0 C125 0 115 10 115 25 L115 55 C115 70 105 80 90 80 L60 80 C45 80 35 90 35 105 L35 135 C35 150 45 160 60 160 L90 160 C105 160 115 170 115 185 L115 175 C115 170 115 165 115 160 L115 105 C115 90 125 80 140 80 L170 80 C185 80 195 70 195 55 L195 25 C195 10 185 0 170 0 Z"
        fill="#1C5E68"
        opacity="0.95"
      />
    </svg>
  );
}
