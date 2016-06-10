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

        var dropArea = document.getElementsByClassName('base64-file--drop-area')[0];

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

        dropArea.addEventListener("dragenter", dragOver, false);
        dropArea.addEventListener("dragleave", dragLeave, false);
        dropArea.addEventListener("dragover", dragOver, false);
        dropArea.addEventListener("drop", drop, false);

        scope.$on('$destroy', function () {
          dropArea.removeEventListener("dragenter", dragOver, false);
          dropArea.removeEventListener("dragleave", dragLeave, false);
          dropArea.removeEventListener("dragover", dragOver, false);
          dropArea.removeEventListener("drop", drop, false);
        });

      },
    };
  }
]);
