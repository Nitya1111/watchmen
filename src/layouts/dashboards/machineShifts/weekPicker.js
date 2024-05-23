import * as React from 'react';
import dayjs from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { ThemeProvider } from '@mui/system';
import { calenderDarkTheme } from './rangepicker';

dayjs.extend(isBetweenPlugin);

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})(({ theme, isSelected, isHovered, day }) => ({
    borderRadius: 0,
    ...(isSelected && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.main,
        },
    }),
    ...(isHovered && {
        backgroundColor: theme.palette.primary[theme.palette.mode],
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary[theme.palette.mode],
        },
    }),
    ...(day.day() === 1 && {
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    }),
    ...(day.day() === 0 && {
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    }),
}));

const isInSameWeek = (dayA, dayB) => {
    if (dayB == null) {
        return false;
    }

    return dayA.isSame(dayB, 'week');
};

function Day(props) {
    const { day, selectedDay, hoveredDay, ...other } = props;

    return (
        <CustomPickersDay
            {...other}
            day={day}
            sx={{ px: 2.5 }}
            disableMargin
            selected={false}
            isSelected={isInSameWeek(day, selectedDay)}
            isHovered={isInSameWeek(day, hoveredDay)}
        />
    );
}

export default function WeekPicker({ value, setValue }) {
    const [hoveredDay, setHoveredDay] = React.useState(null);

    return (
        <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                    value={value}
                    disableFuture
                    format={`YYYY  [Week] ${moment(value).week()}`}
                    onChange={(newValue) => setValue(newValue)}
                    showDaysOutsideCurrentMonth
                    displayWeekNumber
                    slots={{ day: Day }}
                    sx={{
                        svg: { color: "#ffffff" }
                    }}
                    slotProps={{
                        day: (ownerState) => ({
                            selectedDay: value,
                            hoveredDay,
                            onPointerEnter: () => setHoveredDay(ownerState.day),
                            onPointerLeave: () => setHoveredDay(null),
                        }),
                    }}
                />
            </LocalizationProvider>
        </ThemeProvider>
    );
}