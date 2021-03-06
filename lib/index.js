'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  var t = babel.types;


  return {
    name: "wildcard",
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var node = path.node,
            dec = void 0;
        var src = path.node.source.value;
        var addWildcard = false,
            wildcardName = void 0;

        if (/\/\*$/.test(src)) {
          src = src.replace(/\/\*$/, '');

          for (var i = 0; i < node.specifiers.length; i++) {
            dec = node.specifiers[i];

            if (t.isImportNamespaceSpecifier(dec)) {
              addWildcard = true;
              wildcardName = dec.local.name;
              node.specifiers.splice(i, 1);
            }
          }

          var exts = state.opts.exts || ["js", "es6", "es", "jsx"];

          if (addWildcard) {
            var obj = t.variableDeclaration("const", [t.variableDeclarator(t.identifier(wildcardName), t.objectExpression([]))]);

            path.insertBefore(obj);

            var name = this.file.parserOpts.sourceFileName || this.file.parserOpts.filename;

            var files = [];
            var dir = _path3.default.join(_path3.default.dirname(name), src);

            try {
              var r = _fs3.default.readdirSync(dir);
              for (var i = 0; i < r.length; i++) {
                if (exts.indexOf(_path3.default.extname(r[i]).substring(1)) > -1) files.push(r[i]);
              }
            } catch (e) {
              console.warn('Wildcard for ' + name + ' points at ' + src + ' which is not a directory.');
              return;
            }

            for (var i = 0; i < files.length; i++) {
              var id = path.scope.generateUidIdentifier("wcImport");
              var file = files[i];
              var fancyName = file.replace(/(?!^)\.[^.\s]+$/, "");
              if (fancyName[0] === ".") fancyName = fancyName.substring(1);
              if (state.opts.noCamelCase !== true) fancyName = fancyName.match(/[A-Z][a-z]+(?![a-z])|[A-Z]+(?![a-z])|([a-zA-Z\d]+(?=-))|[a-zA-Z\d]+(?=_)|[a-z]+(?=[A-Z])|[A-Za-z0-9]+/g).map(function (s) {
                return s[0].toUpperCase() + s.substring(1);
              }).join("");
              var name;
              if (state.opts.nostrip !== true) name = "./" + _path3.default.join(src, _path3.default.basename(file));else name = "./" + _path3.default.join(src, file);

              var importDeclaration = t.importDeclaration([t.importDefaultSpecifier(id)], t.stringLiteral(name));
              var thing = t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier(wildcardName), t.identifier(fancyName)), id));

              path.insertAfter(thing);
              path.insertAfter(importDeclaration);
            }

            if (path.node.specifiers.length === 0) {
              path.remove();
            }
          }
        }
      }
    }
  };
};

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }