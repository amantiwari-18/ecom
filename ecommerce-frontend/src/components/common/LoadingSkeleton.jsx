import "./LoadingSkeleton.css";

export default function LoadingSkeleton() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton skeleton-banner"></div>
      <div className="skeleton skeleton-title"></div>

      <div className="skeleton-row">
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>

      <div className="skeleton-row">
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    </div>
  );
}
