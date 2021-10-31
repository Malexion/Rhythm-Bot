export interface MediaItem {
    type: string;
    url: string;
    requestor?: string;
    name?: string;
    duration?: string;
    isLive?:boolean;
    description?:string;
}
