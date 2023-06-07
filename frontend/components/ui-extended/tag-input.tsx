import React, { useEffect, useState } from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { LucideXCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import { Separator } from "../ui/separator"

type Checked = DropdownMenuCheckboxItemProps["checked"]

const KeyCodes = {
  comma: 188,
  enter: 13,
  space: 32,
} as const

const delimiters: number[] = [KeyCodes.comma, KeyCodes.enter, KeyCodes.space]

type TagInputProps = {
  options: string[]
  onChange?: (tags: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({ options, onChange }) => {
  const [tags, setTags] = useState<string[]>([])
  const [checked, setChecked] = React.useState<Checked[]>(
    Array(options.length).fill(false)
  )
  const [inputValue, setInputValue] = useState<string>("")

  const addTag = (tag: string, index?: number) => {
    if (tags.find((t) => t.toLowerCase() === tag.toLowerCase()) || tag === "")
      return

    setTags([...tags, tag.toLowerCase()])

    const i = index ?? options.findIndex((o) => o === tag)
    if (i === -1) return

    setChecked((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })
  }

  const removeTag = (tag: string, index?: number) => {
    setTags(tags.filter((t) => t !== tag))

    const i = index ?? options.findIndex((o) => o === tag)
    if (i === -1) return

    setChecked((prev) => {
      const next = [...prev]
      next[i] = false
      return next
    })
  }

  const onCheckedChange = (checked: Checked, index: number) => {
    if (checked) {
      addTag(options[index], index)
    } else {
      removeTag(options[index], index)
    }
  }

  // We need both onChange & onKeyDown because the latter won't catch the value if pasted
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (delimiters.includes(e.keyCode)) {
      e.preventDefault()
      addTag(inputValue.trim())
      setInputValue("")
    }
  }

  const onTagClick = (index: number) => {
    console.log("The tag at index " + index + " was clicked")
  }

  useEffect(() => {
    if (onChange) onChange(tags)
  }, [tags])

  return (
    <div className="grid gap-2">
      <Separator className="mb-4" />
      <span className=" mb-2 text-sm font-medium leading-none">Tags</span>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap">
              Select existing tags
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {options.map((option, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                checked={checked[index]}
                onCheckedChange={(checked) => onCheckedChange(checked, index)}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Enter a new tag and press enter/space"
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          max={30}
        />
      </div>
      <div className="flex wrap gap-2">
        {tags.sort().map((tag, i) => (
          <Badge
            key={i}
            className="flex items-center gap-2"
            variant="secondary"
            onClick={() => onTagClick(i)}
          >
            {tag}
            <LucideXCircle
              size={16}
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
      <Separator className="mt-4" />
    </div>
  )
}

export default TagInput
