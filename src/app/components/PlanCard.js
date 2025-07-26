import { calculateUsagePercentage } from '@/app/utils/apiKeyUtils';

export default function PlanCard({ totalUsage, usageLimit = 1000 }) {
  const usagePercentage = calculateUsagePercentage(totalUsage, usageLimit);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-2">CURRENT PLAN</p>
              <h2 className="text-2xl lg:text-3xl font-bold">Researcher</h2>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-medium backdrop-blur-sm transition-colors">
              Manage Plan
            </button>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm">API Limit</span>
              <span className="text-white text-sm font-medium">{totalUsage}/{usageLimit} Requests</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
      </div>
    </div>
  );
} 