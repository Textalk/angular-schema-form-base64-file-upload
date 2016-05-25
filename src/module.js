angular.module('angularSchemaFormBase64FileUpload', [
  'schemaForm',
  'templates'
]).config([
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
