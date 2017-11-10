import UnstagedChangesError from './UnstagedChangesError';
import DateInvalidError from './DateInvalidError';

export default (err) => {
  if (!err || !err.message) {
    throw new Error('Something went wrong');
  } else if (err.message === 'DATE_INVALID') {
    throw new DateInvalidError(err);
  } else if (err.message.toLowerCase().indexOf('unstaged changes') > -1) {
    throw new UnstagedChangesError(err);
  } else {
    throw err;
  }
};
