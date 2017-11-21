
git-change-date
=====

Simple command line to change old commits author and committer dates.

![Sample Usage](./sample-usage.gif)

## Installation

```
npm install -g git-change-date
```

## CLI Usage
Please ensure that you are on the correct directory of the repository you want
to modify and that there are no unstaged changes before running this.

Usage: `git-change-date [options]`

Options:
```
--path      repository path, defaults to current directory
--count     Number of commits to show, defaults to 5
--hash      Search commits with this hash (optional)
--dev       Show complete error stack (optional)
```

When you run this command you will be prompted to:
- Enter commit number in the list
- Enter the new date **the entered date must be in a format moment can parse**
https://momentjs.com/docs/#/parsing/string/

After making modifications you will have to force push to remote repositories
and anyone who has pulled these commits or any future commits will have to reset
and pull.

## License

MIT @ [Kareem Elbahrawy](http://www.bitriddler.com)
