import React, { memo, useCallback, useEffect, useState } from "react"
import { SquareContainer } from "../frames/SquareContainer"
import { CarouselFrame } from "../../components/frames/CarouselFrame"
import style from "./Carousel.module.scss"
import cs from "classnames"
import Link from "next/link"
import Image from 'next/image'
import { AutomatedProgressBar } from "./AutomatedProgressBar"
import classNames from "classnames"
import utilStyles from '../../styles/utils.module.css';

interface CalculateItemPositionAndOpacityPayload {
  isActive: boolean;
  show: boolean;
  divStyle: React.CSSProperties;
}

type CalculateItemPositionAndOpacity = (data: {
  idx: number;
  cursor: number;
  totalItems: number;
}) => CalculateItemPositionAndOpacityPayload;

interface CarouselProps {
  srcs: string[];
  authors: string[];
  blogTitles: string[];
  blogUrls: string[];
  onChangeCursor: (cursorPos: number) => void;
}

const maxTimeSec = 5
const _Carousel = ({
  srcs,
  authors,
  blogTitles,
  blogUrls,
  onChangeCursor
  }: CarouselProps) => {
    const [cursor, setCursor] = useState(0)
    const [counterInSec, setCounterInSec] = useState(0);

    const calculateItemPositionAndOpacity =
    useCallback<CalculateItemPositionAndOpacity>(
      ({ idx, cursor, totalItems }) => {
        if (totalItems === 1)
          return { isActive: true, show: true, divStyle: {} }

        const isCursorAfterLoopStart = cursor + 1 >= totalItems
        const isCursorBeforeLoopEnd = cursor - 1 < 0
        const isBeforeActive = isCursorBeforeLoopEnd
          ? idx === totalItems - 1
          : idx === cursor - 1
        const isActive = idx === cursor
        const isAfterActive = isCursorAfterLoopStart
          ? idx === 0
          : idx === cursor + 1

        const data = {
          isActive: isActive,
          show: isBeforeActive || isAfterActive,
        } as CalculateItemPositionAndOpacityPayload
        if (isBeforeActive) {
          data.divStyle = {
            transform: `translateX(calc(${-1} * (75%)))`,
          }
          return data
        }
        if (isAfterActive && isCursorAfterLoopStart) {
          data.divStyle = {
            transform: `translateX(calc(${1} * (75%)))`,
          }
          return data
        }
        data.divStyle =
          isActive || isBeforeActive || isAfterActive
            ? {
                transform: `translateX(calc(${idx - cursor} * (75%)))`,
              }
            : {}
        return data
      },
      []
    )

    useEffect(() => {
      const interval = setInterval(() => {
        setCounterInSec((sec) => sec + 1)
      }, 1000)
      return () => clearInterval(interval)
    }, [])
    useEffect(() => {
      if (counterInSec > maxTimeSec) {
        setCursor((oldCursor) => {
          return oldCursor === srcs.length - 1
            ? 0
            : oldCursor + 1
        })
        setCounterInSec(0)
      }
    }, [counterInSec, srcs.length])
    useEffect(() => {
      onChangeCursor(cursor)
    }, [cursor, onChangeCursor])

    return (
      <div className={style.cycler}>
        {srcs.map((src, idx) => {

          const itemData = calculateItemPositionAndOpacity( {idx, cursor, totalItems: srcs.length} );
          const author = authors[idx];
          const blogTitle = blogTitles[idx];
          const blogUrl = blogUrls[idx];
  
          return (
            <div key={idx} style={itemData.divStyle} className={classNames({ [style.show]: itemData.show, [style.is_active]: itemData.isActive, })} >
              <div className={cs({ [style.square]: itemData.isActive })} >
                <Link href={blogUrl}>
                    <SquareContainer className={cs(style.square_container)}>
                      <CarouselFrame borderWidth={0} >
                        <Image priority src={src} alt={blogTitles[idx]} height={1000} width={1000} />
                      </CarouselFrame>
                    </SquareContainer>
                </Link>
              <div className={style.details}>
                {itemData.isActive ?? (
                  <AutomatedProgressBar
                    percent={(counterInSec * 100) / maxTimeSec}
                    className={style.progress_bar}
                  />
                )}
                <div className={style.infos}>
                <Image
                    priority
                    src={"/images/" + author + ".png"}
                    height={50}
                    width={50}
                    alt={author}
                    className={utilStyles.borderCircle}
                  />
                  <div className={style.infos_text}>
                    <Link href={blogUrl} className={style.title_url}>
                        <h4>
                          {blogTitle}{" "}
                          <span className={style.iteration}>
                          </span>
                        </h4>
                    </Link>
                    <div className={style.creator}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              <div className={style.owner}>
              </div>
          </div>
        )
      })}
    </div>
  )
}

export const Carousel = memo(_Carousel)