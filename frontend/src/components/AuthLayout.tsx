import type { ReactNode } from "react";
import { HeartPulse, Stethoscope, Bone } from "lucide-react";
import Brand, { Announcement } from "./Brand";

// Split screen: form on the left, a warm gradient panel previewing the
// structured report the app produces on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Announcement />
      <div className="auth">
        <div className="auth-form-side">
          <div>
            <Brand to="/login" />
          </div>
          <div className="auth-form-wrap">{children}</div>
        </div>

        <aside className="gradient-panel auth-visual" aria-hidden="true">
          <div className="pill-row">
            <span className="pill"><Stethoscope size={16} /> Radiologist</span>
            <span className="pill"><HeartPulse size={16} /> Pulmonologist</span>
            <span className="pill"><Bone size={16} /> Emergency medicine</span>
          </div>

          <div className="float-card">
            <div className="card-label">Report</div>
            <div className="template-title">Chest X-ray, PA view</div>
            <div className="template-lines">
              <div><b>Indication</b> [Reason for imaging]</div>
              <div><b>Findings</b> [Lungs, mediastinum, bones]</div>
              <div><b>AI scores</b> [18 pathologies screened]</div>
              <div><b>Impression</b> [One to two line summary]</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <span className="tag tag-high">Effusion 71%</span>
              <span className="tag tag-mid">Atelectasis 52%</span>
              <span className="tag tag-low">Nodule 18%</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
