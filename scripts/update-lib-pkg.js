const fs = require('fs');
const path = require('path');

const rootPkg = require('../package.json');
const distPkgPath = path.resolve(__dirname, '../dist/ngx-dockview/package.json');
const distPkg     = require(distPkgPath);

['version','license','description','repository','author','keywords']
  .forEach(k => {
    if (rootPkg[k]) distPkg[k] = rootPkg[k];
  });

fs.writeFileSync(distPkgPath,
  JSON.stringify(distPkg, null, 2) + '\n'
);

fs.copyFileSync(path.resolve(__dirname, '../README.md'), path.resolve(__dirname, '../dist/ngx-dockview/README.md'));
fs.copyFileSync(path.resolve(__dirname, '../LICENSE'), path.resolve(__dirname, '../dist/ngx-dockview/LICENSE'));
