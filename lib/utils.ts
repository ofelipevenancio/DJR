import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString || dateString === "") {
    return "Data inválida"
  }

  try {
    // Handle different date formats
    let date: Date

    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString + "T00:00:00")
    }
    // If it's in DD/MM/YYYY format
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split("/")
      date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    }
    // Try to parse as-is
    else {
      date = new Date(dateString)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Data inválida"
    }

    return date.toLocaleDateString("pt-BR")
  } catch (error) {
    console.error("[v0] Error formatting date:", dateString, error)
    return "Data inválida"
  }
}
