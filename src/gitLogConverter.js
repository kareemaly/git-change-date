/**
 * Gets a commit log string and return an object describing
 * the commit
 * @param commitStr
 * @return Object
 */
export const convertCommit = (commitStr) => {
  const lines = commitStr.split(/\r?\n/);
  const commit = {};
  let re;

  lines.forEach((line) => {
    if (!commit.hash) {
      re = line.match(/commit\s([a-zA-Z0-9]*)/i);

      if (re) {
        [, commit.hash] = re;
      }
    } else if (!commit.name) {
      re = line.match(/Author:[\s]*([^<]*)<(.*)>/i);

      if (re) {
        [, commit.name, commit.email] = re;
      }
    } else if (!commit.date) {
      re = line.match(/Date:[\s]*(.*)/i);

      if (re) {
        [, commit.date] = re;
      }
    } else if (!commit.subject) {
      re = line.match(/\s*(.*)/i);

      if (re && re[1]) {
        [, commit.subject] = re;
      }
    }
  });

  return {
    hash: commit.hash.trim(),
    name: commit.name.trim(),
    email: commit.email.trim(),
    date: commit.date.trim(),
    subject: commit.subject.trim(),
  };
};

/**
 * Gets a commits log string and return an array of objects
 * describing the commits
 * @param str
 * @return Array
 */
export default (str) => {
  let start = str.indexOf('commit ');
  let end;
  const commits = [];

  while (start > -1) {
    end = str.indexOf('commit ', start + 1);

    commits.push(str.slice(start, end));

    start = end;
  }

  return commits.map(convertCommit);
};
