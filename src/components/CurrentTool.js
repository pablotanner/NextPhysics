

export default function CurrentTool ({selectedTool}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900">
                Current Tool:
            </label>
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                {selectedTool.toUpperCase()}
            </span>
        </div>
    )
}
