export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
