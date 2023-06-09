"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface OptionProps {
  label: string
  value: string
}

interface ComboboxComponentProps {
  options: OptionProps[]
  header: string | React.ReactNode
  type: string
  canClear?: boolean
  closeAfterSelect?: boolean
  onChange: (value: string) => void
}

const ComboboxComponent: React.FC<ComboboxComponentProps> = ({
  options,
  header,
  type,
  canClear = false,
  closeAfterSelect = true,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="mb-4 flex items-center gap-4">
        <span>{header}</span>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : `Select ${type}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${type}...`} />
            <CommandEmpty>No {type} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={(currentValue: string) => {
                    const newValue = currentValue === value ? "" : currentValue
                    setValue(newValue)
                    onChange(newValue)
                    if (closeAfterSelect) setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
        {canClear ? (
          <Button
            variant="outline"
            onClick={() => {
              setValue("")
              onChange("")
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </Popover>
  )
}

export default ComboboxComponent
