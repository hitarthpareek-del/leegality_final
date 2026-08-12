const {
    createLeegalityClient,
} = require("../utils/axiosClient");

async function createSigningRequest(
    company,
    type,
    payload
) {
    const client =
        createLeegalityClient(company);

    const requestPayload = {
        ...payload,
    };

    switch (type?.toLowerCase()) {

        case "nda":
            requestPayload.profileId =
                company.profiles.nda;
            break;

        case "appointment":
            requestPayload.profileId =
                company.profiles.appointment;
            break;

        default:
            throw new Error(
                "Invalid document type."
            );
    }

    const { data } =
        await client.post(
            "/v3.0/sign/request",
            requestPayload
        );

    return data;
}

module.exports = {
    createSigningRequest,
};