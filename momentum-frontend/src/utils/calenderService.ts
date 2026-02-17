//each month has may have unique days
//each month has a 7 days
//each month can start from any day
//we only show days of that month
//we only have a back and forward button to view previous month
//we have a today button to see today
//we will have addtional info

const date = new Date();
const daysOfAWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// this function should calculate the year the user is viewing
// export const getFullYear = (delta: number) => {

// };

export const monthInNumber = (delta: number | null): number => {
  let month: number;

  //gives current month in number

  if (delta === 0) {
    month = date.getMonth();

    return month;
  }

  //gives upcomming month in number
  if (delta === 1) {
    month = date.getMonth() + delta;

    return month;
  }

  //give previous month in number
  if (delta === -1) {
    month = date.getMonth() + delta;
    return month;
  }

  return 0;
};

export const numberOfCells = (year: number) => {
  const month = monthInNumber(0);
  const numberOfDays = new Date(year, month + 1, 0).getDate();
  const startDay = daysOfAWeek[new Date(year, month + 1, 0).getDay()];
  const startDayNumber = new Date(year, month + 1, 0).getDay();

  return { startDay, startDayNumber, numberOfDays };
};

console.log(numberOfCells(2026));
