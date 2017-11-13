import minimist from 'minimist';
import colors from 'colors/safe';
import prompt from 'prompt';
import Table from 'cli-table';
import { getCommits, changeDate } from './git';

const argv = minimist(process.argv.slice(2));

const welcome = () => {
  console.log(`
          / /\\            /\\ \\    
         / /  \\          /  \\ \\   
        / / /\\ \\        / /\\ \\ \\  
       / / /\\ \\ \\      / / /\\ \\_\\ 
      / / /\\ \\_\\ \\    / / /_/ / / 
     / / /\\ \\ \\___\\  / / /__\\/ /  
    / / /  \\ \\ \\__/ / / /_____/   
   / / /____\\_\\ \\  / / /\\ \\ \\     
  / / /__________\\/ / /  \\ \\ \\    
  \\/_____________/\\/_/    \\_\\/    

If you don't see formatted output, try to increase width of the terminal to have more space.
`);
};

const ask = question => new Promise((resolve, reject) => {
  console.log('');
  prompt.get([].concat(question), (err, output) => {
    if (err) {
      return reject(err);
    }
    console.log('');
    return resolve(output);
  });
});

const logCommits = (commits) => {
  const table = new Table({
    head: ['No.', 'Author', 'Subject', 'Date'],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' ',
    },
  });

  table.push(...commits.map((commit, index) => ([
    index + 1,
    `${commit.name}`,
    commit.subject.slice(0, 50),
    commit.date,
  ])));

  console.log(table.toString());
};

const logError = (err) => {
  if (argv.dev) {
    const table = new Table();
    table.push([err.stack]);
    console.log(table.toString());
  } else {
    console.log(colors.red(err.message));
  }
};

const anotherOne = () => ask({
  name: 'another',
  description: 'Choose another commit from the same list (yes/no)?',
  default: 'no',
}).then(({ another }) => another.toLowerCase() === 'y' || another.toLowerCase() === 'yes');

const start = (filter) => {
  let commits;
  let commit;

  const dirPath = argv.path || process.cwd();

  return getCommits(dirPath, filter)
    .then((_commits) => {
      commits = _commits;
      return logCommits(commits);
    })
    .then(() => ask([
      {
        name: 'number',
        description: 'Enter commit number to edit (1, 2, ..etc)',
        pattern: /[0-9]+/,
        required: true,
      },
      {
        name: 'date',
        description: 'Enter the new date',
        required: true,
      },
    ]))
    .then(({ number, date }) => {
      if (number > commits.length) {
        throw new Error(`Number must be between 1 and ${commits.length}`);
      }
      commit = commits[number - 1];
      return changeDate(dirPath, commit.hash, date, date);
    })
    .then(() => {
      console.log(colors.green(`Date changed successfully for commit [${commit.subject}]`));
    })
    .then(anotherOne)
    .then(yes => yes && start(filter))
    .catch((err) => {
      logError(err);

      return anotherOne()
        .then(yes => yes && start(filter));
    });
};

welcome();

start({
  count: argv.count || 5,
  hash: argv.hash,
})
  .catch((err) => {
    logError(err);
    return process.exit(0);
  });
