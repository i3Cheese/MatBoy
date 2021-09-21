import axios from "axios";
import {Response} from "./types";
import {Post, PostBasics} from "../types/models";


export const postServices = {
    getTourPosts: async function getTourPosts(tourId: number, which: "published"|"archived"|"all" = "published") {
        const {data: res} = await axios.get<Response<{posts: PostBasics[]}>>(
            `/api/post?tournament_id=${tourId}&which=${which}`
        );
        return res.posts;
    },
    get: async function (postId: number) {
        const {data: res} = await axios.get<Response<PostResponse>>(`/api/post/${postId}`);
        return res.post;
    },
    postNew: async function (tourId: number, data : any) {
        data.tournament_id = tourId;
        const {data: res} = await axios.post<Response<PostResponse>>(`/api/post`, data);
        return res.post;
    },
    edit: async function (postId: number, data: any) {
        const {data: res} = await axios.put<Response<PostResponse>>(`/api/post/${postId}`, data);
        return res.post;
    },
    archivePost: function(postId: number) {
        return postStatusChanger(postId, {action: "archive"});
    },
    publishPost: function(postId: number) {
        return postStatusChanger(postId, {action: "publish"});
    },
}

async function postStatusChanger(postId: number, data: any){
    await axios.put<Response<PostResponse>>(`/api/post/${postId}/status`, data);
    // return res.post;
}

interface PostResponse {
    post: Post,
}

export default postServices;