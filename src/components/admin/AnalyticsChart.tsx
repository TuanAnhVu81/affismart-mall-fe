"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";

export interface AnalyticsChartDatum {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AnalyticsChartProps {
  data: AnalyticsChartDatum[];
  type: "bar" | "line";
  valueLabel?: string;
  secondaryValueLabel?: string;
  className?: string;
  emptyTitle?: string;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Value",
  secondaryValueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string }>;
  label?: string;
  valueLabel?: string;
  secondaryValueLabel?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const primaryValue = payload.find((item) => item.dataKey === "value")?.value ?? 0;
  const secondaryValue = payload.find((item) => item.dataKey === "secondaryValue")?.value;

  return (
    <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-soft">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">
        {valueLabel}:{" "}
        <span className="font-semibold text-foreground">
          {valueLabel.toLowerCase().includes("revenue") ||
          valueLabel.toLowerCase().includes("gmv")
            ? formatCurrency(primaryValue)
            : numberFormatter.format(primaryValue)}
        </span>
      </p>
      {secondaryValue !== undefined && secondaryValueLabel ? (
        <p className="text-muted-foreground">
          {secondaryValueLabel}:{" "}
          <span className="font-semibold text-foreground">
            {numberFormatter.format(secondaryValue)}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function AnalyticsChart({
  data,
  type,
  valueLabel = "Value",
  secondaryValueLabel,
  className,
  emptyTitle = "No analytics data yet",
}: AnalyticsChartProps) {
  if (!data.length) {
    return (
      <div
        className={cn(
          "flex h-72 items-center justify-center rounded-[24px] border border-dashed border-border/80 bg-muted/10 px-6 text-center",
          className,
        )}
      >
        <div>
          <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Analytics will become more useful once orders and affiliate activity start flowing in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              interval={0}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => numberFormatter.format(Number(value))}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "rgba(79,70,229,0.06)" }}
              content={
                <ChartTooltip
                  valueLabel={valueLabel}
                  secondaryValueLabel={secondaryValueLabel}
                />
              }
            />
            <Bar dataKey="value" fill="#4f46e5" radius={[12, 12, 4, 4]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => numberFormatter.format(Number(value))}
              width={52}
            />
            <Tooltip
              content={
                <ChartTooltip
                  valueLabel={valueLabel}
                  secondaryValueLabel={secondaryValueLabel}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#4f46e5" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
