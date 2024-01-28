import style from "./CarouselFrame.module.scss"
import cs from "classnames"
import { PropsWithChildren, useContext } from "react"
import { SettingsContext } from "../utils/Theme"
import React from "react"

interface Props {
  borderWidth?: number
  children?: React.ReactNode;
}

export function CarouselFrame({
  borderWidth = 10,
  children,
}: PropsWithChildren<Props>) {
  const settings = useContext(SettingsContext)
  return (
    <div className={cs(style.root)} style={{ borderWidth }}>
      {children}
    </div>
  )
}