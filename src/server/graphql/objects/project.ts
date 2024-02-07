export class Project {
  id: string;
  name: string;
  template: string;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: string,
    name: string,
    template: string,
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.name = name;
    this.template = template;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
