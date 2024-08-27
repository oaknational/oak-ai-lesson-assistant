# Exports

## Service account

The exports service requires a GCP service account. This service account does not need any special permissions. The Google Drive permissions model is used for data access control. i.e. the service account simply needs to have the correct privileges on the Google Drive template files.

## Permissions

The service account needs 'viewer' permissions on the template files, and 'editor' permissions on the export folder.

## Changing a template

> ⚠️ If the change doesn't require a parallel code change, and in your judgement it is minor enough, you can edit the template directly in the Google Drive. This is the quickest way to make changes. Otherwise, follow the steps below.

1. In order to change a template, starting in local development.

1. Find the template you need to update, in the `_playground/templates` folder in Google Drive.

1. Make a copy, and change the name, incrementing the version number, so **DEV::v3::My Template** becomes **DEV::v4::My Template**.

1. Make updates to the new template, until you are happy with it.

1. You can then copy the new template to the `_staging/templates` and `_production/templates` folders. And rename them appropriately.

1. You can now update the appropriate `TEMPLATE_ID`s in env.

1. If the changes require that code changes are made in parallel, then make sure to update the `TEMPLATE_ID`s immediately before you deploy the code changes.

1. Once all changes are made and tested in production, you can delete the previous version of the template in all environments.
