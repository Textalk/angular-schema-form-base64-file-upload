angular.module('angularSchemaFormBase64FileUpload', [
  'schemaForm',
  'templates'
]).config(['schemaFormDecoratorsProvider', 'sfBuilderProvider', function(schemaFormDecoratorsProvider, sfBuilderProvider) {

  schemaFormDecoratorsProvider.defineAddOn(
    'bootstrapDecorator',           // Name of the decorator you want to add to.
    'file',                      // Form type that should render this add-on
    'src/templates/angular-schema-form-base64-file-upload.html',  // Template name in $templateCache
    sfBuilderProvider.stdBuilders   // List of builder functions to apply.
  );

}]);
