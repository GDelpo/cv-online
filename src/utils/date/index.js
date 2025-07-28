export const parseYearFromPeriod = (period) => {
    return parseInt(period.split(' - ')[0]);
  };
  
  export const sortByDateDesc = (a, b) => {
    const yearA = parseYearFromPeriod(a.period);
    const yearB = parseYearFromPeriod(b.period);
    return yearB - yearA;
  };
