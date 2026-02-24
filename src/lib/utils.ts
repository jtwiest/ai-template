import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ArtifactReference {
  id: string
  displayText: string
  start: number
  end: number
}

/**
 * Parse artifact references from text.
 * Supports formats: [artifact:id] or [artifact:id|display text]
 * Examples:
 *   [artifact:abc123] -> { id: 'abc123', displayText: 'artifact' }
 *   [artifact:abc123|My Document] -> { id: 'abc123', displayText: 'My Document' }
 */
export function parseArtifactReferences(text: string): ArtifactReference[] {
  const references: ArtifactReference[] = []
  const regex = /\[artifact:([^\]|]+)(?:\|([^\]]+))?\]/g

  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    references.push({
      id: match[1],
      displayText: match[2] || 'artifact',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return references
}

/**
 * Split text into segments with artifact references identified
 */
export interface TextSegment {
  type: 'text' | 'artifact'
  content: string
  artifactId?: string
  displayText?: string
}

export function segmentTextWithArtifacts(text: string): TextSegment[] {
  const references = parseArtifactReferences(text)

  if (references.length === 0) {
    return [{ type: 'text', content: text }]
  }

  const segments: TextSegment[] = []
  let lastIndex = 0

  for (const ref of references) {
    // Add text before the reference
    if (ref.start > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, ref.start),
      })
    }

    // Add the artifact reference
    segments.push({
      type: 'artifact',
      content: text.slice(ref.start, ref.end),
      artifactId: ref.id,
      displayText: ref.displayText,
    })

    lastIndex = ref.end
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return segments
}
