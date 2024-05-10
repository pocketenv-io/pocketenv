export class Project {
  id: string;
  name: string;
  template: string;
  status: string;
  containerId: string;
  createdAt: string;
  updatedAt: string;

  constructor({
    id,
    name,
    template,
    status,
    containerId,
    createdAt,
    updatedAt,
  }: Project) {
    this.id = id;
    this.name = name;
    this.template = template;
    this.status = status;
    this.containerId = containerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
