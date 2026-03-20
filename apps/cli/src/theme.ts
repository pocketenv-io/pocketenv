import chalk from "chalk";

export const c = {
  primary: (s: string | number) => chalk.rgb(0, 232, 198)(s),
  secondary: (s: string | number) => chalk.rgb(0, 198, 232)(s),
  accent: (s: string | number) => chalk.rgb(130, 100, 255)(s),
  highlight: (s: string | number) => chalk.rgb(100, 232, 130)(s),
  muted: (s: string | number) => chalk.rgb(200, 210, 220)(s),
  link: (s: string | number) => chalk.rgb(255, 160, 100)(s),
  sky: (s: string | number) => chalk.rgb(0, 210, 255)(s),
};
