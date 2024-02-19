import moment from 'moment';
import throwError from './errors/throwError';
import gitLogConverter from './gitLogConverter';
import execute from './execute';

moment.suppressDeprecationWarnings = true;

export const getCommits = async (path, { count, hash }) => {
  let commitLog;

  if (hash) {
    commitLog = await execute(`cd "${path}" && git log -1 -U ${hash} --pretty`);
  } else {
    commitLog = await execute(`cd "${path}" && git log -n${count} --pretty`);
  }
  return gitLogConverter(commitLog);
};

export const formatGitDate = (date) => {
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    throwError(new Error("DATE_INVALID"));
  }
  return momentDate.format('ddd MMM DD HH:mm:ss YYYY ZZ');
};

export const changeDate = async (path, hash, authorDate, committerDate) => {
  try {
    const authorDateFormatted = formatGitDate(authorDate);
    const committerDateFormatted = formatGitDate(committerDate);

    return await execute(`cd ${path} && git filter-branch -f --env-filter \
    'if [ $GIT_COMMIT = ${hash} ]
     then
         export GIT_AUTHOR_DATE="${authorDateFormatted}"
         export GIT_COMMITTER_DATE="${committerDateFormatted}"
     fi'`);
  } catch (err) {
    return throwError(err);
  }
};
