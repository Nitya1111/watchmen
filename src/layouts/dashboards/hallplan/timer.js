import MDTypography from 'components/MDTypography';
import React, { useState, useEffect } from 'react';

function Timer() {
    const [currentTime, setCurrentTime] = useState(new Date());

    const tick = () => {
        setCurrentTime(new Date());
    };

    useEffect(() => {
        const timerID = setInterval(() => tick(), 1000);

        return () => {
            clearInterval(timerID);
        };
    }, []);

    return (
        <MDTypography variant="h2" fontWeight="medium" textTransform="capitalize">
            {currentTime.toLocaleTimeString()}
        </MDTypography>
    );
}

export default Timer;
