from pydantic import BaseModel, ConfigDict, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class PracticeTextRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "I have went to the meeting yesterday and tell them about the report.",
                "conversation_history": [],
            }
        }
    )

    message: str = Field(min_length=1)
    conversation_history: list[ChatMessage] = Field(default_factory=list)


class Correction(BaseModel):
    original: str
    fix: str
    explanation: str


class PracticeTextResponse(BaseModel):
    corrected_text: str
    errors: list[Correction]
    follow_up: str
