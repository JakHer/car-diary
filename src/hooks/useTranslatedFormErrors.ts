import { useEffect, useRef } from 'react'
import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormTrigger,
} from 'react-hook-form'

export const useTranslatedFormErrors = <Values extends FieldValues>(
  language: string | undefined,
  errors: FieldErrors<Values>,
  trigger: UseFormTrigger<Values>,
) => {
  const previousLanguage = useRef(language)

  useEffect(() => {
    if (previousLanguage.current === language) return
    previousLanguage.current = language

    const errorFields = Object.keys(errors) as Array<FieldPath<Values>>
    if (errorFields.length > 0) void trigger(errorFields)
  }, [errors, language, trigger])
}
