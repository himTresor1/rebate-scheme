import { Skeleton } from './skeleton';

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-9 w-20 mb-2" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

// Dashboard Stats Grid Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Full Table Skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 5,
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

// Form Field Skeleton
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton className="h-7 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Quick Action Button Skeleton
export function QuickActionSkeleton() {
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <Skeleton className="h-6 w-6 rounded mb-2" />
      <Skeleton className="h-5 w-32 mb-1" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

// Quick Actions Grid Skeleton
export function QuickActionsGridSkeleton({ actions = 4 }: { actions?: number }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: actions }).map((_, i) => (
          <QuickActionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Tab Navigation Skeleton
export function TabNavigationSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="flex gap-4 border-b border-gray-200">
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32 mb-[-2px]" />
      ))}
    </div>
  );
}

// Header Skeleton
export function HeaderSkeleton() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge Skeleton
export function BadgeSkeleton() {
  return <Skeleton className="h-6 w-20 rounded-full" />;
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };
  
  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

// Chart Skeleton
export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className={`w-full ${height} rounded`} />
    </div>
  );
}

// Application Card Skeleton
export function ApplicationCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <BadgeSkeleton />
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Full Page Loading Skeleton
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSkeleton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStatsSkeleton />
        <QuickActionsGridSkeleton />
      </div>
    </div>
  );
}

// User Profile Card Skeleton
export function UserProfileCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <AvatarSkeleton size="lg" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

// Settings Panel Skeleton
export function SettingsPanelSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="p-6 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
