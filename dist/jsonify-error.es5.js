(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.jsonifyError = require('./index.js');

},{"./index.js":2}],2:[function(require,module,exports){
"use strict";

var jsonifyError = require("./lib/jsonify-error");
var overrideConsole = require("./lib/override-console");
var overrideErrorMethods = require("./lib/override-error-methods");
var log = require("./lib/log");
var toString = require("./lib/to-string");

module.exports = jsonifyError;
module.exports.overrideConsole = overrideConsole;
module.exports.overrideErrorMethods = overrideErrorMethods;
module.exports.log = log;
module.exports.asString = toString;

},{"./lib/jsonify-error":6,"./lib/log":3,"./lib/override-console":7,"./lib/override-error-methods":8,"./lib/to-string":9}],3:[function(require,module,exports){
"use strict";

var mapArg = require("./../map-arg");

module.exports = function log(error) {
    // In browsers, we do not colorize the error with chalk.
    console.error(mapArg(error));
};

},{"./../map-arg":4}],4:[function(require,module,exports){
"use strict";

var jsonifyError = require("./../jsonify-error");

module.exports = function mapArg(arg) {
    // In browsers, we convert the error to JSON but not to string, since the browser's
    // console is interactive and allows inspecting the plain object easily.
    return arg instanceof Error ? jsonifyError(arg) : arg;
};

},{"./../jsonify-error":6}],5:[function(require,module,exports){
"use strict";

module.exports = function getSuperclasses(obj) {
    var superclasses = [];
    var temp = Object.getPrototypeOf(obj);
    if (temp !== null) temp = Object.getPrototypeOf(temp);
    while (temp !== null) {
        superclasses.push(temp.constructor.name);
        temp = Object.getPrototypeOf(temp);
    }
    return superclasses;
};

},{}],6:[function(require,module,exports){
"use strict";

var getSuperclasses = require("./get-superclasses");

module.exports = function jsonifyError(error) {
    if (!(error instanceof Error)) return error;
    var wrappedError = {};
    wrappedError.name = error.name || "<no name available>";
    wrappedError.className = error.constructor.name || "<no class name available>";
    wrappedError.message = error.message || "<no message available>";
    wrappedError.superclasses = getSuperclasses(error);
    wrappedError.enumerableFields = {};
    for (var x in error) {
        if (typeof error[x] === "function") continue;
        wrappedError.enumerableFields[x] = error[x];
    }
    if (typeof error.stack === "string" && error.stack.length > 0) {
        wrappedError.stack = error.stack.split('\n').map(function (x) {
            return x.replace(/^\s+/, "");
        }).filter(function (x) {
            return x;
        });
    } else {
        wrappedError.stack = error.stack || "<no stack trace available>";
    }
    return wrappedError;
};

},{"./get-superclasses":5}],7:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var mapArg = require("./map-arg");

var methodNames = ["log", "debug", "info", "warn", "error"];

var alreadyOverridden = false;

module.exports = function overrideConsole() {
    if (alreadyOverridden) return;
    alreadyOverridden = true;

    var originalMethods = {};

    var _loop = function _loop(methodName) {
        if (!console[methodName]) return "continue";
        originalMethods[methodName] = console[methodName].bind(console);
        console[methodName] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            originalMethods[methodName].apply(originalMethods, _toConsumableArray(args.map(mapArg)));
        };
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = methodNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var methodName = _step.value;

            var _ret = _loop(methodName);

            if (_ret === "continue") continue;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

},{"./map-arg":4}],8:[function(require,module,exports){
"use strict";

var jsonifyError = require("./jsonify-error");
var toString = require("./to-string");

module.exports = function () {

    /**
     * Converts this Error instance to a JSON representation.
     * 
     * @return {object}
     */
    Error.prototype.toJSON = function () {
        return jsonifyError(this);
    };

    /**
     * Converts this Error instance to the full stringification
     * of its JSON representation.
     * 
     * @param {number} [amountOfSpaces=4] The amount of spaces to use
     * for indentation in the output string.
     * 
     * @return {string}
     */
    Error.prototype.toString = function () {
        var amountOfSpaces = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

        return toString(this, amountOfSpaces);
    };
};

},{"./jsonify-error":6,"./to-string":9}],9:[function(require,module,exports){
"use strict";

var jsonifyError = require("./jsonify-error");

/**
 * Converts the given error to a big string representation, containing
 * the whole data from its JSON representation.
 * 
 * @param {error} error The error to be converted.
 * @param {number} [amountOfSpaces=4] The amount of spaces to use
 * for indentation in the output string.
 * 
 * @return {string}
 * @throws {TypeError} If the given error is not an instance of Error
 */
module.exports = function toString(error) {
  var amountOfSpaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;

  if (!(error instanceof Error)) throw new TypeError("jsonifyError.toString() error: First argument must be instance of Error.");
  var asJSON = jsonifyError(error);
  return asJSON.className + ": " + asJSON.message + " " + JSON.stringify(asJSON, null, amountOfSpaces);
};

},{"./jsonify-error":6}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyLWVudHJ5cG9pbnQuanMiLCJpbmRleC5qcyIsImxpYi9icm93c2VyLXNwZWNpZmljL2xvZy5qcyIsImxpYi9icm93c2VyLXNwZWNpZmljL21hcC1hcmcuanMiLCJsaWIvZ2V0LXN1cGVyY2xhc3Nlcy5qcyIsImxpYi9qc29uaWZ5LWVycm9yLmpzIiwibGliL292ZXJyaWRlLWNvbnNvbGUuanMiLCJsaWIvb3ZlcnJpZGUtZXJyb3ItbWV0aG9kcy5qcyIsImxpYi90by1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFDQSxPQUFPLFlBQVAsR0FBc0IsUUFBUSxZQUFSLENBQXRCOzs7QUNEQTs7QUFFQSxJQUFNLGVBQWUsUUFBUSxxQkFBUixDQUFyQjtBQUNBLElBQU0sa0JBQWtCLFFBQVEsd0JBQVIsQ0FBeEI7QUFDQSxJQUFNLHVCQUF1QixRQUFRLDhCQUFSLENBQTdCO0FBQ0EsSUFBTSxNQUFNLFFBQVEsV0FBUixDQUFaO0FBQ0EsSUFBTSxXQUFXLFFBQVEsaUJBQVIsQ0FBakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFlBQWpCO0FBQ0EsT0FBTyxPQUFQLENBQWUsZUFBZixHQUFpQyxlQUFqQztBQUNBLE9BQU8sT0FBUCxDQUFlLG9CQUFmLEdBQXNDLG9CQUF0QztBQUNBLE9BQU8sT0FBUCxDQUFlLEdBQWYsR0FBcUIsR0FBckI7QUFDQSxPQUFPLE9BQVAsQ0FBZSxRQUFmLEdBQTBCLFFBQTFCOzs7QUNaQTs7QUFFQSxJQUFNLFNBQVMsUUFBUSxjQUFSLENBQWY7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFhLEtBQWIsRUFBb0I7QUFDakM7QUFDQSxZQUFRLEtBQVIsQ0FBYyxPQUFPLEtBQVAsQ0FBZDtBQUNILENBSEQ7OztBQ0pBOztBQUVBLElBQU0sZUFBZSxRQUFRLG9CQUFSLENBQXJCOztBQUVBLE9BQU8sT0FB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b250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcbndpbmRvdy5qc29uaWZ5RXJyb3IgPSByZXF1aXJlKCcuL2luZGV4LmpzJyk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGpzb25pZnlFcnJvciA9IHJlcXVpcmUoXCIuL2xpYi9qc29uaWZ5LWVycm9yXCIpO1xuY29uc3Qgb3ZlcnJpZGVDb25zb2xlID0gcmVxdWlyZShcIi4vbGliL292ZXJyaWRlLWNvbnNvbGVcIik7XG5jb25zdCBvdmVycmlkZUVycm9yTWV0aG9kcyA9IHJlcXVpcmUoXCIuL2xpYi9vdmVycmlkZS1lcnJvci1tZXRob2RzXCIpO1xuY29uc3QgbG9nID0gcmVxdWlyZShcIi4vbGliL2xvZ1wiKTtcbmNvbnN0IHRvU3RyaW5nID0gcmVxdWlyZShcIi4vbGliL3RvLXN0cmluZ1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBqc29uaWZ5RXJyb3I7XG5tb2R1bGUuZXhwb3J0cy5vdmVycmlkZUNvbnNvbGUgPSBvdmVycmlkZUNvbnNvbGU7XG5tb2R1bGUuZXhwb3J0cy5vdmVycmlkZUVycm9yTWV0aG9kcyA9IG92ZXJyaWRlRXJyb3JNZXRob2RzO1xubW9kdWxlLmV4cG9ydHMubG9nID0gbG9nO1xubW9kdWxlLmV4cG9ydHMuYXNTdHJpbmcgPSB0b1N0cmluZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgbWFwQXJnID0gcmVxdWlyZShcIi4vLi4vbWFwLWFyZ1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsb2coZXJyb3IpIHtcbiAgICAvLyBJbiBicm93c2Vycywgd2UgZG8gbm90IGNvbG9yaXplIHRoZSBlcnJvciB3aXRoIGNoYWxrLlxuICAgIGNvbnNvbGUuZXJyb3IobWFwQXJnKGVycm9yKSk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBqc29uaWZ5RXJyb3IgPSByZXF1aXJlKFwiLi8uLi9qc29uaWZ5LWVycm9yXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1hcEFyZyhhcmcpIHtcbiAgICAvLyBJbiBicm93c2Vycywgd2UgY29udmVydCB0aGUgZXJyb3IgdG8gSlNPTiBidXQgbm90IHRvIHN0cmluZywgc2luY2UgdGhlIGJyb3dzZXInc1xuICAgIC8vIGNvbnNvbGUgaXMgaW50ZXJhY3RpdmUgYW5kIGFsbG93cyBpbnNwZWN0aW5nIHRoZSBwbGFpbiBvYmplY3QgZWFzaWx5LlxuICAgIHJldHVybiBhcmcgaW5zdGFuY2VvZiBFcnJvciA/IGpzb25pZnlFcnJvcihhcmcpIDogYXJnO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRTdXBlcmNsYXNzZXMob2JqKSB7XG4gICAgY29uc3Qgc3VwZXJjbGFzc2VzID0gW107XG4gICAgbGV0IHRlbXAgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcbiAgICBpZiAodGVtcCAhPT0gbnVsbCkgdGVtcCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0ZW1wKTtcbiAgICB3aGlsZSAodGVtcCAhPT0gbnVsbCkge1xuICAgICAgICBzdXBlcmNsYXNzZXMucHVzaCh0ZW1wLmNvbnN0cnVjdG9yLm5hbWUpO1xuICAgICAgICB0ZW1wID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRlbXApO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXJjbGFzc2VzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgZ2V0U3VwZXJjbGFzc2VzID0gcmVxdWlyZShcIi4vZ2V0LXN1cGVyY2xhc3Nlc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBqc29uaWZ5RXJyb3IoZXJyb3IpIHtcbiAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkgcmV0dXJuIGVycm9yO1xuICAgIGNvbnN0IHdyYXBwZWRFcnJvciA9IHt9O1xuICAgIHdyYXBwZWRFcnJvci5uYW1lID0gZXJyb3IubmFtZSB8fCBcIjxubyBuYW1lIGF2YWlsYWJsZT5cIjtcbiAgICB3cmFwcGVkRXJyb3IuY2xhc3NOYW1lID0gZXJyb3IuY29uc3RydWN0b3IubmFtZSB8fCBcIjxubyBjbGFzcyBuYW1lIGF2YWlsYWJsZT5cIjtcbiAgICB3cmFwcGVkRXJyb3IubWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgXCI8bm8gbWVzc2FnZSBhdmFpbGFibGU+XCI7XG4gICAgd3JhcHBlZEVycm9yLnN1cGVyY2xhc3NlcyA9IGdldFN1cGVyY2xhc3NlcyhlcnJvcik7XG4gICAgd3JhcHBlZEVycm9yLmVudW1lcmFibGVGaWVsZHMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHggaW4gZXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnJvclt4XSA9PT0gXCJmdW5jdGlvblwiKSBjb250aW51ZTtcbiAgICAgICAgd3JhcHBlZEVycm9yLmVudW1lcmFibGVGaWVsZHNbeF0gPSBlcnJvclt4XTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlcnJvci5zdGFjayA9PT0gXCJzdHJpbmdcIiAmJiBlcnJvci5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIHdyYXBwZWRFcnJvci5zdGFjayA9IGVycm9yLnN0YWNrLnNwbGl0KCdcXG4nKS5tYXAoeCA9PiB4LnJlcGxhY2UoL15cXHMrLywgXCJcIikpLmZpbHRlcih4ID0+IHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdyYXBwZWRFcnJvci5zdGFjayA9IGVycm9yLnN0YWNrIHx8IFwiPG5vIHN0YWNrIHRyYWNlIGF2YWlsYWJsZT5cIjtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXBwZWRFcnJvcjtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IG1hcEFyZyA9IHJlcXVpcmUoXCIuL21hcC1hcmdcIik7XG5cbmNvbnN0IG1ldGhvZE5hbWVzID0gW1wibG9nXCIsIFwiZGVidWdcIiwgXCJpbmZvXCIsIFwid2FyblwiLCBcImVycm9yXCJdO1xuXG5sZXQgYWxyZWFkeU92ZXJyaWRkZW4gPSBmYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvdmVycmlkZUNvbnNvbGUoKSB7XG4gICAgaWYgKGFscmVhZHlPdmVycmlkZGVuKSByZXR1cm47XG4gICAgYWxyZWFkeU92ZXJyaWRkZW4gPSB0cnVlO1xuXG4gICAgY29uc3Qgb3JpZ2luYWxNZXRob2RzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IG1ldGhvZE5hbWUgb2YgbWV0aG9kTmFtZXMpIHtcbiAgICAgICAgaWYgKCFjb25zb2xlW21ldGhvZE5hbWVdKSBjb250aW51ZTtcbiAgICAgICAgb3JpZ2luYWxNZXRob2RzW21ldGhvZE5hbWVdID0gY29uc29sZVttZXRob2ROYW1lXS5iaW5kKGNvbnNvbGUpO1xuICAgICAgICBjb25zb2xlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgb3JpZ2luYWxNZXRob2RzW21ldGhvZE5hbWVdKC4uLmFyZ3MubWFwKG1hcEFyZykpO1xuICAgICAgICB9O1xuICAgIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGpzb25pZnlFcnJvciA9IHJlcXVpcmUoXCIuL2pzb25pZnktZXJyb3JcIik7XG5jb25zdCB0b1N0cmluZyA9IHJlcXVpcmUoXCIuL3RvLXN0cmluZ1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoaXMgRXJyb3IgaW5zdGFuY2UgdG8gYSBKU09OIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm4ge29iamVjdH1cbiAgICAgKi9cbiAgICBFcnJvci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBqc29uaWZ5RXJyb3IodGhpcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoaXMgRXJyb3IgaW5zdGFuY2UgdG8gdGhlIGZ1bGwgc3RyaW5naWZpY2F0aW9uXG4gICAgICogb2YgaXRzIEpTT04gcmVwcmVzZW50YXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFthbW91bnRPZlNwYWNlcz00XSBUaGUgYW1vdW50IG9mIHNwYWNlcyB0byB1c2VcbiAgICAgKiBmb3IgaW5kZW50YXRpb24gaW4gdGhlIG91dHB1dCBzdHJpbmcuXG4gICAgICogXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqL1xuICAgIEVycm9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGFtb3VudE9mU3BhY2VzID0gNCkge1xuICAgICAgICByZXR1cm4gdG9TdHJpbmcodGhpcywgYW1vdW50T2ZTcGFjZXMpO1xuICAgIH07XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGpzb25pZnlFcnJvciA9IHJlcXVpcmUoXCIuL2pzb25pZnktZXJyb3JcIik7XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGdpdmVuIGVycm9yIHRvIGEgYmlnIHN0cmluZyByZXByZXNlbnRhdGlvbiwgY29udGFpbmluZ1xuICogdGhlIHdob2xlIGRhdGEgZnJvbSBpdHMgSlNPTiByZXByZXNlbnRhdGlvbi5cbiAqIFxuICogQHBhcmFtIHtlcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIGJlIGNvbnZlcnRlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbYW1vdW50T2ZTcGFjZXM9NF0gVGhlIGFtb3VudCBvZiBzcGFjZXMgdG8gdXNlXG4gKiBmb3IgaW5kZW50YXRpb24gaW4gdGhlIG91dHB1dCBzdHJpbmcuXG4gKiBcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gSWYgdGhlIGdpdmVuIGVycm9yIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBFcnJvclxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU3RyaW5nKGVycm9yLCBhbW91bnRPZlNwYWNlcyA9IDQpIHtcbiAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcImpzb25pZnlFcnJvci50b1N0cmluZygpIGVycm9yOiBGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGluc3RhbmNlIG9mIEVycm9yLlwiKTtcbiAgICBjb25zdCBhc0pTT04gPSBqc29uaWZ5RXJyb3IoZXJyb3IpO1xuICAgIHJldHVybiBgJHthc0pTT04uY2xhc3NOYW1lfTogJHthc0pTT04ubWVzc2FnZX0gJHtKU09OLnN0cmluZ2lmeShhc0pTT04sIG51bGwsIGFtb3VudE9mU3BhY2VzKX1gO1xufTsiXX0=
