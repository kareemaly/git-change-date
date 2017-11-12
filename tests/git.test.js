import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';
import childProcess from 'child_process';
import { getCommits, changeDate, formatGitDate } from '../src/git';

const { describe, it } = global;

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // eslint-disable-line no-useless-escape
}

describe('git', () => {
  let sandbox;
  const hash = '9b236229039d00f454c8484f027435fe2bef751d';
  const name = 'Kareem Elbahrawy';
  const email = 'bitriddler@gmail.com';
  const date = 'Tue Nov 21 16:29:08 2017 +0100';
  const subject = 'Short (50 chars or less) summary of changes';
  const message = `
    ${subject}
    
    More detailed explanatory text, if necessary.  Wrap it to about 72
    characters or so.  In some contexts, the first line is treated as the
    subject of an email and the rest of the text as the body.  The blank
    line separating the summary from the body is critical (unless you omit
    the body entirely); tools like rebase can get confused if you run the
    two together.
`;
  const commitLog = `
      commit ${hash} (HEAD -> master)
      Author: ${name} <${email}>
      Date:   ${date}

      ${message}
  `;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCommits', () => {
    it('should get an array of commits', () => {
      const expectedCommand = `cd somepath && git log -n2 --pretty`;
      const execStub = sandbox.stub(childProcess, 'exec');

      const promise = getCommits('somepath', { count: 2 });

      expect(execStub.calledOnce).to.be.true;
      expect(execStub.calledWith(expectedCommand)).to.be.true;

      execStub.callArg(1, null, `${commitLog}\n\n${commitLog}`);

      return promise
        .then((commits) => {
          expect(commits).to.be.an('array');
          expect(commits.length).equal(2);
          commits.forEach((commit) => {
            expect(commit.hash).equal(hash);
            expect(commit.name).equal(name);
            expect(commit.email).equal(email);
            expect(commit.date).equal(date);
            expect(commit.subject).equal(subject);
          });
        });
    });
  });

  describe('changeDate', () => {
    it('should execute command with correct arguments passed', () => {
      const authorDate = moment();
      const committerDate = moment().add(1, 'seconds');
      const execStub = sandbox.stub(childProcess, 'exec');

      changeDate('somepath', '1234', authorDate, committerDate);
      // formatGitDate(committerDate)
      expect(execStub.calledOnce).to.be.true;
      expect(execStub.firstCall.args[0])
        .to.match(new RegExp(escapeRegExp(`GIT_AUTHOR_DATE="${formatGitDate(authorDate)}"`)));
      expect(execStub.firstCall.args[0])
        .to.match(new RegExp(escapeRegExp(`GIT_COMMITTER_DATE="${formatGitDate(committerDate)}"`)));
      expect(execStub.firstCall.args[0])
        .to.match(new RegExp(escapeRegExp(`GIT_COMMIT = 1234`)));
    });

    it('should change call throwError if error happens', () => {
      const authorDate = moment();
      const committerDate = moment().add(1, 'seconds');
      const execStub = sandbox.stub(childProcess, 'exec');

      const promise = changeDate('1234', authorDate, committerDate);

      execStub.callArg(1, new Error("something"));

      return promise
        .then(() => {
          throw new Error("don't catch");
        })
        .catch((err) => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).equal("something");
        });
    });
  });
});
