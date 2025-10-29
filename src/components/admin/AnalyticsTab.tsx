/**
 * AnalyticsTab Component
 * Extracted analytics display from the original AdminDashboard
 */

import { useState, useEffect } from "react";
import { analytics, type KPIMetrics } from "../../utils/analytics";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function AnalyticsTab() {
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);

  useEffect(() => {
    updateMetrics();
    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const metrics = analytics.calculateKPIs();
    setKpis(metrics);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📊 داشبورد تحلیل</h3>
          <p className="text-sm text-gray-600">
            آمار و تحلیل عملکرد پلتفرم HOMA
          </p>
        </div>
        <Button onClick={updateMetrics} variant="outline" size="sm">
          🔄 به‌روزرسانی
        </Button>
      </div>

      {kpis && (
        <>
          {/* Upload Metrics */}
          <div>
            <h4 className="mb-4 text-gray-700">📤 آمار آپلود</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="شروع آپلود"
                value={kpis.uploadStarted}
                color="blue"
              />
              <MetricCard
                label="آپلود موفق"
                value={kpis.uploadCompleted}
                color="green"
              />
              <MetricCard
                label="آپلود ناموفق"
                value={kpis.uploadFailed}
                color="red"
              />
              <MetricCard
                label="نرخ موفقیت"
                value={`${(kpis.uploadRate * 100).toFixed(1)}%`}
                color="purple"
              />
            </div>
          </div>

          {/* Time Metrics */}
          <div>
            <h4 className="mb-4 text-gray-700">⏱️ آمار زمان</h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="میانگین زمان آپلود"
                value={`${(kpis.averageTTFU / 1000).toFixed(2)}s`}
                color="blue"
              />
              <MetricCard
                label="میانگین پردازش"
                value={`${(kpis.averageProcessingTime / 1000).toFixed(2)}s`}
                color="blue"
              />
            </div>
          </div>

          {/* Conversion Metrics */}
          <div>
            <h4 className="mb-4 text-gray-700">💰 آمار تبدیل</h4>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                label="مشاهده نتایج"
                value={kpis.visualizationViews}
                color="blue"
              />
              <MetricCard
                label="کلیک خرید"
                value={kpis.purchaseClicks}
                color="green"
              />
              <MetricCard
                label="نرخ تبدیل"
                value={`${(kpis.conversionRate * 100).toFixed(1)}%`}
                color="purple"
                highlight={kpis.conversionRate > 0.1}
              />
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h4 className="mb-4 text-gray-700">✅ آمار کیفیت</h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="نرخ قبولی precheck"
                value={`${(kpis.precheckPassRate * 100).toFixed(1)}%`}
                color="green"
              />
              <MetricCard
                label="نرخ موفقیت placement"
                value={`${(kpis.placementSuccessRate * 100).toFixed(1)}%`}
                color="green"
              />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div>
            <h4 className="mb-4 text-gray-700">🎯 آمار تعامل</h4>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                label="فیدبک ثبت شده"
                value={kpis.feedbackSubmitted}
                color="blue"
              />
              <MetricCard
                label="اشتراک‌گذاری"
                value={kpis.shareClicks}
                color="purple"
              />
              <MetricCard
                label="تلاش مجدد"
                value={kpis.retryAttempts}
                color="orange"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                analytics.logKPIReport();
                alert("گزارش در console نمایش داده شد");
              }}
              variant="outline"
              size="sm"
            >
              📋 نمایش در Console
            </Button>
            <Button
              onClick={() => {
                analytics.clearEvents();
                updateMetrics();
                alert("رویدادها پاک شدند");
              }}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              🗑️ پاک کردن داده‌ها
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color: "blue" | "green" | "red" | "purple" | "orange";
  highlight?: boolean;
}

function MetricCard({ label, value, color, highlight }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <Card
      className={`p-4 ${colorClasses[color]} border ${
        highlight ? "ring-2 ring-purple-500" : ""
      }`}
    >
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl">{value}</div>
    </Card>
  );
}

