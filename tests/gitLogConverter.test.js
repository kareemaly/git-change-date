import { expect } from 'chai';
import { convertCommit } from '../src/gitLogConverter';
import gitLogConverter from '../src/gitLogConverter';

const { describe, it } = global;

describe('gitLogConverter', () => {
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

  describe('convertCommit', () => {
    it('should return an object describing the commit', async () => {
      const commit = await convertCommit(`
commit ${hash} (HEAD -> master)
Author: ${name} <${email}>
Date:   ${date}

        ${message}
      `);

      expect(commit.hash).equal(hash);
      expect(commit.name).equal(name);
      expect(commit.email).equal(email);
      expect(commit.date).equal(date);
      expect(commit.subject).equal(subject);
    });
  });

  describe("default", () => {
    it("should return an array of objects describing the commits log", async () => {
      const commits = await gitLogConverter(`
commit ${hash} (HEAD -> master)
Author: ${name} <${email}>
Date:   ${date}

        ${message}

commit ${hash}
Author: ${name} <${email}>
Date:   ${date}

        ${message}

commit ${hash}
Author: ${name} <${email}>
Date:   ${date}

        ${message}

      `);

      expect(commits).to.be.an('array');
      expect(commits.length).equal(3);

      const commitObj = {
        hash, name, email, date, subject,
      };

      expect(commits[0]).to.deep.equal(commitObj);
      expect(commits[1]).to.deep.equal(commitObj);
      expect(commits[2]).to.deep.equal(commitObj);
    });
  });
});
