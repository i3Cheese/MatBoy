import React, {FC, useEffect, useRef} from "react";
import {ReplacePropsWithoutRef} from "../helpers/componentTypes";
import {Ya} from "yandex-share";
import {makeAbsoluteUrl} from "../helpers/links";
import classnames from "classnames";

import './Share.scss'

export interface ShareButtonProps {
    relativeUrl?: string,
    url?: string,
    title: string,
    description: string,
}

export const ShareButton: FC<ReplacePropsWithoutRef<'div', ShareButtonProps>> = ({relativeUrl, url, title, description,className, ...props})=>{
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current !== null) {
            const share = Ya.share2(ref.current, {
                content: {
                    url: url || (relativeUrl && makeAbsoluteUrl(relativeUrl)),
                    title: title,
                    description: description,
                },
                theme: {
                    limit: 0,
                    moreButtonType: "short",
                    curtain: true,
                    services:"vkontakte,facebook,telegram,twitter",
                }
            })
            return () => {ref.current !== null && share.destroy()};
        } else {
            // return () => {};
        }
    }, [ref.current])
    return <div ref={ref} className={classnames("ShareButton", className)} {...props}/>
}