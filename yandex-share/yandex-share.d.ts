export interface YSContent {
    url?: string,
    title?: string,
    description?: string,
    image?: string,
}

export interface YSTheme {
    bare?: boolean,
    colorScheme?: "normal" | "whiteblack" | "blackwhite",
    copy?: "first" | "last" | "hidden" | "extraItem",
    curtain?: boolean,
    limit?: number,
    moreButtonType?: "short" | "long",
    services?: string,
}

export interface YSParams {
    content?: YSContent,
    theme?: YSTheme,
}

export interface YSShare {
    destroy: () => {},
}

declare const Ya: {
    share2: (el: HTMLElement | string, params: YSParams) => YSShare,
}