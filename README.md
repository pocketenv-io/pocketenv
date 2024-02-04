[![pokeball](https://cdn3.emoji.gg/emojis/pokeball.png)](https://emoji.gg/emoji/pokeball)

# Pocketenv

Pocketenv is a simple and lightweight tool to manage development workspace environments. It allows you to define and manage workspaces for your projects, and easily switch between them.

![preview](./.github/images/preview.png)


> [!NOTE]
> `Pocketenv Workspaces` are just Docker Containers with some preinstalled tools, volumes, and [vscode tunnel](https://code.visualstudio.com/docs/remote/tunnels) as an entry point.

> [!IMPORTANT]
> Pocketenv is still in development and not ready for production use.

## 🚚 Installation

```bash
 deno install --unstable -A -f -n pocketenv https://cdn.jsdelivr.net/gh/pocketenv-io/pocketenv@main/main.ts
 ```

## 🚀 Usage

```bash
pocketenv --help

Usage:   pocketenv
Version: 0.1.0    

Description:

                                                                         
  .                                                                      
       ____             __        __                                     
      / __ \____  _____/ /_____  / /____  ____ _   __                    
     / /_/ / __ \/ ___/ //_/ _ \/ __/ _ \/ __ \ | / /                    
    / ____/ /_/ / /__/ ,< /  __/ /_/  __/ / / / |/ /                     
   /_/    \____/\___/_/|_|\___/\__/\___/_/ /_/|___/                      
                                                                         
    https://pocketenv.io - Manage your development environment with ease.
                                                                         

Options:

  -h, --help     - Show this help.                            
  -V, --version  - Show the version number for this program.  

Commands:

  init   [name]       - Generate a new Pocketenv workspace      
  up     [workspace]  - Start the Pocketenv workspace           
  down   [workspace]  - Stop the Pocketenv workspace            
  list                - List all Pocketenv workspaces           
  shell  [workspace]  - Start a shell in the Pocketenv workspace
```