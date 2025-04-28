import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function ForumTags({
  initialSelectedTags = [],
  onTagsChange,
  editable = false,
}) {
  const [selectedTags, setSelectedTags] = useState(
    new Set(initialSelectedTags)
  );

  const availableTags = [
    "c++",
    "java",
    "syntax error",
    "general question",
    "javascript",
    "python",
    "html",
    "css",
    "react",
    "node.js",
  ];

  // Function to determine tag color
  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();

    switch (tagLower) {
      case "c++":
        return "bg-black text-white hover:bg-black/90";
      case "java":
        return "bg-amber-800 text-white hover:bg-amber-900";
      case "syntax error":
        return "bg-red-600 text-white hover:bg-red-700";
      case "general question":
        return "bg-amber-200 text-amber-900 hover:bg-amber-300";
      case "javascript":
        return "bg-orange-500 text-white hover:bg-orange-600";
      case "python":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "html":
        return "bg-sky-400 text-white hover:bg-sky-500";
      case "css":
        return "bg-sky-500 text-white hover:bg-sky-600";
      case "react":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "node.js":
        return "bg-green-500 text-white hover:bg-green-600";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white";
    }
  };

  // Initialize selectedTags once when component mounts or when initialSelectedTags changes
  useEffect(() => {
    // Compare arrays to avoid unnecessary updates
    const currentTags = Array.from(selectedTags);
    const areArraysEqual =
      currentTags.length === initialSelectedTags.length &&
      currentTags.every((tag, i) => tag === initialSelectedTags[i]);

    if (!areArraysEqual) {
      setSelectedTags(new Set(initialSelectedTags));
    }
  }, [initialSelectedTags]);

  // Notify parent of changes, but avoid infinite loop
  const toggleTag = (tag) => {
    if (!editable) return; // Only allow toggling if component is editable

    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);

    // Call onTagsChange directly here instead of in useEffect
    if (onTagsChange) {
      onTagsChange(Array.from(newSelectedTags));
    }
  };

  // For view-only mode, just show the selected tags
  if (!editable) {
    return (
      <div className="flex flex-wrap gap-2">
        {initialSelectedTags.length === 0 ? (
          <em className="text-muted-foreground">No tags</em>
        ) : (
          initialSelectedTags.map((tag) => (
            <Badge
              key={tag}
              className={`${getTagColor(tag)} px-3 py-1.5 text-sm font-medium`}
            >
              {tag}
            </Badge>
          ))
        )}
      </div>
    );
  }

  // For editable mode, show both available tags and selected tags
  return (
    <div className="space-y-4">
      <div className="discussion-tags flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            className={`cursor-pointer ${getTagColor(tag)} ${
              selectedTags.has(tag) ? "ring-2 ring-offset-1" : ""
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Selected Tags:</p>
        <div className="flex flex-wrap gap-2">
          {selectedTags.size === 0 ? (
            <em className="text-muted-foreground">No tags selected</em>
          ) : (
            Array.from(selectedTags).map((tag) => (
              <Badge
                key={tag}
                className={`${getTagColor(
                  tag
                )} px-3 py-1.5 text-sm font-medium`}
              >
                {tag}
                <span
                  className="ml-1 px-1 cursor-pointer hover:bg-black/10 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                >
                  ×
                </span>
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
