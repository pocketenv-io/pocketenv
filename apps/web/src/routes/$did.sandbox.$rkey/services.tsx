import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$did/sandbox/$rkey/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$did/sandbox/$rkey/services"!</div>
}
