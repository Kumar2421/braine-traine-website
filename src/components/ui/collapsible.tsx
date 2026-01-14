import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.Trigger

const CollapsibleContent = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ ...props }, ref) => (
    React.createElement(CollapsiblePrimitive.Content, { ref, ...props })
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
