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
              "The current status of the sandbox, e.g. 'STARTED', 'STOPPED', etc.",
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
            type: "ref",
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewBasic",
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
      envVar: {
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
      secrets: {
        type: "array",
        items: {
          type: "ref",
          description: "A secret to add to the sandbox",
          ref: "lex:io.pocketenv.sandbox.defs#secret",
        },
      },
      envs: {
        type: "array",
        items: {
          type: "ref",
          description: "An environment variable to add to the sandbox",
          ref: "lex:io.pocketenv.sandbox.defs#envVar",
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
            ref: "lex:io.pocketenv.sandbox.defs#sandboxViewDetailed",
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
            author: {
              type: "string",
              description: "Filter sandboxes by author did or handle",
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
  IoPocketenvActorGetProfile: "io.pocketenv.actor.getProfile",
  AppBskyActorProfile: "app.bsky.actor.profile",
  IoPocketenvSandboxClaimSandbox: "io.pocketenv.sandbox.claimSandbox",
  IoPocketenvSandboxCreateSandbox: "io.pocketenv.sandbox.createSandbox",
  IoPocketenvSandboxDefs: "io.pocketenv.sandbox.defs",
  IoPocketenvSandboxDeleteSandbox: "io.pocketenv.sandbox.deleteSandbox",
  IoPocketenvSandboxGetSandbox: "io.pocketenv.sandbox.getSandbox",
  IoPocketenvSandboxGetSandboxes: "io.pocketenv.sandbox.getSandboxes",
  IoPocketenvSandbox: "io.pocketenv.sandbox",
  IoPocketenvSandboxStartSandbox: "io.pocketenv.sandbox.startSandbox",
  IoPocketenvSandboxStopSandbox: "io.pocketenv.sandbox.stopSandbox",
  IoPocketenvPublicKey: "io.pocketenv.publicKey",
  ComAtprotoRepoStrongRef: "com.atproto.repo.strongRef",
};
