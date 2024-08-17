import axiosInstance from "../helpers/axiosInstance";

export async function fetchChartData(coinId, days = 7, currency = 'usd') {
    try {
        const response = await axiosInstance.get(`/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: currency,
                days: days,
                interval: 'daily'
            }
        });

        // Convert Unix timestamp to Asia/Kolkata timezone and price to INR
        const formattedData = response.data.prices.map(([timestamp, price]) => {
            const date = new Date(timestamp);
            const indianTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);

            // Assuming 1 USD = 75 INR (you should use a real-time exchange rate)
            const priceInINR = price * 80;

            return {
                date: indianTime,
                price: priceInINR
            };
        });

        return formattedData;
    } catch(error) {
        console.error(error);
        return null;
    }
}