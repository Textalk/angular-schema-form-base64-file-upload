angular schema form base64 file upload
==============================

This add-on provides a very simple base64 file upload with drag and drop.

Usage
-----
The base64 file upload add-on adds a new form type, `base64file`, and a new default
mapping.

|  Form Type     |   Becomes    |
|:---------------|:------------:|
|  base64file    |  a base64 file upload input |


| Schema             |   Default Form type  |
|:-------------------|:------------:|
| "type": "string" and "format": "base64"   |   datepicker   |


Example
----
Schema
```
{
  "type": "object",
  "properties": {
    "image": {
      "title": "Image file",
      "type": "string",
      "format": "base64",
      "maxSize": "500000"
    }
  }
}
```
Form
```
[
  {
    "key": "image",
    "placeholder": "Click here or drop files to upload"
  }
]
```
