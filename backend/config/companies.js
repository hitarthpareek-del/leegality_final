const companies = {
  Mediccapress: {
    name: "Mediccapress",

    token: process.env.MEDICCAPRESS_TOKEN,

    profiles: {
      appointment:
        process.env.MEDICCAPRESS_APPOINTMENT_PROFILE,

      nda:
        process.env.MEDICCAPRESS_NDA_PROFILE,
    },
  },

  Akar: {
    name: "Akar",

    token: process.env.AKAR_TOKEN,

    profiles: {
      appointment:
        process.env.AKAR_APPOINTMENT_PROFILE,

      nda:
        process.env.AKAR_NDA_PROFILE,
    },
  },
};

module.exports = companies;