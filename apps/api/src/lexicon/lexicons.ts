/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type LexiconDoc, Lexicons } from "@atproto/lexicon";

export const schemaDict = {
  IoPocketenvActorDefs: {
    lexicon: 1,
    id: "io.pocketenv.actor.defs",
    defs: {
      profileViewDetailed: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique identifier of the actor.",
          },
          did: {
            type: "string",
            description: "The DID of the actor.",
          },
          handle: {
            type: "string",
            description: "The handle of the actor.",
          },
          displayName: {
            type: "string",
            description: "The display name of the actor.",
          },
          avatar: {
            type: "string",
            description: "The URL of the actor's avatar image.",
            format: "uri",
          },
          createdAt: {
            type: "string",
            description: "The date and time when the actor was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description: "The date and time when the actor was last updated.",
            format: "datetime",
          },
        },
      },
    },
  },
  IoPocketenvActorGetActorSandboxes: {
    lexicon: 1,
    id: "io.pocketenv.actor.getActorSandboxes",
    defs: {
      main: {
        type: "query",
        description: "Get all sandboxes for a given actor",
        parameters: {
          type: "params",
          required: ["did"],
          properties: {
            did: {
              type: "string",
              description: "The DID or handle of the actor",
              format: "at-identifier",
            },
            limit: {
              type: "integer",
              description: "The maximum number of sandboxes to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of sandboxes to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              sandboxes: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.sandbox.defs#sandboxViewDetailed",
                },
              },
              total: {
                type: "integer",
                description: "The total number of sandboxes available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvActorGetProfile: {
    lexicon: 1,
    id: "io.pocketenv.actor.getProfile",
    defs: {
      main: {
        type: "query",
        description: "Get the profile of an actor",
        parameters: {
          type: "params",
          properties: {
            did: {
              type: "string",
              description: "The DID or handle of the actor",
              format: "at-identifier",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.actor.defs#profileViewDetailed",
          },
        },
      },
    },
  },
  IoPocketenvActorGetTerminalToken: {
    lexicon: 1,
    id: "io.pocketenv.actor.getTerminalToken",
    defs: {
      main: {
        type: "query",
        description: "Get a terminal token",
        parameters: {
          type: "params",
          properties: {},
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              token: {
                type: "string",
                description:
                  "An access token that can be used to authenticate with the terminal service. This token is typically short-lived and should be used immediately to establish a connection with the terminal.",
              },
            },
          },
        },
      },
    },
  },
  AppBskyActorProfile: {
    lexicon: 1,
    id: "app.bsky.actor.profile",
    defs: {
      main: {
        type: "record",
        description: "A declaration of a Bluesky account profile.",
        key: "literal:self",
        record: {
          type: "object",
          properties: {
            displayName: {
              type: "string",
              maxGraphemes: 64,
              maxLength: 640,
            },
            description: {
              type: "string",
              description: "Free-form profile description text.",
              maxGraphemes: 256,
              maxLength: 2560,
            },
            avatar: {
              type: "blob",
              description:
                "Small image to be displayed next to posts from account. AKA, 'profile picture'",
              accept: ["image/png", "image/jpeg"],
              maxSize: 1000000,
            },
            banner: {
              type: "blob",
              description:
                "Larger horizontal image to display behind profile view.",
              accept: ["image/png", "image/jpeg"],
              maxSize: 10000000,
            },
            labels: {
              type: "union",
              description:
                "Self-label values, specific to the Bluesky application, on the overall account.",
              refs: ["lex:com.atproto.label.defs#selfLabels"],
            },
            joinedViaStarterPack: {
              type: "ref",
              ref: "lex:com.atproto.repo.strongRef",
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
        },
      },
    },
  },
  IoPocketenvFileAddFile: {
    lexicon: 1,
    id: "io.pocketenv.file.addFile",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                type: "ref",
                ref: "lex:io.pocketenv.file.defs#file",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvFileDefs: {
    lexicon: 1,
    id: "io.pocketenv.file.defs",
    defs: {
      file: {
        type: "object",
        required: ["path", "content"],
        properties: {
          sandboxId: {
            type: "string",
            description:
              "The ID of the sandbox to which the file belongs. This is used to associate the file with a specific sandbox environment.",
          },
          path: {
            type: "string",
            description:
              "The file path within the sandbox, e.g. '/app/config.json', '/home/user/.ssh/id_rsa', etc.",
          },
          content: {
            type: "string",
            description:
              "The content of the file. This will be written to the specified path within the sandbox. The content should be base64 encoded if it's binary data.",
          },
        },
      },
      fileView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the file.",
          },
          path: {
            type: "string",
            description:
              "The file path within the sandbox, e.g. '/app/config.json', '/home/user/.ssh/id_rsa', etc.",
          },
          createdAt: {
            type: "string",
            description: "The timestamp when the file was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description: "The timestamp when the file was last updated.",
            format: "datetime",
          },
        },
      },
      files: {
        type: "array",
        items: {
          type: "ref",
          description: "A file to add to the sandbox",
          ref: "lex:io.pocketenv.file.defs#file",
        },
      },
    },
  },
  IoPocketenvFileDeleteFile: {
    lexicon: 1,
    id: "io.pocketenv.file.deleteFile",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The ID of the file to delete",
            },
          },
        },
      },
    },
  },
  IoPocketenvFileGetFile: {
    lexicon: 1,
    id: "io.pocketenv.file.getFile",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The ID of the file to retrieve.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              file: {
                type: "ref",
                ref: "lex:io.pocketenv.file.defs#fileView",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvFileGetFiles: {
    lexicon: 1,
    id: "io.pocketenv.file.getFiles",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
            sandboxId: {
              type: "string",
              description: "The ID of the sandbox for which to retrieve files.",
            },
            limit: {
              type: "integer",
              description: "The maximum number of files to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of files to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.file.defs#fileView",
                },
              },
              total: {
                type: "integer",
                description: "The total number of files available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvFileUpdateFile: {
    lexicon: 1,
    id: "io.pocketenv.file.updateFile",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "file"],
            properties: {
              id: {
                type: "string",
                description: "The ID of the file to delete",
              },
              file: {
                type: "ref",
                ref: "lex:io.pocketenv.file.defs#file",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvPortDefs: {
    lexicon: 1,
    id: "io.pocketenv.port.defs",
    defs: {
      portView: {
        type: "object",
        description: "A view of a port exposed by a sandbox.",
        properties: {
          port: {
            type: "integer",
            description: "The port number.",
            maximum: 65535,
            minimum: 1025,
          },
          description: {
            type: "string",
            description: "A description of the port.",
          },
          previewUrl: {
            type: "string",
            description: "A URL for previewing the service running on the port",
          },
        },
      },
    },
  },
  IoPocketenvSandboxClaimSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.claimSandbox",
    defs: {
      main: {
        type: "procedure",
        description: "Claim a sandbox by id",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxCreateIntegration: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.createIntegration",
    defs: {
      main: {
        type: "procedure",
        description: "Create a new integration for the sandbox.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "string",
                description: "The sandbox ID.",
              },
              name: {
                type: "string",
                description: "The name of the integration.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#integrationView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxCreateSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.createSandbox",
    defs: {
      main: {
        type: "procedure",
        description: "Create a sandbox",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["base"],
            properties: {
              base: {
                type: "string",
                description:
                  "The base sandbox URI to clone from, e.g. a template or an existing sandbox.",
              },
              name: {
                type: "string",
                description: "The name of the sandbox",
                minLength: 1,
              },
              description: {
                type: "string",
                description: "A description for the sandbox",
              },
              provider: {
                type: "string",
                description:
                  "The provider to create the sandbox on, e.g. 'daytona', 'vercel', 'cloudflare', etc.",
                enum: ["daytona", "vercel", "cloudflare", "deno", "sprites"],
              },
              topics: {
                type: "array",
                description:
                  "A list of topics/tags to associate with the sandbox",
                items: {
                  type: "string",
                  maxLength: 50,
                },
              },
              repo: {
                type: "string",
                description:
                  "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
              },
              vcpus: {
                type: "integer",
                description:
                  "The number of virtual CPUs to allocate for the sandbox",
                minimum: 1,
              },
              memory: {
                type: "integer",
                description:
                  "The amount of memory (in GB) to allocate for the sandbox",
                minimum: 1,
              },
              disk: {
                type: "integer",
                description:
                  "The amount of disk space (in GB) to allocate for the sandbox",
                minimum: 3,
              },
              readme: {
                type: "string",
                description: "A URI to a README for the sandbox.",
                format: "uri",
              },
              secrets: {
                type: "ref",
                description: "A list of secrets to add to the sandbox",
                ref: "lex:io.pocketenv.sandbox.defs#secrets",
              },
              envs: {
                type: "ref",
                description:
                  "A list of environment variables to add to the sandbox",
                ref: "lex:io.pocketenv.sandbox.defs#envs",
              },
              keepAlive: {
                type: "boolean",
                description:
                  "Prevent the sandbox from being automatically stop after a period of inactivity. Use with caution, as this may lead to increased costs.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxDefs: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.defs",
    defs: {
      sandboxViewBasic: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the sandbox",
            maxLength: 50,
          },
          provider: {
            type: "string",
            description:
              "The provider of the sandbox, e.g. 'daytona', 'vercel', 'cloudflare', etc.",
            maxLength: 50,
          },
          description: {
            type: "string",
            maxGraphemes: 300,
            maxLength: 3000,
          },
          website: {
            type: "string",
            description: "Any URI related to the sandbox",
            format: "uri",
          },
          logo: {
            type: "string",
            description: "URI to an image logo for the sandbox",
            format: "uri",
          },
          topics: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              maxLength: 50,
            },
            maxLength: 50,
          },
          repo: {
            type: "string",
            description:
              "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
          },
          readme: {
            type: "string",
            description: "A URI to a README for the sandbox.",
            format: "uri",
          },
          vcpus: {
            type: "integer",
            description: "Number of virtual CPUs allocated to the sandbox",
          },
          memory: {
            type: "integer",
            description: "Amount of memory in GB allocated to the sandbox",
          },
          disk: {
            type: "integer",
            description: "Amount of disk space in GB allocated to the sandbox",
          },
          ports: {
            type: "array",
            items: {
              type: "integer",
              maximum: 65535,
              minimum: 1025,
            },
            maxLength: 100,
          },
          installs: {
            type: "integer",
            description:
              "Number of times the sandbox has been installed by users.",
          },
          createdAt: {
            type: "string",
            format: "datetime",
          },
        },
      },
      sandboxViewDetailed: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the sandbox",
            maxLength: 50,
          },
          provider: {
            type: "string",
            description:
              "The provider of the sandbox, e.g. 'daytona', 'vercel', 'cloudflare', etc.",
            maxLength: 50,
          },
          description: {
            type: "string",
            maxGraphemes: 300,
            maxLength: 3000,
          },
          status: {
            type: "string",
            description:
              "The current status of the sandbox, e.g. 'RUNNING', 'STOPPED', etc.",
          },
          startedAt: {
            type: "string",
            format: "datetime",
          },
          timeout: {
            type: "integer",
            description: "The sandbox timeout in seconds",
          },
          baseSandbox: {
            type: "string",
            description:
              "The base sandbox that this sandbox was created from, if any. This can be used to determine the template or configuration used to create the sandbox.",
          },
          website: {
            type: "string",
            description: "Any URI related to the sandbox",
            format: "uri",
          },
          logo: {
            type: "string",
            description: "URI to an image logo for the sandbox",
            format: "uri",
          },
          topics: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              maxLength: 50,
            },
            maxLength: 50,
          },
          repo: {
            type: "string",
            description:
              "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
          },
          readme: {
            type: "string",
            description: "A URI to a README for the sandbox.",
            format: "uri",
          },
          vcpus: {
            type: "integer",
            description: "Number of virtual CPUs allocated to the sandbox",
          },
          memory: {
            type: "integer",
            description: "Amount of memory in GB allocated to the sandbox",
          },
          disk: {
            type: "integer",
            description: "Amount of disk space in GB allocated to the sandbox",
          },
          ports: {
            type: "array",
            items: {
              type: "integer",
              maximum: 65535,
              minimum: 1025,
            },
            maxLength: 100,
          },
          installs: {
            type: "integer",
            description:
              "Number of times the sandbox has been installed by users.",
          },
          createdAt: {
            type: "string",
            format: "datetime",
          },
          owner: {
            type: "ref",
            description: "The user who created the sandbox",
            ref: "lex:io.pocketenv.user.defs#userViewBasic",
          },
        },
      },
      sandboxDetailsPref: {
        type: "object",
        nullable: ["repo", "description", "topics"],
        properties: {
          name: {
            type: "string",
            description: "The name of the sandbox",
            minLength: 1,
          },
          description: {
            type: "string",
            description: "A description for the sandbox",
          },
          topics: {
            type: "array",
            description: "A list of topics/tags to associate with the sandbox",
            items: {
              type: "string",
              maxLength: 50,
            },
          },
          repo: {
            type: "string",
            description:
              "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
          },
          vcpus: {
            type: "integer",
            description:
              "The number of virtual CPUs to allocate for the sandbox",
            minimum: 1,
          },
          memory: {
            type: "integer",
            description:
              "The amount of memory (in GB) to allocate for the sandbox",
            minimum: 1,
          },
          disk: {
            type: "integer",
            description:
              "The amount of disk space (in GB) to allocate for the sandbox",
            minimum: 3,
          },
          readme: {
            type: "string",
            description: "A URI to a README for the sandbox.",
            format: "uri",
          },
        },
      },
      secretPref: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the secret",
            minLength: 1,
          },
          value: {
            type: "string",
            description:
              "The value of the secret. This will be encrypted at rest and redacted in any API responses.",
          },
        },
      },
      variablePref: {
        type: "object",
        description: "A variable to add to the sandbox",
        properties: {
          name: {
            type: "string",
            description: "The name of the variable",
            minLength: 1,
          },
          value: {
            type: "string",
            description:
              "The value of the variable. This will be visible in API responses and should not contain sensitive information.",
          },
        },
      },
      filePref: {
        type: "object",
        description: "A file to add to the sandbox",
        properties: {
          name: {
            type: "string",
            description: "The name of the file",
            minLength: 1,
          },
          content: {
            type: "string",
            description: "The content of the file.",
          },
          encrypt: {
            type: "boolean",
            description:
              "Whether the file content should be encrypted at rest and redacted in API responses. This is useful for files that may contain sensitive information.",
          },
          path: {
            type: "string",
            description:
              "The path within the sandbox where the file will be created, e.g. '/app/config.json'. If not provided, the file will be created in the root directory of the sandbox.",
          },
        },
      },
      volumePref: {
        type: "object",
        description: "A volume to add to the sandbox",
        properties: {
          name: {
            type: "string",
            description: "The name of the volume",
            minLength: 1,
          },
          path: {
            type: "string",
            description:
              "The mount path within the sandbox where the volume will be attached, e.g. '/data', '/logs', etc.",
          },
          readOnly: {
            type: "boolean",
            description: "Whether the volume should be mounted as read-only",
          },
        },
      },
      preferences: {
        type: "array",
        items: {
          type: "union",
          refs: [
            "lex:io.pocketenv.sandbox.defs#sandboxDetailsPref",
            "lex:io.pocketenv.sandbox.defs#secretPref",
            "lex:io.pocketenv.sandbox.defs#variablePref",
            "lex:io.pocketenv.sandbox.defs#filePref",
            "lex:io.pocketenv.sandbox.defs#volumePref",
          ],
        },
      },
      sshKeysView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the SSH key.",
          },
          publicKey: {
            type: "string",
            description: "The public SSH key.",
          },
          privateKey: {
            type: "string",
            description: "The private SSH key (redacted in API responses)",
          },
          createdAt: {
            type: "string",
            description: "The timestamp when the SSH key was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description: "The timestamp when the SSH key was last updated.",
            format: "datetime",
          },
        },
      },
      tailscaleAuthKeyView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the Tailscale Auth Key.",
          },
          authKey: {
            type: "string",
            description: "The Tailscale auth key (redacted in API responses)",
          },
          redacted: {
            type: "string",
            description: "The redacted Auth Key.",
          },
          createdAt: {
            type: "string",
            description:
              "The timestamp when the Tailscale Auth Key was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description:
              "The timestamp when the Tailscale Auth Key was last updated.",
            format: "datetime",
          },
        },
      },
      integrationView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the integration.",
          },
          name: {
            type: "string",
            description:
              "The name of the integration, e.g. 'GitHub', 'Slack', 'Trello', etc.",
          },
          webhookUrl: {
            type: "string",
            description: "The webhook URL of the integration.",
            format: "uri",
          },
          createdAt: {
            type: "string",
            description: "The timestamp when the integration was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description: "The timestamp when the integration was last updated.",
            format: "datetime",
          },
        },
      },
      integrationsView: {
        type: "array",
        items: {
          type: "ref",
          description: "An integration connected to the sandbox",
          ref: "lex:io.pocketenv.sandbox.defs#integrationView",
        },
      },
    },
  },
  IoPocketenvSandboxDeleteSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.deleteSandbox",
    defs: {
      main: {
        type: "procedure",
        description: "Delete a sandbox by uri",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxExec: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.exec",
    defs: {
      main: {
        type: "procedure",
        description: "Execute a command in a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["command"],
            properties: {
              command: {
                type: "string",
                description: "The command to execute in the sandbox.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              stdout: {
                type: "string",
                description: "The output of the executed command.",
              },
              stderr: {
                type: "string",
                description:
                  "The error output of the executed command, if any.",
              },
              exitCode: {
                type: "integer",
                description: "The exit code of the executed command.",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxExposePort: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.exposePort",
    defs: {
      main: {
        type: "procedure",
        description: "Expose a port for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["port"],
            properties: {
              port: {
                type: "integer",
                description: "The port number to expose.",
                maximum: 65535,
                minimum: 1025,
              },
              description: {
                type: "string",
                description: "A description of the port.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            nullable: ["previewUrl"],
            properties: {
              previewUrl: {
                type: "string",
                description: "The preview URL for the exposed port.",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxExposeVscode: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.exposeVscode",
    defs: {
      main: {
        type: "procedure",
        description:
          "Expose an instance of VS Code for a sandbox. This allows users to access a web-based version of VS Code that is connected to their sandbox environment, enabling them to edit code, manage files, and perform other development tasks directly from their browser.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            nullable: ["previewUrl"],
            properties: {
              previewUrl: {
                type: "string",
                description: "The preview URL for the exposed port.",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetExposedPorts: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getExposedPorts",
    defs: {
      main: {
        type: "query",
        description: "Get the list of exposed ports for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              ports: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.port.defs#portView",
                },
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetIntegrations: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getIntegrations",
    defs: {
      main: {
        type: "query",
        description: "Get the integrations for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#integrationsView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetPreferences: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getPreferences",
    defs: {
      main: {
        type: "query",
        description: "Get sandbox preferences",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID or URI to retrieve",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#preferences",
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getSandbox",
    defs: {
      main: {
        type: "query",
        description: "Get a sandbox by ID or URI",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID or URI to retrieve",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetSandboxes: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getSandboxes",
    defs: {
      main: {
        type: "query",
        description: "Get all sandboxes",
        parameters: {
          type: "params",
          properties: {
            limit: {
              type: "integer",
              description: "The maximum number of sandboxes to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of sandboxes to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              sandboxes: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
                },
              },
              total: {
                type: "integer",
                description: "The total number of sandboxes available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetSshKeys: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getSshKeys",
    defs: {
      main: {
        type: "query",
        description: "Get the SSH keys for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sshKeysView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetTailscaleAuthKey: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getTailscaleAuthKey",
    defs: {
      main: {
        type: "query",
        description: "Get the Tailscale token for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#tailscaleAuthKeyView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxGetTailscaleToken: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.getTailscaleToken",
    defs: {
      main: {
        type: "query",
        description: "Get the Tailscale token for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#tailscaleTokenView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxPutPreferences: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.putPreferences",
    defs: {
      main: {
        type: "procedure",
        description: "Update sandbox preferences.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["sandboxId", "preferences"],
            properties: {
              sandboxId: {
                type: "string",
                description: "The sandbox ID or URI",
              },
              preferences: {
                type: "ref",
                ref: "lex:io.pocketenv.sandbox.defs#preferences",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxPutSshKeys: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.putSshKeys",
    defs: {
      main: {
        type: "procedure",
        description: "Add or update SSH keys for a sandbox.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "privateKey", "publicKey"],
            properties: {
              id: {
                type: "string",
                description: "The sandbox ID.",
              },
              privateKey: {
                type: "string",
                description: "The private SSH key (encrypted)",
              },
              publicKey: {
                type: "string",
                description: "The public SSH key.",
              },
              redacted: {
                type: "string",
                description: "The redacted SSH key.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sshKeysView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxPutTailscaleAuthKey: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.putTailscaleAuthKey",
    defs: {
      main: {
        type: "procedure",
        description:
          "Store a Tailscale Auth Key for the sandbox. This Auth Key will be used to authenticate with the Tailscale API and manage the sandbox's Tailscale node.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "authKey"],
            properties: {
              id: {
                type: "string",
                description: "The sandbox ID.",
              },
              authKey: {
                type: "string",
                description:
                  "The Tailscale Auth Key (encrypted) to store for the sandbox.",
              },
              redacted: {
                type: "string",
                description: "The redacted SSH key.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#tailscaleAuthKeyView",
          },
        },
      },
    },
  },
  IoPocketenvSandboxPutTailscaleToken: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.putTailscaleToken",
    defs: {
      main: {
        type: "procedure",
        description:
          "Store a Tailscale token for the sandbox. This token will be used to authenticate with the Tailscale API and manage the sandbox's Tailscale node.",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "token"],
            properties: {
              id: {
                type: "string",
                description: "The sandbox ID.",
              },
              token: {
                type: "string",
                description:
                  "The Tailscale token (encrypted) to store for the sandbox.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#tailscaleTokenView",
          },
        },
      },
    },
  },
  IoPocketenvSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          required: ["name", "createdAt"],
          properties: {
            name: {
              type: "string",
              description: "Name of the sandbox",
              maxLength: 255,
            },
            base: {
              type: "ref",
              description:
                "A strong reference to the base template for the sandbox environment.",
              ref: "lex:com.atproto.repo.strongRef",
            },
            provider: {
              type: "string",
              description:
                "The provider of the sandbox, e.g. 'daytona', 'vercel', 'cloudflare', etc.",
              maxLength: 50,
            },
            description: {
              type: "string",
              maxGraphemes: 300,
              maxLength: 3000,
            },
            website: {
              type: "string",
              description: "Any URI related to the sandbox",
              format: "uri",
            },
            logo: {
              type: "string",
              description: "URI to an image logo for the sandbox",
              format: "uri",
            },
            topics: {
              type: "array",
              items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
              },
              maxLength: 50,
            },
            repo: {
              type: "string",
              description:
                "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
            },
            readme: {
              type: "string",
              description: "A URI to a README for the sandbox.",
              format: "uri",
            },
            vcpus: {
              type: "integer",
              description: "Number of virtual CPUs allocated to the sandbox",
            },
            memory: {
              type: "integer",
              description: "Amount of memory in GB allocated to the sandbox",
            },
            disk: {
              type: "integer",
              description:
                "Amount of disk space in GB allocated to the sandbox",
            },
            volumes: {
              type: "array",
              items: {
                type: "string",
                description:
                  "A path to be mounted as a volume in the sandbox, e.g. '/data', '/logs', etc.",
              },
            },
            ports: {
              type: "array",
              items: {
                type: "integer",
                description:
                  "A port number that is exposed by the sandbox environment.",
              },
            },
            secrets: {
              type: "array",
              items: {
                type: "string",
                description:
                  "Name of a secret to be added to the sandbox environment. Secrets are typically encrypted and stored securely, and can be used to store sensitive information such as API keys, database credentials, etc.",
              },
            },
            envs: {
              type: "array",
              items: {
                type: "string",
                description:
                  "Name of an environment variable to be added to the sandbox environment.",
              },
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxStartSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.startSandbox",
    defs: {
      main: {
        type: "procedure",
        description: "Start a sandbox",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              repo: {
                type: "string",
                description:
                  "The git repository URL to clone into the sandbox before starting it. Optional.",
              },
              keepAlive: {
                type: "boolean",
                description:
                  "Prevent the sandbox from being automatically stop after a period of inactivity. Use with caution, as this may lead to increased costs.",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxStopSandbox: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.stopSandbox",
    defs: {
      main: {
        type: "procedure",
        description: "Stop a sandbox",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
          },
        },
      },
    },
  },
  IoPocketenvSandboxUnexposePort: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.unexposePort",
    defs: {
      main: {
        type: "procedure",
        description: "Unexpose a port for a sandbox.",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The sandbox ID.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["port"],
            properties: {
              port: {
                type: "integer",
                description: "The port number to unexpose.",
                maximum: 65535,
                minimum: 1024,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSandboxUpdateSandboxSettings: {
    lexicon: 1,
    id: "io.pocketenv.sandbox.updateSandboxSettings",
    defs: {
      main: {
        type: "procedure",
        description: "Update sandbox settings",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the sandbox",
                minLength: 1,
              },
              description: {
                type: "string",
                description: "A description for the sandbox",
              },
              topics: {
                type: "array",
                description:
                  "A list of topics/tags to associate with the sandbox",
                items: {
                  type: "string",
                  maxLength: 50,
                },
              },
              repo: {
                type: "string",
                description:
                  "A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo.",
                format: "uri",
              },
              vcpus: {
                type: "integer",
                description:
                  "The number of virtual CPUs to allocate for the sandbox",
                minimum: 1,
              },
              memory: {
                type: "integer",
                description:
                  "The amount of memory (in GB) to allocate for the sandbox",
                minimum: 1,
              },
              disk: {
                type: "integer",
                description:
                  "The amount of disk space (in GB) to allocate for the sandbox",
                minimum: 3,
              },
              readme: {
                type: "string",
                description: "A URI to a README for the sandbox.",
                format: "uri",
              },
              secrets: {
                type: "ref",
                description: "A list of secrets to add to the sandbox",
                ref: "lex:io.pocketenv.secret.defs#secrets",
              },
              variables: {
                type: "ref",
                description:
                  "A list of environment variables to add to the sandbox",
                ref: "lex:io.pocketenv.variable.defs#variables",
              },
              files: {
                type: "ref",
                description: "A list of files to add to the sandbox",
                ref: "lex:io.pocketenv.file.defs#file",
              },
              volumes: {
                type: "ref",
                description: "A list of volumes to add to the sandbox",
                ref: "lex:io.pocketenv.volume.defs#volumes",
              },
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#profileViewDetailed",
          },
        },
      },
    },
  },
  IoPocketenvSecretAddSecret: {
    lexicon: 1,
    id: "io.pocketenv.secret.addSecret",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["secret"],
            properties: {
              secret: {
                type: "ref",
                ref: "lex:io.pocketenv.secret.defs#secret",
              },
              redacted: {
                type: "string",
                description: "The redacted secret value.",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSecretDefs: {
    lexicon: 1,
    id: "io.pocketenv.secret.defs",
    defs: {
      secretView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the secret.",
          },
          name: {
            type: "string",
            description:
              "Name of the secret, e.g. 'DATABASE_URL', 'SSH_KEY', etc.",
          },
        },
      },
      secret: {
        type: "object",
        required: ["name", "value"],
        properties: {
          sandboxId: {
            type: "string",
            description:
              "The ID of the sandbox to which the secret belongs. This is used to associate the secret with a specific sandbox environment.",
          },
          name: {
            type: "string",
            description:
              "Name of the secret, e.g. 'DATABASE_URL', 'SSH_KEY', etc.",
          },
          value: {
            type: "string",
            description:
              "Value of the secret. This will be encrypted at rest and redacted in any API responses.",
          },
        },
      },
      secrets: {
        type: "array",
        items: {
          type: "ref",
          description: "A secret to add to the sandbox",
          ref: "lex:io.pocketenv.secret.defs#secret",
        },
      },
    },
  },
  IoPocketenvSecretDeleteSecret: {
    lexicon: 1,
    id: "io.pocketenv.secret.deleteSecret",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The ID of the secret to delete",
            },
          },
        },
      },
    },
  },
  IoPocketenvSecretGetSecret: {
    lexicon: 1,
    id: "io.pocketenv.secret.getSecret",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description:
                "The ID of the secret for which to retrieve secrets.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              secret: {
                type: "ref",
                ref: "lex:io.pocketenv.secret.defs#secretView",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSecretGetSecrets: {
    lexicon: 1,
    id: "io.pocketenv.secret.getSecrets",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
            sandboxId: {
              type: "string",
              description:
                "The ID of the sandbox for which to retrieve secrets.",
            },
            limit: {
              type: "integer",
              description: "The maximum number of secrets to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of secrets to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              secrets: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.secret.defs#secretView",
                },
              },
              total: {
                type: "integer",
                description: "The total number of secrets available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvSecretUpdateSecret: {
    lexicon: 1,
    id: "io.pocketenv.secret.updateSecret",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "secret"],
            properties: {
              id: {
                type: "string",
                description: "The ID of the secret to update.",
              },
              secret: {
                type: "ref",
                ref: "lex:io.pocketenv.secret.defs#secret",
              },
              redacted: {
                type: "string",
                description: "The redacted secret value.",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceAddService: {
    lexicon: 1,
    id: "io.pocketenv.service.addService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["sandboxId"],
          properties: {
            sandboxId: {
              type: "string",
              description:
                "The ID of the sandbox to which the service belongs.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["service"],
            properties: {
              service: {
                type: "ref",
                ref: "lex:io.pocketenv.service.defs#service",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceDefs: {
    lexicon: 1,
    id: "io.pocketenv.service.defs",
    defs: {
      serviceView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the service.",
          },
          name: {
            type: "string",
            description: "Name of the service.",
          },
          command: {
            type: "string",
            description: "Command to run the service.",
          },
          description: {
            type: "string",
            description: "Description of the service.",
          },
          ports: {
            type: "array",
            items: {
              type: "integer",
            },
          },
          createdAt: {
            type: "string",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            format: "datetime",
          },
        },
      },
      service: {
        type: "object",
        required: ["name", "command"],
        properties: {
          name: {
            type: "string",
            description: "Name of the service.",
          },
          command: {
            type: "string",
            description: "Command to run the service.",
          },
          description: {
            type: "string",
            description: "Description of the service.",
          },
          ports: {
            type: "array",
            items: {
              type: "integer",
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceDeleteService: {
    lexicon: 1,
    id: "io.pocketenv.service.deleteService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["serviceId"],
          properties: {
            serviceId: {
              type: "string",
              description: "The ID of the service to delete.",
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceGetServices: {
    lexicon: 1,
    id: "io.pocketenv.service.getServices",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          required: ["sandboxId"],
          properties: {
            sandboxId: {
              type: "string",
              description:
                "The ID of the sandbox for which to retrieve services.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              services: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.service.defs#serviceView",
                },
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceRestartService: {
    lexicon: 1,
    id: "io.pocketenv.service.restartService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["serviceId"],
          properties: {
            serviceId: {
              type: "string",
              description: "The ID of the service to restart.",
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceStartService: {
    lexicon: 1,
    id: "io.pocketenv.service.startService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["serviceId"],
          properties: {
            serviceId: {
              type: "string",
              description: "The ID of the service to start.",
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceStopService: {
    lexicon: 1,
    id: "io.pocketenv.service.stopService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["serviceId"],
          properties: {
            serviceId: {
              type: "string",
              description: "The ID of the service to stop.",
            },
          },
        },
      },
    },
  },
  IoPocketenvServiceUpdateService: {
    lexicon: 1,
    id: "io.pocketenv.service.updateService",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["serviceId"],
          properties: {
            serviceId: {
              type: "string",
              description: "The ID of the service to delete.",
            },
          },
        },
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["service"],
            properties: {
              service: {
                type: "ref",
                ref: "lex:io.pocketenv.service.defs#service",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVariableAddVariable: {
    lexicon: 1,
    id: "io.pocketenv.variable.addVariable",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["variable"],
            properties: {
              variable: {
                type: "ref",
                ref: "lex:io.pocketenv.variable.defs#variable",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVariableDefs: {
    lexicon: 1,
    id: "io.pocketenv.variable.defs",
    defs: {
      variableView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the environment variable.",
          },
          name: {
            type: "string",
            description:
              "Name of the environment variable, e.g. 'NODE_ENV', 'PORT', etc.",
          },
          value: {
            type: "string",
            description:
              "Value of the environment variable. This will be visible in API responses and should not contain sensitive information.",
          },
        },
      },
      variable: {
        type: "object",
        required: ["name", "value"],
        properties: {
          sandboxId: {
            type: "string",
            description:
              "The ID of the sandbox to which the environment variable belongs. This is used to associate the variable with a specific sandbox environment.",
          },
          name: {
            type: "string",
            description:
              "Name of the environment variable, e.g. 'NODE_ENV', 'PORT', etc.",
          },
          value: {
            type: "string",
            description:
              "Value of the environment variable. This will be visible in API responses and should not contain sensitive information.",
          },
        },
      },
      variables: {
        type: "array",
        items: {
          type: "ref",
          description: "An environment variable to add to the sandbox",
          ref: "lex:io.pocketenv.variable.defs#envVar",
        },
      },
    },
  },
  IoPocketenvVariableDeleteVariable: {
    lexicon: 1,
    id: "io.pocketenv.variable.deleteVariable",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The ID of the environment variable to delete",
            },
          },
        },
      },
    },
  },
  IoPocketenvVariableGetVariable: {
    lexicon: 1,
    id: "io.pocketenv.variable.getVariable",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description:
                "The ID of the variable for which to retrieve variables.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              variable: {
                type: "ref",
                ref: "lex:io.pocketenv.variable.defs#variableView",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVariableGetVariables: {
    lexicon: 1,
    id: "io.pocketenv.variable.getVariables",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
            sandboxId: {
              type: "string",
              description:
                "The ID of the sandbox for which to retrieve variables.",
            },
            limit: {
              type: "integer",
              description: "The maximum number of variables to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of variables to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              variables: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.variable.defs#variableView",
                },
              },
              total: {
                type: "integer",
                description: "The total number of variables available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVariableUpdateVariable: {
    lexicon: 1,
    id: "io.pocketenv.variable.updateVariable",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "variable"],
            properties: {
              id: {
                type: "string",
                description: "The ID of the variable to update.",
              },
              variable: {
                type: "ref",
                ref: "lex:io.pocketenv.variable.defs#variable",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVolumeAddVolume: {
    lexicon: 1,
    id: "io.pocketenv.volume.addVolume",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["volume"],
            properties: {
              volume: {
                type: "ref",
                ref: "lex:io.pocketenv.volume.defs#volume",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVolumeDefs: {
    lexicon: 1,
    id: "io.pocketenv.volume.defs",
    defs: {
      volumeView: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier of the volume.",
          },
          name: {
            type: "string",
            description: "Name of the volume, e.g. 'data-volume', 'logs', etc.",
          },
          path: {
            type: "string",
            description:
              "The path within the sandbox where the volume will be mounted, e.g. '/data', '/logs', etc.",
          },
          readOnly: {
            type: "boolean",
            description:
              "Whether the volume should be mounted as read-only within the sandbox. Defaults to false (read-write).",
          },
          createdAt: {
            type: "string",
            description: "The timestamp when the volume was created.",
            format: "datetime",
          },
          updatedAt: {
            type: "string",
            description: "The timestamp when the volume was last updated.",
            format: "datetime",
          },
        },
      },
      volumes: {
        type: "array",
        items: {
          type: "ref",
          description: "A volume to add to the sandbox",
          ref: "lex:io.pocketenv.volume.defs#volume",
        },
      },
      volume: {
        type: "object",
        required: ["name"],
        properties: {
          sandboxId: {
            type: "string",
            description:
              "The ID of the sandbox to which the volume belongs. This is used to associate the volume with a specific sandbox environment.",
          },
          name: {
            type: "string",
            description: "Name of the volume, e.g. 'data-volume', 'logs', etc.",
          },
          path: {
            type: "string",
            description:
              "The path within the sandbox where the volume will be mounted, e.g. '/data', '/logs', etc.",
          },
          readOnly: {
            type: "boolean",
            description:
              "Whether the volume should be mounted as read-only within the sandbox. Defaults to false (read-write).",
          },
        },
      },
    },
  },
  IoPocketenvVolumeDeleteVolume: {
    lexicon: 1,
    id: "io.pocketenv.volume.deleteVolume",
    defs: {
      main: {
        type: "procedure",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "The ID of the volume to delete.",
            },
          },
        },
      },
    },
  },
  IoPocketenvVolumeGetVolume: {
    lexicon: 1,
    id: "io.pocketenv.volume.getVolume",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description:
                "The ID of the volume for which to retrieve volumes.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              volume: {
                type: "ref",
                ref: "lex:io.pocketenv.volume.defs#volumeView",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVolumeGetVolumes: {
    lexicon: 1,
    id: "io.pocketenv.volume.getVolumes",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
            sandboxId: {
              type: "string",
              description:
                "The ID of the sandbox for which to retrieve volumes.",
            },
            limit: {
              type: "integer",
              description: "The maximum number of volumes to return.",
              minimum: 1,
            },
            offset: {
              type: "integer",
              description:
                "The number of volumes to skip before starting to collect the result set.",
              minimum: 0,
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: {
            type: "object",
            properties: {
              volumes: {
                type: "array",
                items: {
                  type: "ref",
                  ref: "lex:io.pocketenv.volume.defs#volumeView",
                },
              },
              total: {
                type: "integer",
                description: "The total number of volumes available.",
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvVolumeUpdateVolume: {
    lexicon: 1,
    id: "io.pocketenv.volume.updateVolume",
    defs: {
      main: {
        type: "procedure",
        input: {
          encoding: "application/json",
          schema: {
            type: "object",
            required: ["id", "volume"],
            properties: {
              id: {
                type: "string",
                description: "The ID of the volume to update.",
              },
              volume: {
                type: "ref",
                ref: "lex:io.pocketenv.volume.defs#volume",
              },
            },
          },
        },
      },
    },
  },
  IoPocketenvPublicKey: {
    lexicon: 1,
    id: "io.pocketenv.publicKey",
    defs: {
      main: {
        type: "record",
        key: "tid",
        record: {
          type: "object",
          required: ["name", "key", "createdAt"],
          properties: {
            name: {
              type: "string",
              description: "Name of the public key",
              maxLength: 255,
            },
            key: {
              type: "string",
              description:
                "The public key value, e.g. an SSH public key string.",
            },
            createdAt: {
              type: "string",
              format: "datetime",
            },
          },
        },
      },
    },
  },
  ComAtprotoRepoStrongRef: {
    lexicon: 1,
    id: "com.atproto.repo.strongRef",
    description: "A URI with a content-hash fingerprint.",
    defs: {
      main: {
        type: "object",
        required: ["uri", "cid"],
        properties: {
          uri: {
            type: "string",
            format: "at-uri",
          },
          cid: {
            type: "string",
            format: "cid",
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>;

export const schemas = Object.values(schemaDict);
export const lexicons: Lexicons = new Lexicons(schemas);
export const ids = {
  IoPocketenvActorDefs: "io.pocketenv.actor.defs",
  IoPocketenvActorGetActorSandboxes: "io.pocketenv.actor.getActorSandboxes",
  IoPocketenvActorGetProfile: "io.pocketenv.actor.getProfile",
  IoPocketenvActorGetTerminalToken: "io.pocketenv.actor.getTerminalToken",
  AppBskyActorProfile: "app.bsky.actor.profile",
  IoPocketenvFileAddFile: "io.pocketenv.file.addFile",
  IoPocketenvFileDefs: "io.pocketenv.file.defs",
  IoPocketenvFileDeleteFile: "io.pocketenv.file.deleteFile",
  IoPocketenvFileGetFile: "io.pocketenv.file.getFile",
  IoPocketenvFileGetFiles: "io.pocketenv.file.getFiles",
  IoPocketenvFileUpdateFile: "io.pocketenv.file.updateFile",
  IoPocketenvPortDefs: "io.pocketenv.port.defs",
  IoPocketenvSandboxClaimSandbox: "io.pocketenv.sandbox.claimSandbox",
  IoPocketenvSandboxCreateIntegration: "io.pocketenv.sandbox.createIntegration",
  IoPocketenvSandboxCreateSandbox: "io.pocketenv.sandbox.createSandbox",
  IoPocketenvSandboxDefs: "io.pocketenv.sandbox.defs",
  IoPocketenvSandboxDeleteSandbox: "io.pocketenv.sandbox.deleteSandbox",
  IoPocketenvSandboxExec: "io.pocketenv.sandbox.exec",
  IoPocketenvSandboxExposePort: "io.pocketenv.sandbox.exposePort",
  IoPocketenvSandboxExposeVscode: "io.pocketenv.sandbox.exposeVscode",
  IoPocketenvSandboxGetExposedPorts: "io.pocketenv.sandbox.getExposedPorts",
  IoPocketenvSandboxGetIntegrations: "io.pocketenv.sandbox.getIntegrations",
  IoPocketenvSandboxGetPreferences: "io.pocketenv.sandbox.getPreferences",
  IoPocketenvSandboxGetSandbox: "io.pocketenv.sandbox.getSandbox",
  IoPocketenvSandboxGetSandboxes: "io.pocketenv.sandbox.getSandboxes",
  IoPocketenvSandboxGetSshKeys: "io.pocketenv.sandbox.getSshKeys",
  IoPocketenvSandboxGetTailscaleAuthKey:
    "io.pocketenv.sandbox.getTailscaleAuthKey",
  IoPocketenvSandboxGetTailscaleToken: "io.pocketenv.sandbox.getTailscaleToken",
  IoPocketenvSandboxPutPreferences: "io.pocketenv.sandbox.putPreferences",
  IoPocketenvSandboxPutSshKeys: "io.pocketenv.sandbox.putSshKeys",
  IoPocketenvSandboxPutTailscaleAuthKey:
    "io.pocketenv.sandbox.putTailscaleAuthKey",
  IoPocketenvSandboxPutTailscaleToken: "io.pocketenv.sandbox.putTailscaleToken",
  IoPocketenvSandbox: "io.pocketenv.sandbox",
  IoPocketenvSandboxStartSandbox: "io.pocketenv.sandbox.startSandbox",
  IoPocketenvSandboxStopSandbox: "io.pocketenv.sandbox.stopSandbox",
  IoPocketenvSandboxUnexposePort: "io.pocketenv.sandbox.unexposePort",
  IoPocketenvSandboxUpdateSandboxSettings:
    "io.pocketenv.sandbox.updateSandboxSettings",
  IoPocketenvSecretAddSecret: "io.pocketenv.secret.addSecret",
  IoPocketenvSecretDefs: "io.pocketenv.secret.defs",
  IoPocketenvSecretDeleteSecret: "io.pocketenv.secret.deleteSecret",
  IoPocketenvSecretGetSecret: "io.pocketenv.secret.getSecret",
  IoPocketenvSecretGetSecrets: "io.pocketenv.secret.getSecrets",
  IoPocketenvSecretUpdateSecret: "io.pocketenv.secret.updateSecret",
  IoPocketenvServiceAddService: "io.pocketenv.service.addService",
  IoPocketenvServiceDefs: "io.pocketenv.service.defs",
  IoPocketenvServiceDeleteService: "io.pocketenv.service.deleteService",
  IoPocketenvServiceGetServices: "io.pocketenv.service.getServices",
  IoPocketenvServiceRestartService: "io.pocketenv.service.restartService",
  IoPocketenvServiceStartService: "io.pocketenv.service.startService",
  IoPocketenvServiceStopService: "io.pocketenv.service.stopService",
  IoPocketenvServiceUpdateService: "io.pocketenv.service.updateService",
  IoPocketenvVariableAddVariable: "io.pocketenv.variable.addVariable",
  IoPocketenvVariableDefs: "io.pocketenv.variable.defs",
  IoPocketenvVariableDeleteVariable: "io.pocketenv.variable.deleteVariable",
  IoPocketenvVariableGetVariable: "io.pocketenv.variable.getVariable",
  IoPocketenvVariableGetVariables: "io.pocketenv.variable.getVariables",
  IoPocketenvVariableUpdateVariable: "io.pocketenv.variable.updateVariable",
  IoPocketenvVolumeAddVolume: "io.pocketenv.volume.addVolume",
  IoPocketenvVolumeDefs: "io.pocketenv.volume.defs",
  IoPocketenvVolumeDeleteVolume: "io.pocketenv.volume.deleteVolume",
  IoPocketenvVolumeGetVolume: "io.pocketenv.volume.getVolume",
  IoPocketenvVolumeGetVolumes: "io.pocketenv.volume.getVolumes",
  IoPocketenvVolumeUpdateVolume: "io.pocketenv.volume.updateVolume",
  IoPocketenvPublicKey: "io.pocketenv.publicKey",
  ComAtprotoRepoStrongRef: "com.atproto.repo.strongRef",
};
