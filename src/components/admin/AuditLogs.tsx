import { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, User as UserIcon, Shield, FileText, X } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { authService } from '../../utils/auth';
import { Pagination, usePagination } from '../ui/pagination';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  changes?: any;
  metadata?: any;
  timestamp: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const token = await authService.getAccessToken();

      if (!token) {
        console.log('No authentication token available');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else if (response.status === 401 || response.status === 403) {
        console.log('Authentication required or insufficient permissions for audit logs');
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (log.entityId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (log.action?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesAction = !filterAction || log.action === filterAction;
    const matchesEntityType = !filterEntityType || log.entityType === filterEntityType;

    return matchesSearch && matchesAction && matchesEntityType;
  });

  // Pagination
  const {
    paginatedItems: paginatedLogs,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    totalItems
  } = usePagination(filteredLogs, 10);

  const uniqueActions = Array.from(new Set(logs.map(log => log.action).filter(Boolean)));
  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entityType).filter(Boolean)));

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      ASSIGN: 'bg-purple-100 text-purple-800',
      GRANT: 'bg-emerald-100 text-emerald-800',
      REVOKE: 'bg-orange-100 text-orange-800',
      ACTIVATE: 'bg-green-100 text-green-800',
      DEACTIVATE: 'bg-gray-100 text-gray-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'ROLE':
        return <Shield className="w-4 h-4" />;
      case 'PERMISSION':
        return <Shield className="w-4 h-4" />;
      case 'USER':
        return <UserIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.userRole,
      log.action,
      log.entityType,
      log.entityId
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40] mb-2">Audit Logs</h2>
        <p className="text-xs sm:text-sm text-gray-600">Complete audit trail of all system changes and user actions</p>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
        >
          <option value="">All Actions</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>

        <select
          value={filterEntityType}
          onChange={(e) => setFilterEntityType(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023F40]"
        >
          <option value="">All Entity Types</option>
          {uniqueEntityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button
          onClick={exportToCSV}
          className="w-full px-3 sm:px-4 py-2 text-sm border border-[#023F40] text-[#023F40] rounded-lg hover:bg-[#023F40] hover:text-white flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Export</span>
        </button>

        {(searchQuery || filterAction || filterEntityType) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterAction('');
              setFilterEntityType('');
            }}
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          {searchQuery || filterAction || filterEntityType ? 'No logs found matching your filters' : 'No audit logs available'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        {getEntityIcon(log.entityType)}
                        <span className="text-xs sm:text-sm">{log.entityType}</span>
                      </div>
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 mb-2">
                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="font-medium">{log.userName}</span>
                      <span className="text-gray-400">•</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{log.userRole}</span>
                    </div>

                    {log.metadata && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.changes && (
                      <details className="mt-2">
                        <summary className="text-xs sm:text-sm text-[#023F40] cursor-pointer hover:underline">
                          View changes
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>

                  <code className="text-xs text-gray-400 ml-2 sm:ml-4 hidden sm:block">
                    {log.entityId?.split(':')[1] || log.entityId || 'N/A'}
                  </code>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}