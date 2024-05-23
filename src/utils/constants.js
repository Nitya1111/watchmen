/* eslint-disable import/prefer-default-export */
export const machineState = {
  STOPPED: 0,
  IDLE: 1,
  PRODUCTION: 2,
  PREPARATION: 3,
  UNKNOWN: 4
};

export const timelineReasonLevel = [
  { label: "Level 1", value: 1 },
  { label: "Level 2", value: 2 },
  { label: "Level 3", value: 3 },
  { label: "Level 4", value: 4 },
  { label: "Level 5", value: 5 }
];

export const notificationColors = {
  1:"primary",
  2:"success",
  3:"warning",
  4:"error",
  5:"secondary",
  6:"info",
}

export const convertHMS = (value) => {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
  // add 0 if value < 10
  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`; // Return is HH : MM : SS
};

export const getUpdatedKeysObject = (obj1, obj2) => {
  const keys = Object.keys(obj1);
  const updatedKeys = {};
  keys.forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      updatedKeys[key] = obj1[key];
    }
  });
  return updatedKeys;
};
