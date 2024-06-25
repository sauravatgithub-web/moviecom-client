import React from 'react'
import {Line, Doughnut} from "react-chartjs-2"
import {
    ArcElement, 
    Chart as ChartJS, 
    CategoryScale, 
    Filler, 
    Legend, 
    LinearScale, 
    LineElement, 
    PointElement, 
    Tooltip
} from 'chart.js'
import { purple, purpleLight } from '../constants/color';
import { getLast7Days } from '../../lib/features';

ChartJS.register(
    ArcElement, 
    CategoryScale, 
    Filler, 
    Legend, 
    LinearScale, 
    LineElement, 
    PointElement, 
    Tooltip
);

const lineChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        }
    },
    scales: {
        x: {
            grid: {
                display: false,
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: false,
            }
        }
    }
}

const doughnutChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        }
    },
    cutout: 120,
}

const LineChart = ({value = []}) => {
    const data = {
        labels: getLast7Days(),
        datasets: [
            {
                data: value,
                label: "Revenue",
                fill: true,
                backgroundColor: purpleLight,
                borderColor: purple,
            },
        ]
    }

    return (
        <Line data = {data} options = {lineChartOptions}/>
    )
}
const DoughnutChart = ({value = [], labels = []}) => {
    const data = {
        labels: labels,
        datasets: [
            {
                data: value,
                label: "Total Chats vs Group Chats",
                backgroundColor: [purpleLight, "orange"],
                hoverBackgroundColor: ["pink", "red"],
                borderColor: [purple, "orange"],
                offset: 20,
            },
        ]
    }
    return (
        <Doughnut style = {{ zIndex: 10 }} data = {data} options = {doughnutChartOptions}/>
    )
}


export { LineChart, DoughnutChart }
