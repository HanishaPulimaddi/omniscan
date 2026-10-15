import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="OmniScan home">
      <span className="brand-mark">
        <ScanLine size={19} strokeWidth={2.2} />
      </span>
      <span>OmniScan</span>
    </Link>
  );
}

export function Announcement() {
  return (
    <div className="announce">
      <strong>Work in progress.</strong> Currently deploying OmniScan on AWS to learn cloud infrastructure.
    </div>
  );
}
