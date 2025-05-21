// chartUtils.js

// Inventory Bar Chart (e.g., Issued, Returned, Damaged, Lost)
export function getInventoryBarChartOptions(trackingSummary = {}) {
  const labels = Object.keys(trackingSummary);
  const values = labels.map((key) => trackingSummary[key] || 0);

  const statusColors = {
    Issued: '#2d3e83',
    Returned: '#4CAF50',
    Damaged: '#FF9800',
    Lost: '#F44336',
  };

  return {
    grid: {
      left: '8%',
      right: '8%',
      top: 40,
      bottom: 50,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: {
        fontSize: 12,
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        fontSize: 12,
        rotate: labels.length > 3 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Count',
        type: 'bar',
        barMaxWidth: 40,
        data: values,
        itemStyle: {
          color: function (params) {
            const label = labels[params.dataIndex];
            return statusColors[label] || '#5470C6';
          },
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
        },
      },
    ],
  };
}

// Expense Donut Pie Chart (e.g., category-wise expense)
export function getExpensePieChartOptions(expenseSummary = {}) {
  const labels = Object.keys(expenseSummary);
  const data = labels.map((key) => ({
    name: key,
    value: expenseSummary[key] || 0,
  }));

  const pieColors = [
    '#2d3e83', '#4CAF50', '#FF9800', '#F44336',
    '#9C27B0', '#009688', '#3F51B5', '#FFC107',
    '#795548', '#607D8B',
  ];

  return {
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: 12,
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
      },
      data: labels,
    },
    series: [
      {
        name: 'Expenses',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          fontSize: 12,
        },
        labelLine: {
          show: true,
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: pieColors[index % pieColors.length],
          },
        })),
      },
    ],
  };
}
