export function getSessionFilterForDateString(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }

    // Start of the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // End of the given date
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dateField = 
    {
        $gte: startOfDay,
            $lte: endOfDay
    }
    return dateField;
}
