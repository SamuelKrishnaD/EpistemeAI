export function StatCard({ title, value, icon, trend, description }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        {/* Emoji / icon text */}
        <span className="text-3xl">{icon}</span>

        {/* Trend (optional) */}
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>

      {/* Value & Title */}
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>

      {/* Description (optional) */}
      {description && (
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      )}
    </div>
  );
}
