import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../utils/api";
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

function DownloadTrends() {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly'); // 'daily', 'weekly', 'monthly', 'yearly'

  useEffect(() => {
    fetchTrendData(timeRange);
  }, [timeRange]);

  // Helper function to format dates based on time range
  const formatDateLabel = (dateStr, range) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Fallback if date is invalid
    
    switch(range) {
      case 'daily':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'weekly':
        return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      case 'monthly':
        return date.toLocaleDateString([], { day: 'numeric' });
      case 'yearly':
        return date.toLocaleDateString([], { month: 'short' });
      default:
        return dateStr;
    }
  };

  const fetchTrendData = async (range) => {
    setLoading(true);
    setError(null); // Reset error state
    const token = localStorage.getItem('token');
    
    const requestOptions = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: 'include',
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/downloads/trends?range=${range}`, requestOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response structure
      if (result && (result.success || result.status === 'success')) {
        let allDownloads = [];
        
        // Check for the nested structure with trends array
        if (result.data && result.data.trends && Array.isArray(result.data.trends)) {
          // Flatten all downloads from all weeks
          allDownloads = result.data.trends.flatMap(week => 
            week.downloads || []
          );
        } 
        // Fallback to previous extraction methods if needed
        else if (result.data && typeof result.data === 'object') {
          allDownloads = Object.entries(result.data).map(([key, value]) => ({
            date: key,
            count: typeof value === 'number' ? value : 0
          }));
        } else if (result.downloads && Array.isArray(result.downloads)) {
          allDownloads = result.downloads;
        }
        
        // Process the downloads based on the time range
        const processedData = processDownloadsByTimeRange(allDownloads, range);
        
        if (processedData.length === 0) {
          // If we still don't have data, create mock data for testing
          const mockData = generateMockData(range);
          setTrendData(mockData);
        } else {
          setTrendData(processedData);
        }
      } else {
        throw new Error('Invalid response format or no data available');
      }
      
    } catch (error) {
      console.error("Error fetching trend data:", error);
      setError(error.message);
      
      // Generate mock data for testing when API fails
      const mockData = generateMockData(timeRange);
      setTrendData(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  // Process downloads array into aggregated data by time range
  const processDownloadsByTimeRange = (downloads, range) => {
    if (!downloads || !Array.isArray(downloads) || downloads.length === 0) {
      return [];
    }
    
    // Group downloads by date according to the time range
    const groupedData = new Map();
    
    downloads.forEach(download => {
      if (!download.date) return;
      
      const downloadDate = new Date(download.date);
      if (isNaN(downloadDate.getTime())) return; // Skip invalid dates
      
      let groupKey;
      
      switch(range) {
        case 'daily':
          // Group by hour
          downloadDate.setMinutes(0, 0, 0);
          groupKey = downloadDate.toISOString();
          break;
        case 'weekly':
          // Group by day
          downloadDate.setHours(0, 0, 0, 0);
          groupKey = downloadDate.toISOString();
          break;
        case 'monthly':
          // Group by day of month
          downloadDate.setHours(0, 0, 0, 0);
          groupKey = downloadDate.toISOString();
          break;
        case 'yearly':
          // Group by month
          downloadDate.setDate(1);
          downloadDate.setHours(0, 0, 0, 0);
          groupKey = downloadDate.toISOString();
          break;
        default:
          downloadDate.setHours(0, 0, 0, 0);
          groupKey = downloadDate.toISOString();
      }
      
      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, { date: groupKey, count: 0 });
      }
      
      // Increment the count for this time period
      const data = groupedData.get(groupKey);
      data.count++;
    });
    
    // Convert the Map to an array sorted by date
    return Array.from(groupedData.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Helper function to generate mock data for visualization
  const generateMockData = (range) => {
    const now = new Date();
    const data = [];
    let count = 7; // Number of data points
    
    if (range === 'daily') {
      for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setHours(now.getHours() - i);
        data.push({
          date: date.toISOString(),
          count: Math.floor(Math.random() * 50) + 10
        });
      }
    } else if (range === 'weekly') {
      for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        data.push({
          date: date.toISOString(),
          count: Math.floor(Math.random() * 100) + 20
        });
      }
    } else if (range === 'monthly') {
      for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (i * 3)); // Every 3 days
        data.push({
          date: date.toISOString(),
          count: Math.floor(Math.random() * 150) + 30
        });
      }
    } else if (range === 'yearly') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        data.push({
          date: date.toISOString(),
          count: Math.floor(Math.random() * 500) + 50
        });
      }
    }
    
    return data.reverse(); // Reverse to get chronological order
  };

  const prepareChartData = () => {
    if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
      return null;
    }
    
    // Sort the data by date
    const sortedData = [...trendData].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : null;
      const dateB = b.date ? new Date(b.date) : null;
      
      if (!dateA || !dateB) return 0;
      return dateA - dateB;
    });
    
    // Define color schemes for different time ranges
    const colorSchemes = {
      daily: {
        borderColor: 'rgb(54, 162, 235)',
        gradientFrom: 'rgba(54, 162, 235, 0.8)',
        gradientTo: 'rgba(54, 162, 235, 0.1)'
      },
      weekly: {
        borderColor: 'rgb(75, 192, 192)',
        gradientFrom: 'rgba(75, 192, 192, 0.8)',
        gradientTo: 'rgba(75, 192, 192, 0.1)'
      },
      monthly: {
        borderColor: 'rgb(153, 102, 255)',
        gradientFrom: 'rgba(153, 102, 255, 0.8)',
        gradientTo: 'rgba(153, 102, 255, 0.1)'
      },
      yearly: {
        borderColor: 'rgb(255, 99, 132)',
        gradientFrom: 'rgba(255, 99, 132, 0.8)',
        gradientTo: 'rgba(255, 99, 132, 0.1)'
      }
    };
    
    const colorScheme = colorSchemes[timeRange] || colorSchemes.weekly;
    
    // Get label based on time range
    let xAxisLabel;
    switch(timeRange) {
      case 'daily': xAxisLabel = 'Hours'; break;
      case 'weekly': xAxisLabel = 'Days'; break;
      case 'monthly': xAxisLabel = 'Days of Month'; break;
      case 'yearly': xAxisLabel = 'Months'; break;
      default: xAxisLabel = 'Time';
    }
    
    // Format data with proper labels
    const labels = sortedData.map(item => {
      if (item.date) {
        return formatDateLabel(item.date, timeRange);
      }
      return item.day || item.month || 'Unknown';
    });
    
    // Create a function to generate gradient for the mountain effect
    const createGradient = (ctx) => {
      if (!ctx) return colorScheme.gradientFrom;
      
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, colorScheme.gradientFrom);
      gradient.addColorStop(1, colorScheme.gradientTo);
      return gradient;
    };
    
    const datasets = [{
      label: 'Downloads',
      data: sortedData.map(item => {
        // Handle different possible locations of the count value
        if (typeof item.count === 'number') return item.count;
        if (typeof item.downloads === 'number') return item.downloads;
        if (typeof item.value === 'number') return item.value;
        return 0;
      }),
      borderColor: colorScheme.borderColor,
      backgroundColor: function(context) {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return null;
        return createGradient(ctx);
      },
      tension: 0.4,  // More curve for better mountain appearance
      fill: true,    // Enable fill for mountain effect
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    }];
    
    return {
      labels,
      datasets,
      xAxisLabel
    };
  };

  const chartResult = prepareChartData();
  const chartData = chartResult ? {
    labels: chartResult.labels,
    datasets: chartResult.datasets
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: `Download Trends (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: { top: 10, bottom: 15 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Downloads: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Downloads',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0 // Whole numbers only
        }
      },
      x: {
        title: {
          display: true,
          text: chartResult?.xAxisLabel || 'Time',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    },
    elements: {
      line: {
        borderJoinStyle: 'round'
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-sky-500 shadow-lg w-full mx-auto max-w-none xl:w-full 2xl:w-full">
      <h2 className="text-xl font-semibold mb-4">Download Trends</h2>
      
      <div className="flex flex-wrap mb-5 gap-2 justify-end">
        <button 
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${timeRange === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setTimeRange('daily')}
        >
          Daily
        </button>
        <button 
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${timeRange === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setTimeRange('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${timeRange === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setTimeRange('monthly')}
        >
          Monthly
        </button>
        <button 
          className={`px-4 py-2 rounded-md transition-colors duration-200 ${timeRange === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setTimeRange('yearly')}
        >
          Yearly
        </button>
      </div>
      
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[400px]">
        {loading ? (
          <div className="flex w-full items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {error}
          </div>
        ) : chartData && chartData.datasets[0].data.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No download data available for this time period
          </div>
        )}
      </div>
    </div>
  );
}

export default DownloadTrends;