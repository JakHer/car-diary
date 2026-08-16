export const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(' ')

export const cardStyles =
  'rounded-large border border-border bg-surface shadow-card'

export const eyebrowStyles =
  'm-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase'

export const brandStyles =
  'inline-flex items-center gap-3 font-[750] text-strong no-underline'

export const brandMarkStyles =
  'grid size-10 place-items-center rounded-xl bg-accent text-xs tracking-[0.06em] text-white'

export const inverseBrandMarkStyles =
  'grid size-10 place-items-center rounded-xl bg-white text-xs tracking-[0.06em] text-accent'

export const sectionHeadingStyles =
  'flex items-start justify-between gap-5'

export const sectionTitleStyles =
  'm-0 text-[22px] font-bold tracking-[-0.025em] text-strong'

export const fieldStyles =
  'grid gap-2 text-[13px] font-bold text-strong'

export const inputStyles =
  'h-[46px] w-full rounded-[10px] border border-border-strong bg-surface px-[13px] text-sm font-medium text-strong outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-light focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'

export const textareaStyles =
  'min-h-[90px] w-full resize-y rounded-[10px] border border-border-strong bg-surface px-[13px] py-3 text-sm font-medium text-strong outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-light focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'

export const formGridStyles =
  'grid grid-cols-2 gap-5 max-[700px]:grid-cols-1'

export const buttonStyles =
  'min-h-[46px] cursor-pointer rounded-[10px] border-0 px-[18px] text-sm font-[750] transition-[transform,background-color] duration-150 hover:-translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-soft disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0'

export const primaryButtonStyles = `${buttonStyles} bg-accent text-white hover:bg-accent-hover`

export const secondaryButtonStyles = `${buttonStyles} bg-surface-muted text-strong hover:bg-border`

export const tagStyles =
  'rounded-[7px] bg-surface-muted px-[9px] py-[5px] text-xs font-bold text-muted'

export const smallActionStyles =
  'cursor-pointer rounded-md border-0 bg-surface-muted px-2 py-[5px] text-[11px] font-bold text-muted transition-colors duration-150 hover:bg-border hover:text-strong focus-visible:bg-border focus-visible:text-strong'

export const dangerActionStyles = `${smallActionStyles} hover:bg-[#fbeaea] hover:text-[#a62b2b] focus-visible:bg-[#fbeaea] focus-visible:text-[#a62b2b]`

export const iconActionStyles =
  'grid size-9 shrink-0 cursor-pointer place-items-center rounded-[9px] border border-border bg-surface p-0 text-muted shadow-sm transition-[border-color,box-shadow,background-color,color] hover:border-border-strong hover:bg-surface-muted hover:text-strong focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:cursor-wait disabled:opacity-65'

export const dangerIconActionStyles = `${iconActionStyles} hover:border-[#efb4b4] hover:bg-[#fbeaea] hover:text-[#a62b2b] focus-visible:border-[#efb4b4] focus-visible:bg-[#fbeaea] focus-visible:text-[#a62b2b] focus-visible:shadow-[0_0_0_3px_rgba(166,43,43,0.08)]`

export const formErrorStyles =
  'm-0 rounded-[9px] bg-[#fff2f2] px-3 py-[11px] text-[13px] leading-[1.45] text-[#852424]'

export const fieldErrorStyles =
  'm-0 text-xs font-semibold leading-[1.4] text-[#a62b2b]'

export const invalidControlStyles =
  'border-[#d78585] shadow-[0_0_0_3px_rgba(166,43,43,0.08)]'
