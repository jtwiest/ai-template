import { Artifact } from "@/lib/types"
import { ArtifactCard } from "./ArtifactCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface ArtifactListProps {
  artifacts: Artifact[]
  onEdit: (artifact: Artifact) => void
  onDelete: (id: string) => void
  onSelect: (artifact: Artifact) => void
}

export function ArtifactList({ artifacts, onEdit, onDelete, onSelect }: ArtifactListProps) {
  const [search, setSearch] = useState("")

  const filteredArtifacts = artifacts.filter(
    (artifact) =>
      artifact.title.toLowerCase().includes(search.toLowerCase()) ||
      artifact.content.toLowerCase().includes(search.toLowerCase()) ||
      artifact.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artifacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{search ? "No artifacts found" : "No artifacts yet"}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
