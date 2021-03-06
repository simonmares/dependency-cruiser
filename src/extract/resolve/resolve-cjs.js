const path = require("path");
const pathToPosix = require("../utl/path-to-posix");
const determineDependencyTypes = require("./determine-dependency-types");
const isCore = require("./is-core");
const readPackageDeps = require("./read-package-deps");
const resolveHelpers = require("./resolve-helpers");
const resolve = require("./resolve");
const isFollowable = require("./is-followable");

function addResolutionAttributes(
  pBaseDir,
  pModuleName,
  pFileDir,
  pResolveOptions
) {
  let lRetval = {};

  if (isCore(pModuleName)) {
    lRetval.coreModule = true;
  } else {
    try {
      lRetval.resolved = pathToPosix(
        path.relative(pBaseDir, resolve(pModuleName, pFileDir, pResolveOptions))
      );
      lRetval.followable = isFollowable(lRetval.resolved, pResolveOptions);
    } catch (pError) {
      lRetval.couldNotResolve = true;
    }
  }
  return lRetval;
}

/*
 * resolves both CommonJS and ES6
 */
module.exports = (pModuleName, pBaseDir, pFileDir, pResolveOptions) => {
  let lRetval = {
    resolved: pModuleName,
    coreModule: false,
    followable: false,
    couldNotResolve: false,
    dependencyTypes: ["undetermined"],
    ...addResolutionAttributes(pBaseDir, pModuleName, pFileDir, pResolveOptions)
  };

  return {
    ...lRetval,
    ...resolveHelpers.addLicenseAttribute(
      pModuleName,
      pBaseDir,
      pResolveOptions
    ),
    dependencyTypes: determineDependencyTypes(
      lRetval,
      pModuleName,
      readPackageDeps(pFileDir, pBaseDir, pResolveOptions.combinedDependencies),
      pFileDir,
      pResolveOptions,
      pBaseDir
    )
  };
};
