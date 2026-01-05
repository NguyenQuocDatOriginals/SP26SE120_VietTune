import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Page not found
        </h2>
        <p className="text-white mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-liquid-glass-primary inline-block">
          Go to Home page
        </Link>
      </div>
    </div>
  );
}
