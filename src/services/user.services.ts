import axios from "axios";

const userServices = {
    exist: async (email: string) => {
        const {data: {exist}} = await axios.get<{exist: boolean}>(`/api/user?email=${email}`);
        return exist;
    }
}

export default userServices;
