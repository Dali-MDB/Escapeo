import { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';

const generateVisitData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
        day: (i + 1).toString(),
        visits: Math.floor(Math.random() * 800 + 20),
    }));
};

const MyBarChart = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Fetching data...');
        setTimeout(() => {
            const newData = generateVisitData();
            setData(newData);
            setIsLoading(false);
            console.log('Data loaded:', newData);
        }, 1500);
    }, []);

    return (
        <div style={{ height: '400px', width: '100%',position:'relative' }}>
            {isLoading ? (
                <p className='absolute top-1/2 left-1/2 w-fit text-center'>Loading chart...</p>
            ) : (
                <ResponsiveBar
                    data={data}
                    keys={['visits']}
                    indexBy="day"
                    margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
                    padding={0.7}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={'#4B6382'}
                    borderRadius={4}
                    borderColor={{ from: 'color', modifiers: [['darker', '3']] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Day of the Month',
                        legendPosition: 'middle',
                        legendOffset: 36,
                    }}
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Number of Visits',
                        legendPosition: 'middle',
                        legendOffset: -50,
                    }}
                    enableLabel={false}
                    legends={[]}
                    role="application"
                    ariaLabel="Bar chart showing visits per day"
                    barAriaLabel={(e) => `Day ${e.indexValue}: ${e.formattedValue} visits`}
                />
            )}
        </div>
    );
};

export default MyBarChart;
