const _clone = require("lodash/clone");
const _get = require("lodash/get");
const _reject = require("lodash/reject");
const _uniqBy = require("lodash/uniqBy");
const compareRules = require("./compare-rules");

function mergeDependency(pLeftDependency, pRightDependency) {
  return {
    ...pLeftDependency,
    ...pRightDependency,
    dependencyTypes: _uniqBy(
      pLeftDependency.dependencyTypes.concat(pRightDependency.dependencyTypes)
    ),
    rules: pLeftDependency.rules
      .concat(_get(pRightDependency, "rules", []))
      .sort(compareRules),
    valid: pLeftDependency.valid && pRightDependency.valid
  };
}

function mergeDependencies(pResolvedName, pDependencies) {
  return pDependencies
    .filter(pDependency => pDependency.resolved === pResolvedName)
    .reduce(
      (pAllDependencies, pCurrentDependency) =>
        mergeDependency(pAllDependencies, pCurrentDependency),
      {
        dependencyTypes: [],
        rules: [],
        valid: true
      }
    );
}

function consolidateDependencies(pDependencies) {
  let lDependencies = _clone(pDependencies);
  let lRetval = [];

  while (lDependencies.length > 0) {
    lRetval.push(mergeDependencies(lDependencies[0].resolved, lDependencies));
    lDependencies = _reject(lDependencies, {
      resolved: lDependencies[0].resolved
    });
  }

  return lRetval;
}

module.exports = pModule => ({
  ...pModule,
  dependencies: consolidateDependencies(pModule.dependencies)
});
