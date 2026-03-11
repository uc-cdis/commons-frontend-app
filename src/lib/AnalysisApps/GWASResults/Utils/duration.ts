import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default (startedAt: Date, finishedAt: Date, placeHolder = '--') => {
    if (!finishedAt || !startedAt ) {
        return placeHolder;
    }

    const runTime = finishedAt.valueOf() - startedAt.valueOf();

    return runTime && runTime > 0 ? dayjs.duration(runTime).format('H:mm:ss') : placeHolder;
}
