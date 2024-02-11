export class Template {
  id: string;
  name: string;
  description: string;
  logo: string;
  readme: string;
  repoUrl: string;
  packageName: string;

  constructor({
    id,
    name,
    description,
    logo,
    readme,
    repoUrl,
    packageName,
  }: Template) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.logo = logo;
    this.readme = readme;
    this.repoUrl = repoUrl;
    this.packageName = packageName;
  }
}
