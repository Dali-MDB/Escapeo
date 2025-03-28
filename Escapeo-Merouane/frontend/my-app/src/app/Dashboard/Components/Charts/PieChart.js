import { useState, useEffect } from 'react';
import { ResponsivePie } from '@nivo/pie';

const generateDeviceData = () => {
    return [
        { id: 'Desktop', label: 'Desktop', color:"#235784", value: Math.floor(Math.random() * 5000) + 1000 },
        { id: 'Mobile', label: 'Mobile',   color:"#6577F3", value: Math.floor(Math.random() * 5000) + 1000 },
        { id: 'Tablet', label: 'Tablet',   color:"#ED881F", value: Math.floor(Math.random() * 5000) + 1000 },
        { id: 'Others', label: 'Others',   color:"#8FD0EF", value: Math.floor(Math.random() * 5000) + 1000 },
    
    ];
};

const MyPieChart = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Fetching visit data...');
        setTimeout(() => {
            const newData = generateDeviceData();
            setData(newData);
            setIsLoading(false);
            console.log('Data loaded:', newData);
        }, 1500);
    }, []);

    return (
        <div style={{ height: '350px', width: '100%' }}>
            {isLoading ? (
                <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading chart...</p>
            ) : (
                <ResponsivePie
                    data={data}
                    margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
                    sortByValue={true}
                    innerRadius={0.7}
                    padAngle={1}
                    activeInnerRadiusOffset={15}
                    activeOuterRadiusOffset={15}
                    colors={({id , data})=> data.color}
                    borderColor="black"
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#232323"
                    arcLinkLabelsThickness={1}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsTextColor="black"
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            translateY: 50,
                            itemsSpacing: 10,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: { itemTextColor: '#232323' , itemHeight:'15' }
                                }
                            ]
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default MyPieChart;
