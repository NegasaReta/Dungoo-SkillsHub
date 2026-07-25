EDUCATION_LEVELS = [
    "high_school",
    "tvet",
    "diploma",
    "bachelor",
    "master",
    "phd",
    "other",
]

INDUSTRIES = [
    "tech",
    "engineering",
    "health",
    "finance",
    "education",
    "agriculture",
    "manufacturing",
    "hospitality",
    "retail",
    "other",
]

# The ten largest languages of Ethiopia, ordered by share of speakers in the 2007
# census. Slugs already in use are kept as they are so profiles saved earlier stay
# valid.
ETHIOPIAN_LANGUAGES = [
    "afaan_oromo",
    "amharic",
    "somali",
    "tigrinya",
    "sidamo",
    "wolaytta",
    "gurage",
    "afar",
    "hadiyya",
    "gamo",
]

# The ten most spoken languages worldwide by first- plus second-language speakers
# (Ethnologue). English leads both this list and the country's second-language use.
INTERNATIONAL_LANGUAGES = [
    "english",
    "mandarin",
    "hindi",
    "spanish",
    "arabic",
    "french",
    "bengali",
    "portuguese",
    "indonesian",
    "urdu",
]

LANGUAGES = [*ETHIOPIAN_LANGUAGES, *INTERNATIONAL_LANGUAGES, "other"]
