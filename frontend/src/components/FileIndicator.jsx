import { FiPaperclip, FiFile } from 'react-icons/fi'

export default function FileIndicator({ fileName, isCompact = false, className = "" }) {
    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase()
        
        switch (extension) {
            case 'pdf':
                return '📄'
            case 'doc':
            case 'docx':
                return '📝'
            case 'txt':
                return '📃'
            case 'xls':
            case 'xlsx':
                return '📊'
            case 'ppt':
            case 'pptx':
                return '📊'
            default:
                return '📄'
        }
    }

    if (isCompact) {
        return (
            <div className={`inline-flex items-center gap-1 ${className}`}>
                <FiPaperclip className="text-blue-500 dark:text-blue-400" size={12} />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                    {fileName}
                </span>
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 ${className}`}>
            <div className="flex items-center gap-1">
                <FiPaperclip className="text-blue-600 dark:text-blue-400" size={14} />
                <span className="text-lg">{getFileIcon(fileName)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Document uploadé
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                    {fileName}
                </p>
            </div>
        </div>
    )
} 