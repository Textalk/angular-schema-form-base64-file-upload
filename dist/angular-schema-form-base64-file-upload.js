angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/angular-schema-form-base64-file-upload.html","<div class=\"angular-schema-form--base64-file\" ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false}\">\n  <label class=\"control-label\" ng-hide=\"form.notitle\">{{form.title}}</label>\n  <div base64-file-upload=\"form\" sf-field-model schema-validate=\"form\">\n    <input type=\"file\" class=\"base64-file--input\" style=\"visibility:hidden;position:absolute;top:0;left:0;\" ng-disabled=\"hasFile\"/>\n    <button type=\"button\" class=\"base64-file--drop-area\" ng-class=\"{\'file-hovering\': dropAreaHover, \'has-file\': hasFile}\">\n\n      <div class=\"base64-file--file\" ng-show=\"hasFile\">\n        <div class=\"base64-file--file-preview\"\n             ng-style=\"{\'background-image\': isImage(file) ? \'url(\' + file.src + \')\': \'\'}\">\n          <span ng-show=\"!isImage(file)\">{{file.ext}}</span>\n        </div>\n        <div class=\"base64-file--file-name\">{{file.name}}</div>\n        <div class=\"base64-file--file-size\">{{file.humanSize}}</div>\n        <div class=\"base64-file--file-remove\" ng-click=\"removeFile($event)\">&#10005</div>\n      </div>\n      <span ng-hide=\"hasFile\" class=\"base64-file--drop-area-description\">{{form.placeholder || dropText}}</span>\n    </button>\n  </div>\n\n  <span class=\"help-block\" sf-message=\"form.description\"></span>\n</div>\n");}]);
angular.module('angularSchemaFormBase64FileUpload', [
  'schemaForm',
  'templates'
]).provider('base64FileUploadConfig', function() {
  this.setDropText = function (text) {
    this.dropText = text;
  };

  this.$get = function () {
    return this;
  };
}).config([
  'schemaFormProvider',
  'schemaFormDecoratorsProvider',
  'sfBuilderProvider',
  'sfPathProvider',
  function(schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

    var base64file = function(name, schema, options) {
      if (schema.type === 'string' && schema.format === 'base64') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key  = options.path;
        f.type = 'base64file';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    };

    schemaFormProvider.defaults.string.unshift(base64file);

    schemaFormDecoratorsProvider.defineAddOn(
      'bootstrapDecorator',           // Name of the decorator you want to add to.
      'base64file',                      // Form type that should render this add-on
      'src/templates/angular-schema-form-base64-file-upload.html',  // Template name in $templateCache
      sfBuilderProvider.stdBuilders   // List of builder functions to apply.
    );
  }
]);

angular.module('angularSchemaFormBase64FileUpload').directive('base64FileUpload', [
  'base64FileUploadConfig',
  '$timeout',
  function(base64FileUploadConfig, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: true,
      link: function(scope, element, attrs, ngModel) {
        scope.ngModel = ngModel;
        scope.dropAreaHover = false;
        scope.file = undefined;
        scope.fileError = false;
        scope.dropText = base64FileUploadConfig.dropText || 'Click here or drop files to upload';

        var validateFile = function(file) {
          var valid = true;
          var schema = scope.$eval(attrs.base64FileUpload).schema;

          if (file.size > parseInt(schema.maxSize, 10)) {
            valid = false;
            ngModel.$setValidity('base64FileUploadSize', false);
          } else {
            ngModel.$setValidity('base64FileUploadSize', true);
          }

          scope.$apply();

          return valid;
        }

        var getFile = function(file) {
          if (!file) {
            return;
          }

          if (!validateFile(file)) {
            return;
          }

          var reader = new FileReader();

          scope.file = file;
          scope.file.ext = file.name.split('.').slice(-1)[0];
          scope.file.src = URL.createObjectURL(file);
          scope.hasFile = true;
          // just a simple conversion to human readable size.
          // For now not bothering with large sizes.
          var fileSize = file.size / 1024;
          var unit = 'kB';
          if (fileSize > 1024) {
            fileSize = fileSize / 1024;
            unit = 'MB';
          }

          scope.file.humanSize = fileSize.toFixed(1) + ' ' + unit;

          reader.onloadstart = function(e) {
            $timeout(function() {
              scope.loadingFile = true;
            }, 0);
          }

          reader.onload = function(e) {
            $timeout(function() {
              scope.loadingFile = false;
            }, 0);
            
            var prefix = 'file:' + file.name + ';';
            ngModel.$setViewValue(prefix + e.target.result);
          };

          reader.readAsDataURL(file);
          scope.$apply();
        };

        scope.isImage = function(file) {
          if (!file) {
            return false;
          }

          return file.type.indexOf('image') > -1
        }

        scope.removeFile = function(e) {
          e.preventDefault();
          e.stopPropagation();
          scope.file = undefined;
          scope.hasFile = false;
          ngModel.$setViewValue(undefined);
        }

        element.find('input').bind('change', function(e) {
          getFile(e.target.files[0]);
        });

        var dropArea = element.find('.base64-file--drop-area')[0];
        var inputField = element.find('.base64-file--input')[0];

        var clickArea = function(e) {
          e.stopPropagation();
          inputField.click();
        }

        var dragOver = function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = true;
          }, 0);
        };

        var dragLeave = function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = false;
          }, 0);
        };

        var drop = function(e) {
          dragLeave(e);
          getFile(e.dataTransfer.files[0]);
        }

        dropArea.addEventListener("click", clickArea, false);
        dropArea.addEventListener("touchstart", clickArea, false);
        dropArea.addEventListener("dragenter", dragOver, false);
        dropArea.addEventListener("dragleave", dragLeave, false);
        dropArea.addEventListener("dragover", dragOver, false);
        dropArea.addEventListener("drop", drop, false);

        scope.$on('$destroy', function () {
          dropArea.removeEventListener("click", clickArea, false);
          dropArea.removeEventListener("touchstart", clickArea, false);
          dropArea.removeEventListener("dragenter", dragOver, false);
          dropArea.removeEventListener("dragleave", dragLeave, false);
          dropArea.removeEventListener("dragover", dragOver, false);
          dropArea.removeEventListener("drop", drop, false);
        });

      },
    };
  }
]);
