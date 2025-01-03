export default function MagicButton({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.66671 12.6667L5.00004 9L1.33337 7.33333L5.00004 5.66667L6.66671 2L8.33337 5.66667L12 7.33333L8.33337 9L6.66671 12.6667ZM12 14L11.1667 12.1667L9.33337 11.3333L11.1667 10.5L12 8.66667L12.8334 10.5L14.6667 11.3333L12.8334 12.1667L12 14Z"
        fill="#757575"
      />
    </svg>
  );
}
