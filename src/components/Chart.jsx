import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export const options = {
    // responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false, //showY
        },
    },
    scales: {
        x: {
            stacked: true,
            grid: {
                display: false,
                drawTicks: false,
            },
            ticks: {
                display: false,
            },
        },
        y: {
            stacked: true,
            grid: {
                display: true,
                drawBorder: false,
                drawTicks: false,
            },
            ticks: {
                display: true,
            },
        },
    },
}
export default function BarChart({ labels, label, value }) {
    const data = {
        labels: labels.map(l => l[label]),
        datasets: [
            {
                label: "Unidades vendidas",
                data: labels.map(l => l[value]),
                backgroundColor: '#4161cc',
            }
        ]
    }

    return <Bar options={options} data={data} className='w-100' style={{ maxHeight: 350 }} />;
}
