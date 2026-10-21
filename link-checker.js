const linkCheck = require('link-check');

const pages = [
  'https://storage01.dbe.academy/232.02.webdev/test-023.login/index.php',
  'https://storage01.dbe.academy/232.02.webdev/test-023.login/contact.php'
];

function checkPage(page) {
  return new Promise((resolve) => {
    linkCheck(page, { timeout: '10s' }, (error, result) => {
      if (error) {
        console.error(`ERROR - ${page}: ${error.message}`);
        process.exitCode = 1;
        resolve();
        return;
      }

      console.log(
        `${result.status.toUpperCase()} - ${result.statusCode} - ${result.link}`
      );

      if (result.status !== 'alive') {
        process.exitCode = 1;
      }

      resolve();
    });
  });
}

async function run() {
  await Promise.all(pages.map(checkPage));
}

run();