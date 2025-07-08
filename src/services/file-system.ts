import { fileOpen, fileSave, supported } from 'browser-fs-access'

export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null

  async selectExportDirectory(): Promise<void> {
    if (!supported) {
      throw new Error('File System Access API not supported')
    }

    try {
      this.directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      })
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        throw new Error('Directory selection cancelled')
      }
      throw error
    }
  }

  async saveFile(
    filename: string,
    content: string | Blob,
    mimeType: string = 'text/plain'
  ): Promise<void> {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })

    try {
      await fileSave(blob, {
        fileName: filename,
        extensions: [this.getExtension(filename)],
      })
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        throw new Error('Save cancelled')
      }
      throw error
    }
  }

  async saveToDirectory(
    filename: string,
    content: string | Blob,
    subdirectory?: string
  ): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected')
    }

    let targetDir = this.directoryHandle

    // Create subdirectory if specified
    if (subdirectory) {
      targetDir = await this.directoryHandle.getDirectoryHandle(subdirectory, {
        create: true,
      })
    }

    // Create file handle
    const fileHandle = await targetDir.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()

    const blob = content instanceof Blob ? content : new Blob([content])
    await writable.write(blob)
    await writable.close()
  }

  async loadFile(): Promise<{ content: string; filename: string }> {
    const file = await fileOpen({
      mimeTypes: ['text/*', 'application/json'],
    })

    const content = await file.text()
    return { content, filename: file.name }
  }

  async createResearchFolder(researchTitle: string): Promise<string> {
    if (!this.directoryHandle) {
      await this.selectExportDirectory()
    }

    const sanitizedTitle = this.sanitizeFilename(researchTitle)
    const timestamp = new Date().toISOString().split('T')[0]
    const folderName = `${timestamp}_${sanitizedTitle}`

    await this.directoryHandle!.getDirectoryHandle(folderName, { create: true })
    return folderName
  }

  private getExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50)
  }

  get hasDirectory(): boolean {
    return this.directoryHandle !== null
  }

  get directoryName(): string {
    return this.directoryHandle?.name || 'No directory selected'
  }
}

export const fileSystemService = new FileSystemService()