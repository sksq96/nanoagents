"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, AlertCircle } from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface LogSelectorProps {
  onSelectLog: (logFile: string) => void
  selectedLog?: string
  directory: string
}

export function LogSelector({ onSelectLog, selectedLog, directory }: LogSelectorProps) {
  const [logFiles, setLogFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchLogFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/logs?directory=${encodeURIComponent(directory)}`)
      const data = await response.json()
      setLogFiles(data.logs)
    } catch (error) {
      console.error("Failed to fetch log files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (directory) {
      fetchLogFiles()
    }
  }, [directory])

  const handleDeleteClick = (e: React.MouseEvent, file: string) => {
    e.stopPropagation() // Prevent selecting the log when clicking delete
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/logs/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directory,
          filename: fileToDelete
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // If the deleted file was selected, clear the selection
        if (selectedLog === fileToDelete) {
          onSelectLog('')
        }
        
        // Refresh the file list
        fetchLogFiles()
        
        toast({
          title: "File deleted",
          description: `Successfully deleted ${fileToDelete}`,
        })
      } else {
        throw new Error(data.error || 'Failed to delete file')
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Conversation Logs</h2>
      
      {logFiles.length === 0 ? (
        <div className="text-sm text-muted-foreground p-2 border rounded-md">
          No log files found in {directory}
        </div>
      ) : (
        <div className="space-y-1">
          {logFiles.map((file) => (
            <div key={file} className="flex items-center group">
              <Button
                variant={selectedLog === file ? "secondary" : "ghost"}
                className="w-full justify-start text-sm h-auto py-2 px-3 font-normal group-hover:pr-10"
                onClick={() => onSelectLog(file)}
              >
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 absolute right-1"
                onClick={(e) => handleDeleteClick(e, file)}
                aria-label={`Delete ${file}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the log file <span className="font-semibold">{fileToDelete}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

