angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/angular-schema-form-base64-file-upload.html","<div class=\"angular-schema-form--base64-file\">\n  <label ng-hide=\"form.notitle\">{{form.title}}</label>\n  <div base64-file-upload=\"form\" sf-field-model schema-validate=\"form\">\n    <label>\n      <input type=\"file\" class=\"base64-file--input\" style=\"display:none;\" ng-disabled=\"file\"/>\n      <div class=\"base64-file--drop-area\" ng-class=\"{\'file-hovering\': dropAreaHover}\">\n\n        <div class=\"base64-file--file\" ng-show=\"file\">\n          <div class=\"base64-file--file-preview\"\n               ng-style=\"{\'background-image\': isImage(file) ? \'url(\' + file.src + \')\': \'\'}\">\n            <span ng-show=\"!isImage(file)\">{{file.ext}}</span>\n          </div>\n          <div class=\"base64-file--file-name\">{{file.name}}</div>\n          <div class=\"base64-file--file-size\">{{file.humanSize}}</div>\n          <div class=\"base64-file--file-remove\" ng-click=\"removeFile($event)\">&#10005</div>\n        </div>\n\n        <span ng-show=\"!file\" class=\"base64-file--drop-area-description\">{{form.placeholder || \'Click here or drop files to upload\'}}</span>\n      </div>\n    </label>\n  </div>\n  <span sf-message=\"form.description\"></span>\n</div>\n");}]);
angular.module('angularSchemaFormBase64FileUpload', [
  'schemaForm',
  'templates'
]).config(function(schemaFormDecoratorsProvider, sfBuilderProvider) {

  schemaFormDecoratorsProvider.defineAddOn(
    'bootstrapDecorator',           // Name of the decorator you want to add to.
    'file',                      // Form type that should render this add-on
    'src/templates/angular-schema-form-base64-file-upload.html',  // Template name in $templateCache
    sfBuilderProvider.stdBuilders   // List of builder functions to apply.
  );

});

angular.module('angularSchemaFormBase64FileUpload').directive('base64FileUpload', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: true,
      link: function(scope, element, attrs, ngModel) {
        scope.ngModel = ngModel;
        scope.dropAreaHover = false;
        scope.file = undefined;
        scope.fileImagePreview = '';

        var validateFile = function(file) {
          var valid = true;
          var schema = scope.$eval(attrs.base64FileUpload).schema;

          if (file.size > parseInt(schema.maxSize, 10)) {
            valid = false;
          }

          return valid;
        }

        var getFile = function(file) {
          if (!file) {
            return;
          }

          if (!validateFile(file)) {
            // validate
            return;
          }

          $timeout(function() {
            scope.file = file;
            scope.file.ext = file.name.split('.').slice(-1)[0];
            scope.file.src = URL.createObjectURL(file);

            // just a simple conversion to human readable size.
            // For now not bothering with large sizes.
            var fileSize = file.size / 1024;
            var unit = 'kB';
            if (fileSize > 1024) {
              fileSize = fileSize / 1024;
              unit = 'MB';
            }

            scope.file.humanSize = fileSize.toFixed(1) + ' ' + unit;
          }, 0);

          var reader = new FileReader();

          reader.onloadstart = function(e) {
            $timeout(function() {
              scope.loadingFile = true;
            }, 0);
          }

          reader.onload = function(e) {
            $timeout(function() {
              scope.loadingFile = false;
            }, 0);

            ngModel.$setViewValue(e.target.result);
          };

          reader.readAsDataURL(file);
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
          ngModel.$setViewValue(undefined);
        }

        element.find('input').bind('change', function(e) {
          getFile(e.target.files[0]);
        });

        var dropArea = document.getElementsByClassName('base64-file--drop-area')[0];

        dropArea.addEventListener("dragenter", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = true;
          }, 0);
        }, false);

        dropArea.addEventListener("dragleave", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = false;
          }, 0);
        }, false);

        dropArea.addEventListener("dragover", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = true;
          }, 0);
        }, false);

        dropArea.addEventListener("drop", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = false;
          }, 0);
          getFile(e.dataTransfer.files[0]);
        }, false);

      },
    };
  }
]);
