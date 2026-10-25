"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-amber-400 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-zinc-400 shrink-0" />
        ),
      }}
      style={
        {
          "--normal-bg": "#161514",
          "--normal-text": "#F9F8F5",
          "--normal-border": "#2C2926",
          "--border-radius": "0.375rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#161514] group-[.toaster]:text-[#F9F8F5] group-[.toaster]:border-[#2C2926] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-md font-sans text-xs border py-3 px-4",
          description: "group-[.toast]:text-[#A5A29C] text-xs font-normal mt-0.5",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#161514] font-medium text-xs rounded-md px-2.5 py-1",
          cancelButton:
            "group-[.toast]:bg-[#2C2926] group-[.toast]:text-[#F9F8F5] text-xs rounded-md px-2.5 py-1",
          title: "font-semibold text-xs text-[#F9F8F5]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
