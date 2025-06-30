export function Card({ className = "", children }) {
    return <div className={`rounded-2xl shadow-sm bg-white ${className}`}>{children}</div>;
  }
  
  export function CardContent({ className = "", children }) {
    return <div className={`p-4 ${className}`}>{children}</div>;
  }
  