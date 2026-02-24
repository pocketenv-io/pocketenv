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
  IoPocketenvFileGetFiles: {
    lexicon: 1,
    id: "io.pocketenv.file.getFiles",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
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
                enum: ["daytona", "vercel", "cloudflare", "deno"],
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
                ref: "lex:io.pocketenv.sandbox.defs#secrets",
              },
              envs: {
                type: "ref",
                description:
                  "A list of environment variables to add to the sandbox",
                ref: "lex:io.pocketenv.sandbox.defs#envs",
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
            format: "uri",
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
              minimum: 1,
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
            format: "uri",
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
              minimum: 1,
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
            required: ["preferences"],
            properties: {
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
              format: "uri",
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
  IoPocketenvSecretGetSecrets: {
    lexicon: 1,
    id: "io.pocketenv.secret.getSecrets",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
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
  IoPocketenvVariableGetVariables: {
    lexicon: 1,
    id: "io.pocketenv.variable.getVariables",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
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
  IoPocketenvVolumeAddVolume: {
    lexicon: 1,
    id: "io.pocketenv.volume.addVolume",
    defs: {
      main: {
        type: "procedure",
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
          name: {
            type: "string",
            description: "Name of the volume, e.g. 'data-volume', 'logs', etc.",
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
  IoPocketenvVolumeGetVolumes: {
    lexicon: 1,
    id: "io.pocketenv.volume.getVolumes",
    defs: {
      main: {
        type: "query",
        parameters: {
          type: "params",
          properties: {
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
  IoPocketenvFileGetFiles: "io.pocketenv.file.getFiles",
  IoPocketenvSandboxClaimSandbox: "io.pocketenv.sandbox.claimSandbox",
  IoPocketenvSandboxCreateSandbox: "io.pocketenv.sandbox.createSandbox",
  IoPocketenvSandboxDefs: "io.pocketenv.sandbox.defs",
  IoPocketenvSandboxDeleteSandbox: "io.pocketenv.sandbox.deleteSandbox",
  IoPocketenvSandboxGetPreferences: "io.pocketenv.sandbox.getPreferences",
  IoPocketenvSandboxGetSandbox: "io.pocketenv.sandbox.getSandbox",
  IoPocketenvSandboxGetSandboxes: "io.pocketenv.sandbox.getSandboxes",
  IoPocketenvSandboxPutPreferences: "io.pocketenv.sandbox.putPreferences",
  IoPocketenvSandbox: "io.pocketenv.sandbox",
  IoPocketenvSandboxStartSandbox: "io.pocketenv.sandbox.startSandbox",
  IoPocketenvSandboxStopSandbox: "io.pocketenv.sandbox.stopSandbox",
  IoPocketenvSandboxUpdateSandboxSettings:
    "io.pocketenv.sandbox.updateSandboxSettings",
  IoPocketenvSecretAddSecret: "io.pocketenv.secret.addSecret",
  IoPocketenvSecretDefs: "io.pocketenv.secret.defs",
  IoPocketenvSecretDeleteSecret: "io.pocketenv.secret.deleteSecret",
  IoPocketenvSecretGetSecrets: "io.pocketenv.secret.getSecrets",
  IoPocketenvVariableAddVariable: "io.pocketenv.variable.addVariable",
  IoPocketenvVariableDefs: "io.pocketenv.variable.defs",
  IoPocketenvVariableDeleteVariable: "io.pocketenv.variable.deleteVariable",
  IoPocketenvVariableGetVariables: "io.pocketenv.variable.getVariables",
  IoPocketenvVolumeAddVolume: "io.pocketenv.volume.addVolume",
  IoPocketenvVolumeDefs: "io.pocketenv.volume.defs",
  IoPocketenvVolumeDeleteVolume: "io.pocketenv.volume.deleteVolume",
  IoPocketenvVolumeGetVolumes: "io.pocketenv.volume.getVolumes",
  IoPocketenvPublicKey: "io.pocketenv.publicKey",
  ComAtprotoRepoStrongRef: "com.atproto.repo.strongRef",
};
