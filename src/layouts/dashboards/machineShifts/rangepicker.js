/* eslint-disable react/prop-types */
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker, deDE, enUS, frFR } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import colors from 'assets/theme-dark/base/colors';
import { ThemeProvider } from '@mui/system';
import themeDark from 'assets/theme-dark';
import { useMaterialUIController } from 'context';
import { LOCALES } from 'i18n';

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})(({ theme, isSelected, isHovered, day, startDate, endDate, hoveredDay }) => ({
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
    ...((day.isSame(startDate, 'day') || (!startDate && day.isSame(hoveredDay, 'day'))) && {
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    }),
    ...((day.isSame(endDate, 'day') || (startDate && day.isSame(hoveredDay, 'day'))) && {
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    }),
}));

const isBetween = (dayA, startDate, endDate) => {
    if (dayA === null) {
        return false
    }

    return dayA.isSame(startDate, 'day') || dayA.isSame(endDate, 'day') || dayA.isBetween(startDate, endDate, null, '[]');
};

function Day(props) {
    const { day, selectedDay, hoveredDay, startDate, endDate, ...other } = props;
    return (
        <CustomPickersDay
            {...other}
            day={day}
            startDate={startDate}
            hoveredDay={hoveredDay}
            endDate={endDate}
            sx={{ px: 2.5 }}
            disableMargin
            selected={false}
            isSelected={isBetween(day, startDate, endDate)}
            isHovered={endDate ? false : isBetween(day, startDate, hoveredDay)}
        />
    );
}

export const calenderDarkTheme = {
    ...themeDark,
    palette: {
        ...themeDark.palette,
        background: {
            ...themeDark.palette.background,
            "paper": "#222324"
        },
        text: {
            "main": "#ffffff",
            "focus": "#ffffffcc",
            "primary": "rgba(255, 255, 255)",
            "secondary": "rgba(146, 146, 146, 0.6)",
            "disabled": "rgba(146, 146, 146, 0.38)"
        },
        "action": {
            ...themeDark.palette.action,
            "active": "rgba(255, 255, 255, 0.54)",

        }
    }
}

export default function RangePicker({ startDate, endDate, setStartDate, setEndDate }) {
    const [hoveredDay, setHoveredDay] = React.useState(null);
    const [value, setValue] = React.useState(null)

    const [controller] = useMaterialUIController();
    const {
        language
    } = controller;

    const locale = language === LOCALES.GERMAN ? deDE : language === LOCALES.FRENCH ? frFR : enUS

    return (
        <ThemeProvider theme={calenderDarkTheme}>
            <LocalizationProvider dateAdapter={AdapterMoment} localeText={locale.components.MuiLocalizationProvider.defaultProps.localeText}>
                <DatePicker
                    value={value}
                    closeOnSelect={false}
                    format={`${startDate ? moment(startDate).format("DD/MM/YYYY") : "DD/MM/YYYY"} - DD/MM/YYYY`}
                    onChange={(newValue) => {
                        if (endDate) {
                            setStartDate(newValue)
                            setValue(newValue)
                            setEndDate(null)
                        } else if (startDate) {
                            setEndDate(newValue)
                        } else if (startDate === null) {
                            setStartDate(newValue)
                            setValue(newValue)
                        } else {
                            setEndDate(newValue)
                        }

                    }}
                    showDaysOutsideCurrentMonth
                    minDate={startDate && !endDate ? startDate : null}
                    maxDate={moment()}
                    displayWeekNumber
                    slots={{ day: Day }}
                    sx={{
                        svg: { color: "#ffffff" },
                        width: "100%",
                        "& .Mui-selected": {
                            backgroundColor: `${colors.info.main} !important`
                        },
                        "& .MuiDateCalendar-root": {
                            backgroundColor: 'red !important'
                        }
                    }}
                    slotProps={{
                        day: (ownerState) => ({
                            startDate,
                            endDate,
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