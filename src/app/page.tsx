import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, Workflow } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">AI MVP Template</h1>
        <p className="text-xl text-muted-foreground">
          A flexible foundation for building AI-powered applications with conversational agents,
          document management, and workflow automation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 mb-2" />
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Converse with AI agents and maintain conversation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/chat">
              <Button className="w-full">Go to Chat</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2" />
            <CardTitle>Artifacts</CardTitle>
            <CardDescription>
              Create and manage markdown documents with agent access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/artifacts">
              <Button className="w-full">View Artifacts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Workflow className="h-8 w-8 mb-2" />
            <CardTitle>Workflows</CardTitle>
            <CardDescription>
              Run and monitor Temporal workflows with result tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/workflows">
              <Button className="w-full">View Workflows</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-muted/50">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This template provides three core features that work together to create powerful AI applications:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Chat with AI agents that can think, use tools, and reference your artifacts</li>
          <li>Store and manage markdown documents that agents can read and modify</li>
          <li>Execute complex workflows and store results for later reference</li>
        </ul>
      </div>
    </div>
  )
}
