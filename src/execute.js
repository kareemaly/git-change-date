import childProcess from 'child_process';

export default command => new Promise((resolve, reject) => {
  childProcess.exec(command, (err, out) => {
    if (err) {
      return reject(err);
    }

    return resolve(out);
  });
});
