import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Target, AlertCircle } from 'lucide-react';
import { useLatestCEOReport, useMissions, useKPIs, useNetWorth } from '../hooks/useApi';

const CommandCenter: React.FC = () => {
  const { data: latestReport, isLoading: reportLoading } = useLatestCEOReport();
  const { data: missions } = useMissions();
  const { data: kpis } = useKPIs();
  const { data: netWorth } = useNetWorth();

  const activeMissions = missions?.filter((m: any) => m.status === 'ACTIVE') || [];
  const completedMissions = missions?.filter((m: any) => m.status === 'COMPLETED') || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Sample data for charts
  const missionVelocityData = [
    { week: 'Week 1', completed: 2, active: 4 },
    { week: 'Week 2', completed: 3, active: 5 },
    { week: 'Week 3', completed: 5, active: 3 },
    { week: 'Week 4', completed: 4, active: 6 },
  ];

  const netWorthData = [
    { month: 'Jan', value: 50000 },
    { month: 'Feb', value: 55000 },
    { month: 'Mar', value: 65000 },
    { month: 'Apr', value: 72000 },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-slate-400">Build the life you intend</p>
      </motion.div>

      {/* Top KPIs */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {/* Life Capacity Score */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 text-sm font-medium">Life Capacity</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white">{latestReport?.lifeCapacityScore || 0}</p>
          <p className="text-xs text-slate-400 mt-2">/ 100</p>
        </div>

        {/* Freedom Score */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 text-sm font-medium">Freedom Score</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{latestReport?.freedomScore || 0}</p>
          <p className="text-xs text-slate-400 mt-2">/ 100</p>
        </div>

        {/* Active Missions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 text-sm font-medium">Active Missions</h3>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{activeMissions.length}</p>
          <p className="text-xs text-slate-400 mt-2">{completedMissions.length} completed</p>
        </div>

        {/* Net Worth */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 text-sm font-medium">Net Worth</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">${(netWorth?.totalNetWorth / 1000).toFixed(0)}K</p>
          <p className="text-xs text-emerald-400 mt-2">+5.2% this month</p>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Mission Velocity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Mission Velocity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={missionVelocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="active" fill="#3b82f6" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Net Worth Growth */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Net Worth Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* CEO Report & Risks */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Weekly CEO Report */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly CEO Report</h2>
          {reportLoading ? (
            <p className="text-slate-400">Loading report...</p>
          ) : latestReport ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-emerald-400 mb-2">Wins</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  {latestReport.wins?.map((win: string, i: number) => (
                    <li key={i}>✓ {win}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-2">Top Recommendations</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  {latestReport.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* Active Risks */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 border-red-900/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-white">Risks</h2>
          </div>
          {latestReport?.risks ? (
            <ul className="text-sm text-slate-300 space-y-2">
              {latestReport.risks.map((risk: string, i: number) => (
                <li key={i} className="text-red-400/80">
                  ⚠ {risk}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No risks identified</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommandCenter;
