locals {
  workspace_prefix = "aila-project-"
}

resource "terraform_data" "workspace_validation" {
  lifecycle {
    precondition {
      condition     = startswith(terraform.workspace, local.workspace_prefix)
      error_message = "Workspace name \"${terraform.workspace}\" must begin with ${local.workspace_prefix}"
    }
  }
}

module "vercel" {
  source                           = "github.com/oaknational/oak-terraform-modules//modules/vercel_project?ref=v1.3.9"
  build_type                       = "website"
  cloudflare_zone_domain           = var.cloudflare_zone_domain
  # Env vars managed by Doppler, not Terraform
  environment_variables            = []
  framework                        = "nextjs"
  project_visibility               = "public"
  git_repo                         = "oaknational/oak-ai-lesson-assistant"
  root_directory                   = "apps/nextjs"
  build_command                    = "turbo build"
  ignore_command                   = "bash vercel-ignore-build.sh"
  production_branch                = "production"
  protection_bypass_for_automation = true

  # TODO: Add ["labs.thenational.academy"] after migrating from old Vercel project
  domains = []
}
