import { Collaborator } from "@/types/projects"

export default function formatData(collaborators: string[], shares: number[]) {
  return collaborators.map((collaborator, index) => {
    const obj: Collaborator = {
      id: index.toString(),
      address: collaborator,
      share: Number(shares[index]),
    }
    return obj
  })
}
