// src/pages/CoinDetailsPage.jsx

import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { fetchCoinDetails } from "../services/fetchCoinDetails";
import { fetchChartData } from "../services/fetchChartData";
import currencyStore from '../state/store';
import parse from 'html-react-parser';
import PageLoader from "../components/PageLoader/PageLoader";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function CoinDetailsPage() {
    const { coinId } = useParams();
    const { currency } = currencyStore();

    const { isError, isLoading, data: coin } = useQuery(["coin", coinId], () => fetchCoinDetails(coinId), {
        cacheTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    });

    const { data: marketChartData } = useQuery(["coinMarketChart", coinId], () => fetchChartData(coinId, 7, 'usd'), {
        cacheTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    });

    if(isLoading) {
        return <PageLoader />
    }

    if(isError) {
        return <div>Error: Something went wrong</div>
    }

    const chartData = {
        labels: marketChartData?.map(data => data.date) || [],
        datasets: [
            {
                label: `Price ${currency}`,
                data: marketChartData?.map(data => data.price) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${coin?.name} Price History (Last 7 Days)`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: `Price ${currency}`
                }
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row">
            {/* Left side: Coin details */}
            <div className="md:w-1/3 w-full flex flex-col items-center mt-6 md:mt-0 border-r-2 border-gray-500">
                <img 
                    alt={coin?.name}
                    src={coin?.image?.large}
                    className="h-52 mb-5"
                />
                <h1 className="text-4xl font-bold mb-5">{coin?.name}</h1>
                <p className="w-full px-6 py-4 text-justify">
                    {parse(coin?.description?.en)}
                </p>
                <div className="w-full flex flex-col md:flex-row md:justify-around">
                    <div className="flex items-center mb-4 md:mb-0">
                        <h2 className="text-xl font-bold">Rank</h2>
                        <span className="ml-3 text-xl">{coin?.market_cap_rank}</span>
                    </div>
                    <div className="flex items-center mb-4 md:mb-0">
                        <h2 className="text-xl text-yellow-400 font-bold">Current Price</h2>
                        <span className="ml-3 text-xl">
                            {coin?.market_data.current_price[currency]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right side: Price chart */}
            <div className="md:w-2/3 w-full p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Price History (Last 7 Days)</h2>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    )
}

export default CoinDetailsPage;