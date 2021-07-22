export interface MenuItem  {
    priority: number,
    url: string,
    title: string,
}

export function createMenuItem(priority: number, url: string, title?: string) : MenuItem {
    return {priority, url, title: title || "загрузка..."};
}