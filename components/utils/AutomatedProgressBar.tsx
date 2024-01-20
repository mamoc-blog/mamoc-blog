import React from "react"
import style from "./AutomatedProgressBar.module.scss"
import cs from "classnames"

interface Props {
  percent: number
  className?: string
}
export const AutomatedProgressBar = ({ percent, className }: Props) => {
  const divStyle = { right: `${100 - (percent >= 100 ? 100 : percent)}%` }
  return (
    <div className={cs(style.container, className)}>
      <div style={divStyle} />
    </div>
  )
}