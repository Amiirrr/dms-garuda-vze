import axios from "axios";

const api = (() => {

    const baseUrl = "https://vze-garuda-api.vercel.app";

    //AUTH
    async function Login(username, password) {
        const url = baseUrl + "/auth/login";
        const data = {
            username,
            password
        };

        const response = await axios.post(url, data)
        // console.log(response.data)
        return response;
    }

    async function Refresh() {
        const url = baseUrl + "/auth/refresh";

        try {
            const response = await axios.get(url, {
                credentials: "include",
            });
            return response;
        } catch (err) {
            console.log(err);
        }
    }

    async function Logout() {
        const url = baseUrl + "/auth/logout";

        const response = await axios.get(url);

        return response;
    }

    async function GetUsers() {
        const url = baseUrl + `/auth/list`;
        const response = await axios.get(url);
        return response;
    }

    async function CreateUser(payload) {
        const url = baseUrl + "/auth/register";
        const data_register = {
            username: payload.username,
            display_name: payload.displayName,
            password: payload.password,
            role: payload.role
        }
        const response = await axios.post(url, data_register);
        return response;
    }

    async function EditUser(id, payload) {
        const url = baseUrl + `/auth/adjust/${id}`;
        const data_user = {
            username: payload.username,
            display_name: payload.displayName,
            password: payload.password,
            role: payload.role
        }
        const response = await axios.put(url, data_user);
        return response;
    }

    async function DeleteUser(id) {
        const url = baseUrl + `/auth/takedown/${id}`;
        const response = await axios.delete(url);
        return response;
    }

    // Confirm
    async function GetConfirmLetter(page) {
        const url = baseUrl + `/confirm/${page}`;
        const response = await axios.get(url);
        return response;
    }

    async function GetConfirmLetterById(id) {
        const url = baseUrl + `/confirm/detail/${id}`;
        const response = await axios.get(url);
        return response;
    }

    async function CreateConfirm(payload) {
        const url = baseUrl + "/confirm";

        const response = await axios.post(url, payload);
        return response;
    }

    // Offering
    async function GetOfferingLetter(page) {
        const url = baseUrl + `/offer/${page}`;
        const response = await axios.get(url);
        return response;
    }

    async function CreateOffer(payload) {
        const url = baseUrl + "/offer";

        const response = await axios.post(url, payload);
        return response;
    }

    return {
        Login,
        Refresh,
        Logout,
        GetUsers,
        CreateUser,
        EditUser,
        DeleteUser,
        GetConfirmLetter,
        GetConfirmLetterById,
        CreateConfirm,

        GetOfferingLetter,
        CreateOffer
    };


})()

export default api;

