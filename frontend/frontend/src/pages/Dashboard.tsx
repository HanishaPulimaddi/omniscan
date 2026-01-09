
import { Activity, Image, BadgeCheck } from "lucide-react";

export default function Dashboard() {
  const cards = [
    {
      title: "Total Scans",
      value: "128",
      icon: <Image size={28} color="#4a90e2" />,
    },
    {
      title: "AI Accuracy",
      value: "98.4%",
      icon: <BadgeCheck size={28} color="#33cc99" />,
    },
    {
      title: "Active Models",
      value: "4 Models",
      icon: <Activity size={28} color="#ff9500" />,
    },
  ];

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: "25px" }}>
        Welcome to OmniScan AI
      </h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: "white",
              padding: "20px",
              width: "260px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {card.icon}
            <h4 style={{ margin: 0, fontWeight: "600" }}>{card.title}</h4>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
