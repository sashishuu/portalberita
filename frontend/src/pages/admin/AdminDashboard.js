import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  const ChangeIcon = changeType === 'increase' ? TrendingUpIcon : TrendingDownIcon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-bold text-secondary-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${changeColor}`}>
              <ChangeIcon className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalArticles: 0,
      totalComments: 0,
      totalViews: 0,
    },
    charts: {
      visitorsData: [],
      articlesData: [],
      categoryData: [],
      recentActivities: [],
    },
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        stats: {
          totalUsers: 1247,
          totalArticles: 456,
          totalComments: 2389,
          totalViews: 87654,
        },
        charts: {
          visitorsData: [
            { name: 'Sen', visitors: 1200, articles: 8 },
            { name: 'Sel', visitors: 1900, articles: 12 },
            { name: 'Rab', visitors: 1600, articles: 15 },
            { name: 'Kam', visitors: 2100, articles: 18 },
            { name: 'Jum', visitors: 2400, articles: 22 },
            { name: 'Sab', visitors: 2800, articles: 14 },
            { name: 'Min', visitors: 2200, articles: 10 },
          ],
          articlesData: [
            { name: 'Jan', published: 65, draft: 28 },
            { name: 'Feb', published: 78, draft: 35 },
            { name: 'Mar', published: 82, draft: 42 },
            { name: 'Apr', published: 95, draft: 38 },
            { name: 'Mei', published: 88, draft: 45 },
            { name: 'Jun', published: 92, draft: 40 },
          ],
          categoryData: [
            { name: 'Politik', value: 35, color: '#3B82F6' },
            { name: 'Teknologi', value: 28, color: '#10B981' },
            { name: 'Ekonomi', value: 22, color: '#F59E0B' },
            { name: 'Olahraga', value: 18, color: '#EF4444' },
            { name: 'Hiburan', value: 15, color: '#8B5CF6' },
            { name: 'Lainnya', value: 12, color: '#6B7280' },
          ],
          recentActivities: [
            {
              id: 1,
              type: 'article',
              message: 'Artikel baru "Teknologi AI" dipublikasi',
              time: '2 menit yang lalu',
              user: 'John Doe',
            },
            {
              id: 2,
              type: 'comment',
              message: 'Komentar baru pada artikel "Ekonomi Digital"',
              time: '5 menit yang lalu',
              user: 'Jane Smith',
            },
            {
              id: 3,
              type: 'user',
              message: 'Pengguna baru mendaftar',
              time: '10 menit yang lalu',
              user: 'Ahmad Rizki',
            },
            {
              id: 4,
              type: 'article',
              message: 'Artikel "Politik Terkini" diperbarui',
              time: '15 menit yang lalu',
              user: 'Sarah Wilson',
            },
          ],
        },
      });
      setLoading(false);
    }, 1500);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat dashboard..." />
      </div>
    );
  }

  const { stats, charts } = dashboardData;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Portal Berita</title>
        <meta name="description" content="Dashboard admin untuk mengelola Portal Berita" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
              <p className="text-secondary-600 mt-1">
                Selamat datang di panel admin Portal Berita
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-secondary-500">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard
              icon={UsersIcon}
              title="Total Pengguna"
              value={stats.totalUsers.toLocaleString()}
              change="+12%"
              changeType="increase"
              color="blue"
            />
            <StatCard
              icon={DocumentTextIcon}
              title="Total Artikel"
              value={stats.totalArticles.toLocaleString()}
              change="+8%"
              changeType="increase"
              color="green"
            />
            <StatCard
              icon={ChatBubbleLeftIcon}
              title="Total Komentar"
              value={stats.totalComments.toLocaleString()}
              change="+15%"
              changeType="increase"
              color="purple"
            />
            <StatCard
              icon={EyeIcon}
              title="Total Views"
              value={stats.totalViews.toLocaleString()}
              change="+22%"
              changeType="increase"
              color="orange"
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visitors Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">
                Pengunjung & Artikel (7 Hari Terakhir)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="visitors"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    name="Pengunjung"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="articles"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Artikel Baru"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Articles Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">
                Artikel Published vs Draft
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.articlesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="published" fill="#10B981" name="Published" />
                  <Bar dataKey="draft" fill="#F59E0B" name="Draft" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Distribution */}
            <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">
                Distribusi Kategori
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={charts.categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {charts.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Activities */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">
                Aktivitas Terbaru
              </h3>
              <div className="space-y-4">
                {charts.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-secondary-50 rounded-lg transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'article' ? 'bg-blue-500' :
                      activity.type === 'comment' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-secondary-500">oleh {activity.user}</span>
                        <span className="text-xs text-secondary-400">•</span>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3 text-secondary-400" />
                          <span className="text-xs text-secondary-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                <DocumentTextIcon className="w-5 h-5" />
                <span className="font-medium">Buat Artikel</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <UsersIcon className="w-5 h-5" />
                <span className="font-medium">Kelola Pengguna</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="font-medium">Moderasi Komentar</span>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUpIcon className="w-5 h-5" />
                <span className="font-medium">Lihat Analitik</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminDashboard;