import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BedDouble,
  Wallet,
  Users,
  Star,
  CalendarCheck2,
  Clock,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const revenueData = [
  { m: "Jan", revenue: 42000, prev: 31000 },
  { m: "Feb", revenue: 51000, prev: 38000 },
  { m: "Mar", revenue: 48000, prev: 41000 },
  { m: "Apr", revenue: 61000, prev: 47000 },
  { m: "May", revenue: 72000, prev: 52000 },
  { m: "Jun", revenue: 84000, prev: 60000 },
  { m: "Jul", revenue: 91000, prev: 68000 },
  { m: "Aug", revenue: 88000, prev: 71000 },
  { m: "Sep", revenue: 96000, prev: 74000 },
];

const occupancyData = [
  { d: "Mon", v: 64 },
  { d: "Tue", v: 71 },
  { d: "Wed", v: 78 },
  { d: "Thu", v: 82 },
  { d: "Fri", v: 91 },
  { d: "Sat", v: 96 },
  { d: "Sun", v: 88 },
];

const bookings = [
  { id: "BK-2841", guest: "Eleanor Hartwell", room: "Presidential Suite", checkin: "Today, 3:00 PM", nights: 4, status: "Confirmed", amount: "$4,820" },
  { id: "BK-2840", guest: "Marcus Aubergine", room: "Garden Villa 02", checkin: "Today, 5:30 PM", nights: 2, status: "Pending", amount: "$1,640" },
  { id: "BK-2839", guest: "Sofia Lindqvist", room: "Ocean Loft 14", checkin: "Tomorrow, 2:00 PM", nights: 6, status: "Confirmed", amount: "$5,210" },
  { id: "BK-2838", guest: "Hiroshi Nakamura", room: "Heritage Suite", checkin: "May 16, 4:00 PM", nights: 3, status: "Confirmed", amount: "$3,180" },
  { id: "BK-2837", guest: "Ayana Okafor", room: "Rooftop Terrace", checkin: "May 17, 6:00 PM", nights: 1, status: "Cancelled", amount: "$880" },
];

const activity = [
  { t: "2m", text: "New reservation from ", strong: "Eleanor Hartwell", sub: "Presidential Suite · 4 nights" },
  { t: "18m", text: "Restaurant booking confirmed for ", strong: "Marcus Aubergine", sub: "Aurelia · 8:30 PM · party of 4" },
  { t: "1h", text: "Spa treatment scheduled by ", strong: "Sofia Lindqvist", sub: "Signature gold ritual · 90 min" },
  { t: "3h", text: "Event proposal sent to ", strong: "Aurora Capital", sub: "Private gala · 120 guests" },
  { t: "5h", text: "Review received from ", strong: "Hiroshi Nakamura", sub: "Heritage Suite · 5 stars" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Thursday · May 14, 2026
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">
            Welcome back, <span className="text-gradient-amber">Amelia</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's unfolding across the estate today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">Last 30 days</Button>
          <Button className="rounded-xl bg-gradient-amber border-0 text-primary-foreground shadow-glow hover:opacity-95">
            <Sparkles className="size-4" /> New booking
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value="$248,920"
          delta="+12.4%"
          deltaUp
          icon={Wallet}
          spark={[12, 18, 15, 22, 28, 24, 32, 38, 44]}
          accent
        />
        <KPICard
          label="Occupancy Rate"
          value="86.4%"
          delta="+4.8%"
          deltaUp
          icon={BedDouble}
          spark={[40, 48, 52, 49, 60, 68, 72, 80, 86]}
        />
        <KPICard
          label="New Reservations"
          value="1,284"
          delta="+8.2%"
          deltaUp
          icon={CalendarCheck2}
          spark={[20, 24, 22, 28, 30, 36, 32, 40, 44]}
        />
        <KPICard
          label="Avg. Guest Score"
          value="4.92"
          delta="-0.03"
          icon={Star}
          spark={[48, 50, 49, 52, 51, 50, 49, 48, 47]}
        />
      </div>

      {/* Revenue + Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue Analytics" sub="Compared to previous period">
            <div className="flex items-center gap-4 text-xs">
              <Legend color="var(--primary)" label="This year" />
              <Legend color="color-mix(in oklab, var(--bronze) 60%, transparent)" label="Last year" />
            </div>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bronze)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--bronze)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 6" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <RTooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="prev" stroke="var(--bronze)" strokeWidth={2} fill="url(#g2)" />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Occupancy" sub="This week" />
          <div className="flex items-center gap-6">
            <div className="relative size-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "occ", value: 86 }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "color-mix(in oklab, var(--primary) 12%, transparent)" }} dataKey="value" cornerRadius={20} fill="var(--primary)" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-display text-3xl">86%</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Booked</div>
              </div>
            </div>
            <div className="flex-1 space-y-3 text-sm">
              <Stat label="Suites" value="92%" color="var(--primary)" />
              <Stat label="Villas" value="84%" color="var(--gold)" />
              <Stat label="Lofts" value="78%" color="var(--bronze)" />
            </div>
          </div>
          <div className="h-28 mt-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Bar dataKey="v" radius={[8, 8, 8, 8]} fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bookings + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg">Recent Bookings</h3>
              <p className="text-sm text-muted-foreground">Latest reservations across the estate</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg">
              View all <ArrowUpRight className="size-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <Th>Reservation</Th>
                  <Th>Suite</Th>
                  <Th>Check-in</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-accent/40 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-coffee">
                          {b.guest.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="leading-tight">
                          <div className="font-medium">{b.guest}</div>
                          <div className="text-xs text-muted-foreground">{b.id}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="leading-tight">
                        <div>{b.room}</div>
                        <div className="text-xs text-muted-foreground">{b.nights} nights</div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-3.5" /> {b.checkin}
                      </div>
                    </Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-right font-medium">{b.amount}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Activity" sub="Across all venues">
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="size-4" />
            </button>
          </CardHeader>
          <ol className="relative space-y-5 pl-5 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {activity.map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[18px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-sm leading-snug">
                  <span className="text-muted-foreground">{a.text}</span>
                  <span className="font-medium">{a.strong}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.sub}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-1">{a.t} ago</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-2xl border border-border shadow-soft hover:shadow-lift transition-shadow p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        <h3 className="font-display text-lg">{title}</h3>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover shadow-lift p-3 text-xs">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          <span className="ml-auto font-medium">${(p.value / 1000).toFixed(1)}k</span>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: value }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-3 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Confirmed: "bg-primary/10 text-primary border-primary/20",
    Pending: "bg-gold/15 text-bronze border-gold/30",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Badge variant="outline" className={`rounded-full font-normal ${map[status] ?? ""}`}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {status}
    </Badge>
  );
}

function KPICard({
  label,
  value,
  delta,
  deltaUp,
  icon: Icon,
  spark,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  deltaUp?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  spark: number[];
  accent?: boolean;
}) {
  const data = spark.map((v, i) => ({ i, v }));
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border border-border p-5 shadow-soft hover:shadow-lift transition-shadow ${
        accent ? "bg-gradient-to-br from-primary/8 to-card" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-3xl mt-1.5">{value}</div>
        </div>
        <div className={`size-10 rounded-xl flex items-center justify-center ${accent ? "bg-gradient-amber text-primary-foreground shadow-glow" : "bg-muted text-foreground"}`}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${deltaUp ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {deltaUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta}
          <TrendingUp className="size-3 opacity-0" />
        </div>
        <div className="h-10 w-24 -mr-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`sp-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area dataKey="v" stroke="var(--primary)" strokeWidth={2} fill={`url(#sp-${label})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// silence unused imports for icons not in main list
void Users;
