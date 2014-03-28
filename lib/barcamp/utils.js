'use strict';

function DumpObject(obj) {
  var od = {},
    result = "",
    len = 0,
    property,
    value,
    ood;

  for (property in obj) {
    if (obj.hasOwnProperty(property)) {
      value = obj[property];
      if (typeof value === 'string') {
        value = "'" + value + "'";
      } else if (typeof value === 'object') {
        if (value instanceof Array) {
          value = "[ " + value + " ]";
        } else {
          ood = new DumpObject(value);
          value = "{ " + ood.dump + " }";
        }
      }
      result += "'" + property + "' : " + value + ", ";
      len = len + 1;
    }
  }
  od.dump = result.replace(/, $/, "");
  od.len = len;

  return od;
}

function getMethods(obj) {
  var methods = [],
    m;
  for (m in obj) {
    if (obj.hasOwnProperty(m)) {
      if (typeof obj[m] === "function" && obj.hasOwnProperty(m)) {
        methods.push(m);
      }
    }
  }
  return methods;
}

function getClientIp(req) {
  var ipAddress,
    forwardedIpsStr,
    forwardedIps;
  // workaround to get real client IP when behind proxy
  forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
}

function developmentEnvironment() {
  if (process.env.NODE_ENV === 'development') { return true; }
  return false;
}

function stagingEnvironment() {
  if (process.env.NODE_ENV === 'staging') { return true; }
  return false;
}

function productionEnvironment() {
  if (process.env.NODE_ENV === 'production') { return true; }
  return false;
}

function myCensor(censor) { // TODO: not tested
  var func = function () {
    var i = 0;

    return function () {
      if (i !== 0 && typeof censor === 'object' && typeof this === 'object' && censor === this) {
        return '[Circular]';
      }

      if (i >= 29) {// seems to be a harded maximum of 30 serialized objects?
        return '[Unknown]';
      }
      i = i + 1; // so we know we aren't using the original object anymore

      return this;
    };
  };
  return func(censor);
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports.DumpObject = DumpObject;
module.exports.getClientIp = getClientIp;
module.exports.getMethods = getMethods;
module.exports.developmentEnvironment = developmentEnvironment;
module.exports.stagingEnvironment = stagingEnvironment;
module.exports.productionEnvironment = productionEnvironment;
module.exports.myCensor = myCensor;
module.exports.isNumber = isNumber;
