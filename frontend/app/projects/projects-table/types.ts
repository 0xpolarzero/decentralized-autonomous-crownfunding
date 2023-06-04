export type ProjectTable = {
  id: string
  name: string
  status: "active" | "inactive"
  collaborators: string[]
  totalRaised: string
}
