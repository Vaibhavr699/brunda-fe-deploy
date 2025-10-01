const LoadingSpinner = ({
  size = 64,
  text = "Loading...",
  overlay = true,
  className = "",
}) => {
  const stroke = Math.max(2, Math.floor(size / 16));

  return (
    <div
      className={`${
        overlay ? "fixed inset-0 bg-white z-50" : ""
      } flex flex-col items-center justify-center ${className}`}
      role="status"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin"
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#27368F" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#E6E7F2"
          strokeWidth={stroke}
        />

        <path
          d="M25 5 A20 20 0 0 1 45 25"
          stroke="url(#spinner-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {text && (
        <p className="mt-4 text-lg font-medium text-[#27368F] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
