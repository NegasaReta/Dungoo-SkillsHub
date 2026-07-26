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

LANGUAGES = [
    "amharic",
    "english",
    "afaan_oromo",
    "tigrinya",
    "somali",
    "other",
]

# --- Peer language exchange (FR-2) ---------------------------------------------

# A subset of LANGUAGES: these are the four the partner pool actually covers.
# Offering "somali" or "other" here would return an empty result every time, which
# reads as a broken feature rather than an honest gap.
EXCHANGE_LANGUAGES = [
    "amharic",
    "afaan_oromo",
    "tigrinya",
    "english",
]

# Slugs, not display text, so the UI can translate them (NFR: localisation).
EXCHANGE_LEVELS = [
    "beginner",
    "intermediate",
    "advanced",
]

# Sentinel for "do not filter on this". Not a value any peer can hold.
ANY = "any"
